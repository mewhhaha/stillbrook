import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, FeedbackLoop, H2, Prose } from "../../components";

export const article = {
  title: "Who can still wake this goroutine?",
  description:
    "Go 1.27's goroutine leak profile turns garbage-collector reachability into a liveness test: instead of listing every sleeper, it asks whether any runnable work can still reach a way to wake it.",
  published: "2026-08-15T06:17:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/who-can-still-wake-this-goroutine-journal.webp",
    alt: "Clockwork figures sleep in wooden bunks beneath bell cords while a moth tends a loose cord beside one sleeper.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const earlyReturnLeak = `
  func collect(items []Item) ([]Result, error) {
    ch := make(chan Result)

    for _, item := range items {
      go func(item Item) {
        ch <- run(item)
      }(item)
    }

    out := make([]Result, 0, len(items))
    for range items {
      r := <-ch
      if r.Err != nil {
        return nil, r.Err
      }
      out = append(out, r)
    }
    return out, nil
  }
`;

const profileCommand = `
  curl http://localhost:6060/debug/pprof/goroutineleak?debug=1
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          A normal goroutine profile is wonderfully literal. It shows the goroutines that exist. On a busy Go server,
          that can also be the problem: workers waiting on channels, idle pool members, background loops, and genuinely
          abandoned goroutines all arrive in the same stack dump. “Blocked” is a state, not a diagnosis.
        </p>
        <p>
          The current draft notes for <a href="https://go.dev/doc/go1.27">Go 1.27</a>, which is expected this August,
          add a profile with a much narrower question. <code>goroutineleak</code> reports goroutines the runtime can show
          cannot become runnable again. The interesting part is how it gets there. Go does not add a separate deadlock
          solver; it temporarily teaches the garbage collector to ask who can still wake whom.
        </p>

        <H2>Sleeping is cheap until nobody can ring the bell</H2>
        <p>
          Consider a fan-out function with an unbuffered result channel. The workers send their result back to the
          collector, but the collector returns as soon as one result contains an error:
        </p>
        <CodeBlock lang="go" title="An early return strands the remaining senders" highlight="13-15" code={earlyReturnLeak} />
        <p>
          If one worker fails quickly, the function can return while other workers are still trying to send. Their
          channel has no receiver anymore. Those goroutines stay parked, and so do their stacks and anything reachable
          through them.
        </p>
        <p>
          This is a partial deadlock rather than the dramatic kind where the whole program stops. The HTTP server may
          keep answering requests for days while a few more useless goroutines accumulate after each unlucky control
          flow. That is why a snapshot of “all blocked goroutines” is noisy: many blocked goroutines have a perfectly
          good future receiver, timer, mutex owner, or cancellation path.
        </p>

        <H2>Change the root set</H2>
        <p>
          The <a href="https://go.googlesource.com/proposal/+/refs/heads/master/design/74609-goroutine-leak-detection-gc.md">
            accepted leak-detection design
          </a>{" "}
          makes one small but consequential change to a GC cycle. A regular collection treats every goroutine stack as
          a root. Leak detection starts with only goroutines that can currently run, then follows ordinary memory
          reachability outward from them.
        </p>
        <FeedbackLoop
          steps={[
            {
              title: "Start with runnable roots",
              detail: "Blocked goroutines do not automatically keep their wait objects live for this analysis.",
            },
            {
              title: "Mark reachable memory",
              detail: "Follow pointers from the current root set through the heap.",
            },
            {
              title: "Promote wakeable sleepers",
              detail: "A goroutine blocked on a marked channel or lock becomes an eventual root.",
            },
            {
              title: "Check the fixed point",
              detail: "Stop only when another marking pass would promote nobody new.",
            },
          ]}
          returnLabel="new roots restart marking"
          caption="Leak detection grows the set of goroutines that could eventually run. Blocked goroutines left outside the fixed point are the leaks it reports."
        />
        <p>
          That iteration is the clever bit. A runnable goroutine may be able to unlock goroutine B, and B may be the
          only goroutine that can later send to goroutine C. One reachability pass would miss C. Repeating until the root
          set stops growing captures that chain without pretending every sleeper is alive.
        </p>
        <p>
          Once the fixed point is reached, the remaining blocked goroutines are reported as leaks. Then the collector
          marks from them too before sweeping, so this profile does not quietly free their stacks or change program
          semantics. The GC is being borrowed as an analyzer, not turned into a goroutine reaper.
        </p>

        <H2>The missing pointer is the evidence</H2>
        <p>
          In the early-return example, the abandoned workers still point at <code>ch</code>, but no runnable goroutine
          does. During a leak-detection cycle that distinction finally matters. The blocked sender cannot promote itself
          merely by keeping the channel reachable from its own stack.
        </p>
        <p>
          The same rule explains the detector's main limitation. If a concurrency primitive remains reachable from a
          global variable, or from a local variable in some runnable goroutine, the runtime has to assume that path may
          eventually use it. A logically dead channel can therefore look wakeable because the program kept an irrelevant
          pointer around. The proposal describes this as heap resources being over-exposed: extra reachability costs the
          detector precision.
        </p>
        <p>
          The underlying <a href="https://cs.au.dk/~amoeller/papers/golf/paper.pdf">ASPLOS 2025 work</a> makes the trade
          explicit. Its GC-based prototype is designed to avoid false accusations of deadlock, while accepting that it
          will miss some real leaks. In the paper's evaluation it detected most partial deadlocks in focused
          microbenchmarks, but only about half of those exercised by a large industrial test suite. Soundness here means
          a reported leak is meaningful; it does not mean every leak becomes visible.
        </p>

        <H2>A profile with a stronger verb</H2>
        <p>
          This changes what I want from observability tools. A CPU profile samples where time went. A heap profile shows
          what remains allocated. The ordinary goroutine profile says who exists. <code>goroutineleak</code> goes one
          step further and derives a fact from the runtime graph: this blocked goroutine has no reachable route back to
          execution.
        </p>
        <p>
          Go 1.26 shipped the mechanism behind an experiment flag. The Go 1.27 draft removes that flag and exposes the
          profile through <code>runtime/pprof</code> and the usual HTTP profiler endpoint. The detector still runs on
          demand, so normal GC cycles do not carry the extra analysis.
        </p>
        <CodeBlock lang="sh" title="Ask the live process for proven leaks" code={profileCommand} />
        <p>
          The railway buffer in the header is not interesting because a train happens to be stationary beside it. It is
          interesting because the track has ended. That is the useful distinction in this profile too: not “this
          goroutine is waiting,” but “the runtime can no longer find a path by which the wait ends.”
        </p>
      </Prose>
    </ArticleLayout>
  );
}
