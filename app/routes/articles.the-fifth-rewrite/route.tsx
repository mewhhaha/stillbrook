import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The nodes HVM5 skips",
  description:
    "HVM5 appears to gain most of its advantage by keeping more program structure as static code and allocating far less of HVM4's interaction graph at runtime.",
  published: "2026-07-12T23:20:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-fifth-rewrite.jpg",
    alt: "An aircraft engine mounted outdoors on a heavy test stand while several workers inspect the machinery.",
    credit: {
      author: "Unknown photographer, National Archives and Records Administration",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Airplanes_-_Engines_-_Aircraft_testing_field,_Packard_Motor_Co.,_Detroit,_Michigan._Engine_on_testing_stand_-_NARA_-_17338473.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const directDispatch = `
  app (Mat a b) (Inl x   : s) = app a (x:s)
  app (Mat a b) (Inr x   : s) = app b (x:s)
  app (Get b)   (Tup x y : s) = app b (x:y:s)
`;

const dupLam = `
  ! F &L = λx.f
  ----------------
  ! G &L = f
  F₀ ← λ$x0. G₀
  F₁ ← λ$x1. G₁
  x  ← &L{$x0,$x1}
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I ended <a href="/articles/the-collapse-flag">the HVM4 article</a> with a fifth loom reportedly
          threaded. Then I typed <code>HigherOrderCO/HVM5</code> into GitHub and got a 404. As far as I can
          tell, public HVM still ends at HVM4. Outsiders have a June 6 announcement and one benchmark
          screenshot for HVM5.
        </p>
        <p>
          The available material still reveals a direction. HVM5 looks less like a new calculus than a new
          boundary between code and data: keep lambdas and matches static when possible, drive them through a
          CEK-like evaluator, and stop building interaction nodes whose only job is to be consumed immediately.
        </p>

        <H2>The memory column gives it away</H2>
        <p>
          Victor Taelin&apos;s <a href="https://x.com/VictorTaelin/status/2063392469195338129">announcement</a>{" "}
          says HVM5 is done, runs about five times faster than HVM4, and keeps SupGen happy. I copied three
          rows from the attached screenshot because the headline hides the interesting part:
        </p>
        <DataTable
          head={["Benchmark", "HVM5 MB", "HVM5 M/s", "HVM4 MB", "HVM4 M/s"]}
          rows={[
            ["bits-busy-dec", 1.6, 428.4, 12161.6, 65.0],
            ["list-busy-sort", 39.7, 519.8, 14889.7, 73.9],
            ["regex-match", 2.8, 55.1, 2956.9, 141.2],
          ]}
          align={["left", "right", "right", "right", "right"]}
          caption="Three rows from the June 6 HVM5 announcement. Memory and throughput move independently across workloads."
        />
        <p>
          The first two workloads get much faster while their peak memory falls from five-digit megabytes to
          a handful. <code>regex-match</code> loses throughput, and other rows in the screenshot do too. The
          runtime has a workload shape rather than one constant multiplier.
        </p>
        <p>
          Adding the displayed wall times gives HVM5 a little over a threefold improvement across that table,
          which leaves the post&apos;s fivefold figure dependent on a subset or another aggregation the screenshot
          does not name. Fine. Either calculation leaves the same heap profile: HVM5 performs roughly the same
          class of reductions without dragging gigabytes of graph behind them.
        </p>

        <H2>The prompt before the runtime</H2>
        <p>
          One week before the announcement, Taelin published a <a href="https://gist.github.com/VictorTaelin/1634ef66382801a26eaac3757989c4e3">design prompt for rebuilding HVM from scratch</a>.
          I cannot prove the resulting experiment became HVM5, but the timing, SupGen target, and benchmark
          vocabulary make it the strongest public clue I found.
        </p>
        <p>
          The prompt reaches back to an older CGen evaluator that reportedly handled far more interactions per
          second by matching eliminators directly against values. Its CEK-style transition rules look almost
          offensively ordinary:
        </p>
        <CodeBlock lang="text" title="CGen-style direct dispatch" highlight="1-3" code={directDispatch} />
        <p>
          A match sees an injection and jumps to the corresponding branch. Tuple elimination receives both
          fields without first allocating a lambda-match node, an application node, and the links required to
          remove them again. Static function bodies behave as code while environments and arguments carry the
          changing state.
        </p>
        <p>
          HVM4 already separates static book terms from dynamic heap terms. Its <a href="https://github.com/HigherOrderCO/HVM4/blob/main/docs/hvm/memory.md">memory documentation</a> gives every term the same 64-bit representation and uses <code>ALO</code> nodes to expand immutable book terms lazily into mutable heap terms. Even <a href="https://github.com/HigherOrderCO/HVM4/blob/main/docs/hvm/interactions/alo_lam.md">ALO-LAM</a> creates a fresh linked binder before evaluation can continue. That machinery preserves graph sharing, and the benchmark records its allocation cost.
        </p>

        <H2>Duplication keeps the hard part</H2>
        <p>
          Direct dispatch is easy until a duplicated value turns out to be a lambda. The design prompt singles
          out DUP-LAM because either projection may force the value first, somewhere far from the other one:
        </p>
        <CodeBlock lang="text" title="The sharing obligation" highlight="1,3-6" code={dupLam} />
        <p>
          Whichever side arrives first must create two related lambdas and leave the other side pointing at the
          same decision. Re-evaluating the closure independently would discard the sharing discipline that keeps
          Interaction Calculus from exploding on precisely the search programs HVM is built to run. Why? Why is
          the node you most want to remove also the node carrying the asymptotic guarantee?
        </p>
        <p>
          The screenshot suggests a useful compromise. Its small <code>nano</code> column still beats HVM5 on
          the few specialized cases shown, while HVM5 covers the wider benchmark set. A general runtime keeps
          enough representation to preserve DUP/SUP correlations without reifying every static piece of the
          program as a live graph node.
        </p>
        <p>
          I left the HVM5 404 tab beside HVM4&apos;s ALO-LAM rule and wrote one note at the top of my scratch file:
          when the repository opens, trace the first DUP-LAM. For now, the cursor sits after that rule and the
          HVM5 tab still returns 404.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
