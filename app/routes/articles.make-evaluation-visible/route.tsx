import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, Divider, H2, Prose } from "../../components";

export const article = {
  title: "Make evaluation visible",
  description:
    "Haskell performance improves when you measure demand, allocation, and residency, then make evaluation and representation explicit only at proven hot paths.",
  published: "2026-07-11T16:43:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/make-evaluation-visible.jpg",
    alt: "Close-up of an antique steel-tube steam pressure gauge by Tinker, Shenton & Co. of Hyde, its needle pointing to 60 lb per square inch with a red maximum mark at 100.",
    credit: {
      author: "Clem Rutter, Rochester, Kent.",
      license: "CC BY 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Queen_Street_Mill_-_Lancashire_Boilers_Steam_pressure_gauge_5453.JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const baseline = `
  ghc -O2 -rtsopts Main.hs
  ./Main +RTS -s
`;

const benchmark = `
  import Criterion.Main

  main :: IO ()
  main = defaultMain
    [ bench "summarize batch" $ nf summarize fixture
    ]
`;

const strictFold = `
  {-# LANGUAGE BangPatterns #-}

  import Data.List (foldl')

  data Totals = Totals !Int !Int

  summarize :: [Row] -> Totals
  summarize = foldl' step (Totals 0 0)
    where
      step (Totals !rows !bytes) row =
        Totals (rows + 1) (bytes + rowBytes row)
`;

const vectorPipeline = `
  import qualified Data.Vector.Unboxed as U

  score :: U.Vector Int -> Int
  score = U.sum . U.map normalize . U.filter valid
`;

const inspectCore = `
  ghc -O2 -ddump-simpl -ddump-to-file Hot.hs
  ghc -O2 -ddump-rule-firings Hot.hs
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          The standard Haskell optimization move is to add bangs until the heap graph stops looking
          haunted. I&apos;ve done it, and sometimes it even works — but you come out the other side no
          wiser about where the time actually went.
        </p>
        <p>
          Laziness itself isn&apos;t the problem. The problem is losing track of it: you stop knowing
          which work is deferred, how often values get rebuilt, and what&apos;s keeping them alive long
          past their usefulness. So the first job is making those costs visible. Bangs and pragmas come
          after.
        </p>

        <H2>Three numbers before one pragma</H2>
        <p>
          Measure the optimized program on a representative input. A development build without
          optimization describes a program you don&apos;t ship, and a toy input rewards shortcuts your
          real workload never gets to take. GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/using-optimisation.html">
            optimization guide
          </a>{" "}
          treats <code>-O2</code> as the package of non-dangerous optimizations worth the longer compile
          times, so start there rather than with a private collection of folklore flags.
        </p>
        <CodeBlock lang="sh" title="Baseline an optimized executable" code={baseline} />
        <p>
          The runtime summary from <code>+RTS -s</code> separates several complaints because they point at
          different shapes of waste. GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/runtime_control.html#rts-options-to-produce-runtime-statistics">
            RTS documentation
          </a>{" "}
          names each one directly.
        </p>
        <DataTable
          head={["Runtime signal", "What it says", "Useful next question"]}
          rows={[
            ["Elapsed and GC time", "How much of the run went to collection", "Which cost centres allocate during the pause-heavy phase?"],
            ["Total allocation", "How much short-lived material the program manufactured", "Can a representation change remove intermediate objects?"],
            ["Maximum residency", "How much data stayed live together", "Which producer or reference keeps the heap reachable?"],
            ["High mutator time, modest allocation", "The computation itself dominates", "Is the hot path branching or missing locality or specialization?"],
          ]}
          caption="The runtime summary chooses the profiling question before any pragma chooses an answer."
        />
        <p>
          Allocation is traffic; residency is parking. Reducing one doesn&apos;t promise anything about
          the other. When the summary names the category but not the source, GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/profiling.html">
            time, allocation, and heap profilers
          </a>{" "}
          will point at the cost centre, or at whichever producer is retaining the data. Go in with one
          question you want the profile to answer.
        </p>

        <H2>Benchmark the demand</H2>
        <p>
          A Haskell benchmark doesn&apos;t measure a function in isolation — it measures how far a
          consumer forces the result, and a tidy benchmark makes it easy to erase that distinction
          without noticing.
        </p>
        <CodeBlock lang="text" title="bench/Batch.hs" highlight="5" code={benchmark} />
        <p>
          Criterion&apos;s{" "}
          <a href="https://github.com/haskell/criterion">benchmarking guide</a>{" "}
          separates <code>whnf</code> from <code>nf</code> for exactly this reason. Weak head normal form
          may inspect only the first constructor of a lazy result; normal form consumes the whole
          structure. Pick whichever matches production — or better, benchmark the real downstream
          consumer. Otherwise you can make a list producer look fast by timing the first cons cell and
          quietly sending the rest of the bill to code outside the benchmark.
        </p>

        <H2>Force the accumulator, not the language</H2>
        <p>
          Once a profile shows a hot fold retaining a long chain of additions, make that accumulator
          strict. What you shouldn&apos;t do is declare the whole module strict and hope every deferred
          computation was a mistake.
        </p>
        <CodeBlock lang="text" title="Summary.hs" highlight="5,8,11-12" code={strictFold} />
        <p>
          Here <code>foldl&apos;</code> evaluates the accumulator at each step, and the strict fields keep
          the two counters from turning into suspended arithmetic inside an otherwise evaluated{" "}
          <code>Totals</code> constructor. GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/exts/strict.html">
            strictness documentation
          </a>{" "}
          calls out thunk removal in inner loops as one of the big wins. But the boundary still matters:
          if a caller might stop after the first match, or only ever reads one field, forcing everything
          up front performs work the lazy program was correctly skipping.
        </p>
        <p>
          So put strictness where the consumer already promises to need the value — accumulators,
          long-lived records — and leave it out where partial demand is the feature.
        </p>

        <H2>Change the container</H2>
        <p>
          When allocation dominates, changing the container usually beats any pragma. A linked list is a
          good stream and an expensive numeric array. <code>String</code> is a list of characters, not a
          compact text buffer. No amount of enthusiasm for <code>INLINE</code> changes those shapes.
        </p>
        <p>
          Use a type that says what storage you actually need. The{" "}
          <a href="https://github.com/haskell/text">text package</a>{" "}
          stores Unicode text compactly, the{" "}
          <a href="https://github.com/haskell/bytestring">bytestring package</a>{" "}
          handles packed bytes, and the{" "}
          <a href="https://github.com/haskell/vector">vector package</a>{" "}
          offers boxed and unboxed arrays with a fusion framework. For dense primitive data, an unboxed
          vector removes a layer of pointers before the optimizer sees the loop.
        </p>
        <CodeBlock lang="text" title="Score.hs" highlight="4" code={vectorPipeline} />
        <p>
          Compiled with optimization, a pipeline like this can fuse into a single loop with no temporary
          vectors in between. Can, not will — check it, because fusion is an optimization rather than a
          guarantee, and I&apos;ve been burned by assuming it fired. When a change of representation does
          work, it tends to improve cache behavior and garbage collection at the same time, which is more
          than a pragma usually buys you.
        </p>

        <Divider />

        <H2>Read Core as a verdict</H2>
        <p>
          Inspect Core only after the profiler has isolated a hot module; before that it&apos;s a lot of
          output and no hypothesis. GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/debugging.html#core-representation-and-simplification">
            Core dump flags
          </a>{" "}
          let you ask narrow questions. Did the intermediate vector disappear? Did an overloaded loop
          specialize, and did worker/wrapper produce an unboxed worker?
        </p>
        <CodeBlock lang="sh" title="Inspect one hot module" code={inspectCore} />
        <p>
          Only now should you reach for <code>INLINEABLE</code>, <code>SPECIALIZE</code>, or a rewrite rule.
          GHC already runs specialization and several unboxing passes at its standard optimization
          levels, and the same guide warns that aggressive specialization can massively increase code
          size. A pragma earns its place when Core shows a missed transformation and the benchmark shows
          the miss costs something.
        </p>
        <p>
          Then strip the profiling instrumentation and run the optimized, production-shaped binary
          again. Write down the input, the compiler version, the runtime flags, and the numbers from
          before and after, next to the change itself — a month from now nobody remembers why the bang is
          there.
        </p>
        <p>
          Haskell lets you postpone work without changing what a program means, and that&apos;s worth
          keeping. The job is to find the few places where the postponement costs more than it saves,
          and fix those, with the numbers open in another window.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
