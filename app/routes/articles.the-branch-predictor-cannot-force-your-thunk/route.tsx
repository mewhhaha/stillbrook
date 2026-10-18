import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  FlowSequence,
  H2,
  MessageThread,
  Prose,
} from "../../components";

export const article = {
  title: "The branch predictor cannot force your thunk",
  description:
    "Compiling a lazy functional language to WebAssembly works best when demand analysis removes thunks before lowering; branch hints can only annotate the predictable control flow left behind.",
  published: "2026-07-11T20:18:00Z",
  author: "Elias North",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-branch-predictor-cannot-force-your-thunk-journal.webp",
    alt: "A worker untangles strings above a wooden puppet, with a two-way lever nearby.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const sourceCase = `
  data Plan = Free | Pro

  label user =
    case plan user of
      Free -> "free"
      Pro  -> "pro"
`;

const loweringSketch = `
  ;; STG-shaped sketch, not literal compiler output
  local.get $plan
  i32.load8_u offset=$closure_kind
  br_table $value $thunk $function $pap

  $thunk:
    local.get $plan
    return_call_indirect $enter

  $value:
    local.get $plan
    i32.load8_u offset=$constructor
    br_table $free $pro
`;

const strictWorker = `
  -- Schematic Core after demand analysis and specialization
  label user =
    case plan user of
      p -> label_worker (constructorTag p)

  label_worker tag =
    case tag of
      0# -> "free"
      _  -> "pro"
`;

const lazyPath = [
  {
    title: "Load the closure",
    detail: "plan user may still be suspended work.",
  },
  {
    title: "Classify it",
    detail: "Value, thunk, function, or partial application?",
  },
  {
    title: "Run the thunk",
    detail: "Follow an indirect target into the evaluator.",
  },
  {
    title: "Update the result",
    detail: "Memoize the value for the next demand.",
  },
  {
    title: "Take your branch",
    detail: "Only now do Free and Pro appear.",
  },
] as const;

const sourceAndCpu = [
  { from: "Source", text: "I wrote one case expression." },
  {
    from: "CPU",
    text: "Is the scrutinee a value, thunk, function, or partial application?",
  },
  { from: "Source", text: "It is a Plan." },
  { from: "CPU", text: "That was not the question." },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          WebAssembly is not the problem. Your thunk is. The source has one <code>case</code>, but a lazy
          compiler may reach it only after classifying a closure, entering an unknown function, and
          updating the heap.
        </p>
        <CodeBlock lang="haskell" title="Plan.hs" highlight="4-7" code={sourceCase} />
        <p>
          I lost an afternoon staring at a tidy <code>br_table</code> in a Wasm dump. The constructor switch
          came last; the thunk-entry path three blocks earlier had already burned the time.
        </p>
        <MessageThread
          messages={sourceAndCpu}
          caption="Laziness adds a conversation before the branch you wrote."
        />

        <H2>The case arrives late</H2>
        <p>
          Call-by-need represents deferred work as a heap object. Evaluating <code>plan user</code> can mean
          reading its info table, deciding whether the object has already been evaluated, jumping through
          its entry pointer, and replacing the thunk with an indirection to the result. The second visit
          follows a different path from the first.
        </p>
        <FlowSequence
          steps={lazyPath}
          caption="The source-level case reaches the constructor after four runtime decisions."
        />
        <p>
          The processor sees native machine code produced by the Wasm engine, so its dynamic predictor can
          still learn regular behavior. Laziness makes that behavior depend on history: cold data takes the
          thunk path, warm data the value path. A polymorphic entry point muddies it further by sending each
          closure through different code.
        </p>
        <p>
          I haven&apos;t measured your evaluator. A cache miss on the closure header or the indirect target may
          cost more than the misprediction. Either way, the useful compiler move happens before Wasm, back
          where the frontend still knows why each of those dynamic choices exists.
        </p>
        <CodeBlock lang="wat" title="Lowering sketch" highlight="2-4,6-8,10-13" code={loweringSketch} />
        <p>
          The final <code>br_table</code> is the branch from the source. Everything above it belongs to the
          evaluation strategy. WebAssembly&apos;s{" "}
          <a href="https://github.com/WebAssembly/tail-call/blob/main/proposals/tail-call/Overview.md">
            tail-call instructions
          </a>{" "}
          help an evaluator transfer control without growing the native stack, including through an
          indirect call. That keeps the stack flat, but the engine still has no idea where the call will
          land.
        </p>

        <H2>Delete the uncertainty upstream</H2>
        <p>
          A serious functional compiler does not lower every thunk faithfully and hope the hardware gets
          good at guessing. GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/using-optimisation.html">
            demand and usage analyses
          </a>{" "}
          can pass strict arguments by value, unbox them, omit absent work, and turn a one-use thunk into a
          non-memoised computation. Worker/wrapper then keeps the lazy public shape while giving hot code a
          stricter worker.
        </p>
        <p>
          The first time I watched worker/wrapper erase an evaluatedness check, I had been trying to tune
          that check with layout changes. The better branch prediction came from deleting the branch.
        </p>
        <CodeBlock lang="haskell" title="Schematic optimized Core" highlight="2-5,7-11" code={strictWorker} />
        <p>
          If <code>label</code> always needs the plan, the worker can receive the constructor tag directly.
          If another consumer sometimes skips the plan, keeping the outer computation lazy still saves real
          work. Making everything strict would erase that distinction, and the demand analysis exists so the
          compiler does not have to.
        </p>
        <p>
          Specialization matters for the same reason. A known closure entry becomes a direct call, and once
          the constructor set is known the classification collapses into a compact switch. A strict, unboxed
          field stops asking whether a pointer names work or a value. By the time the compiler emits Wasm,
          most of what remains should be branches the source actually contains.
        </p>

        <H2>Hints come last</H2>
        <p>
          WebAssembly&apos;s{" "}
          <a href="https://github.com/WebAssembly/branch-hinting/blob/main/proposals/branch-hinting/Overview.md">
            branch-hinting proposal
          </a>{" "}
          attaches likely or unlikely metadata to <code>if</code> and <code>br_if</code>. An engine may use
          those hints for code layout and register allocation, or ignore them. They cannot turn{" "}
          <code>call_indirect</code> into a known target, and they cannot tell whether this closure was forced
          five microseconds ago.
        </p>
        <p>
          Profile the residual branches instead: error paths, or a constructor distribution that stays
          stable in production. A static hint learned from cold startup can become backward after
          the heap warms, so phase behavior belongs in the benchmark rather than in a programmer&apos;s hunch.
        </p>
        <p>
          GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/wasm.html">Wasm backend</a>{" "}
          already has to bridge a Haskell calling convention into WebAssembly and runs a continuation-passing
          transformation near the end of lowering. That machinery is where laziness meets the target, and a
          likely-bit on the last branch helps only after those passes have settled everything they can.
        </p>
        <p>
          I still keep the Wasm dump open, but the next tab is the demand dump now. When{" "}
          <code>call_indirect</code> sits at the top of the profile, I stop decorating the constructor switch
          and look for the proof the compiler failed to carry across the boundary.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
