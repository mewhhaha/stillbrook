import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  Compare,
  H2,
  MemoryBoxes,
  Prose,
} from "../../components";

export const article = {
  title: "The thunk should be the fallback",
  description:
    "Default laziness becomes plausible when compilers evaluate demanded work eagerly, represent common delays as inspectable data, and reserve closure thunks for the cases they cannot understand.",
  published: "2026-07-16T19:55:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-thunk-should-be-the-fallback.jpg",
    alt: "A yellow pneumatic tube carrier lies on a white surface, sealed at both ends with dark caps.",
    credit: {
      author: "The Central Intelligence Agency",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Pneumatic_Tube_-_Flickr_-_The_Central_Intelligence_Agency.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const previewPipeline = `
  preview file =
    take 10
      (map render
        (filter visible (parse file)))
`;

const lazyAppend = `
  type stream<a>
    SCons(head: a, tail: stream<a>)
    SNil
    lazy SAppend(left: stream<a>, right: stream<a>) ->
      match left
      SCons(x, xs) -> SCons(x, SAppend(xs, right))
      SNil -> right
`;

const runtimeChoices = [
  {
    name: "Universal thunk",
    values: [
      "A closure carrying code and an environment",
      "Heap tools can see a THUNK and whatever it retains",
      "Works for arbitrary higher-order delayed computation",
      "Allocation, indirection, and delayed failure remain common",
    ],
  },
  {
    name: "Layered laziness",
    values: [
      "Proven demand evaluates now, while known delays use constructors",
      "Tools can print the operation and its fields",
      "Use a closure only when the compiler has no first-order form",
      "Requires stronger analysis and a richer runtime representation",
    ],
  },
] as const;

const retainedInput = [
  {
    id: "result",
    label: "result: Cons",
    fields: [
      { name: "head", value: "rendered line" },
      { name: "tail", pointsTo: "thunk" },
    ],
  },
  {
    id: "thunk",
    label: "tail: Closure",
    fields: [
      { name: "code", value: "continue pipeline" },
      { name: "env", pointsTo: "input" },
    ],
  },
  {
    id: "input",
    label: "input: ByteString",
    fields: [{ name: "payload", value: "whole file" }],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          A thunk is a sealed capsule of work with a heap address. You can pass it through half the
          program and keep everything in its environment alive. Its exception may surface in a caller
          that never saw the original expression, while the profiler labels the object <code>THUNK</code>{" "}
          and considers the description complete.
        </p>
        <p>
          I still think laziness can become a sane default again. The source semantics are too useful to
          discard: unused work disappears, and recursive structures can be consumed incrementally. The
          viable version lets the compiler choose a cheaper representation instead of turning every delay
          into an anonymous closure.
        </p>

        <H2>The capsule keeps its luggage</H2>
        <p>
          Call-by-need stores postponed work in a heap object, evaluates it at first demand, and memoizes the
          result. That behavior makes this pipeline attractive: asking for ten rendered items can parse and
          filter only enough input to produce ten results.
        </p>
        <CodeBlock lang="text" title="Preview.hs" highlight="2-5" code={previewPipeline} />
        <p>
          The pleasant source hides a retention question. If the unevaluated tail closes over the original
          buffer, keeping the first result can keep the whole file. Why is one rendered line keeping the
          whole file alive?
        </p>
        <MemoryBoxes
          title="A lazy list tail retains its source buffer through a closure environment."
          boxes={retainedInput}
          caption="The unevaluated tail points through its closure environment to the input buffer after the first rendered line exists."
        />
        <p>
          GHC&apos;s{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/profiling.html">
            profiling guide
          </a>{" "}
          explains that a thunk captures the current cost-centre stack and restores it when evaluation
          finally happens. That helps assign the bill, but the runtime object remains generic. A delayed
          parser step and a queue rotation both arrive in the heap as closures whose meaning has to be
          reconstructed from code and retained values.
        </p>

        <H2>Today you patch the demand by hand</H2>
        <p>
          Haskell programmers already know where the abstraction tears. A lazy <code>foldl</code> can build a
          chain of pending additions, so performance-sensitive code reaches for <code>foldl&apos;</code>, bang
          patterns, strict fields, or an entire module compiled with <code>Strict</code>. The current{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/exts/strict.html">
            GHC strictness documentation
          </a>{" "}
          says removing thunks from an inner loop can be a huge win.
        </p>
        <p>
          GHC also spends serious effort proving when it can evaluate early. Demand analysis,
          worker/wrapper, unboxing, and newer speculative evaluation passes remove delays that the source
          language requested by default. The{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/using-optimisation.html">
            optimization guide
          </a>{" "}
          records cases where more strictness increases allocation or runtime, which is why a global switch
          remains too blunt.
        </p>
        <p>
          I don&apos;t think today&apos;s compiler and tooling make default laziness comfortable for ordinary
          application code. You can usually repair the hot loop, but the first warning may be a heap profile
          taken after residency grows under a workload nobody put in the benchmark.
        </p>

        <H2>Give deferred work a name</H2>
        <p>
          The interesting recent move changes the runtime object. The 2025{" "}
          <a href="https://www.microsoft.com/en-us/research/publication/first-order-laziness/">
            First-Order Laziness paper
          </a>{" "}
          replaces many closure thunks inside lazy data structures with declared lazy constructors. An
          append operation can remain suspended as <code>SAppend(left, right)</code> rather than becoming an
          unknown function plus an environment.
        </p>
        <CodeBlock lang="text" title="stream.kk" highlight="4-7" code={lazyAppend} />
        <p>
          That representation gives the compiler facts a closure erased: the node&apos;s size, its evaluator,
          the fields that remain live, and the update path. The implementation can inspect unfinished
          structures during debugging, reuse nodes in place, avoid some indirections, and specialize
          evaluation to constant stack space. In the paper&apos;s Koka benchmarks, lazy constructors beat the
          equivalent traditional thunks across the tested queues and heaps and approached strict versions.
        </p>
        <p>
          The limitation is useful too: constructors must be declared for the delayed operations a data
          type supports. Arbitrary higher-order suspension still needs a closure fallback. Most persistent
          queues and streams use a small vocabulary of deferred operations, though, so the common path can
          be legible without forbidding the general one.
        </p>

        <H2>A default with several gears</H2>
        <p>
          A plausible lazy language keeps Haskell&apos;s source-level promise while refusing one universal
          implementation. Proven demand evaluates now. Known delayed data operations become first-order
          constructors. The remaining unknown computation gets the old closure thunk, and strict modules
          stay available for numeric or systems work.
        </p>
        <Compare
          attributes={["Representation", "Debugging", "Coverage", "Cost"]}
          entities={runtimeChoices}
          caption="The layered design keeps unrestricted delay while moving common cases into representations the compiler can inspect."
        />
        <p>
          Reasoning tools are catching up with the representation work. The 2024{" "}
          <a href="https://research.chalmers.se/en/publication/542531">
            bidirectional demand semantics
          </a>{" "}
          derives costs from what a lazy result is demanded to produce and supports mechanized proofs for
          persistent queues. Production predictability remains open. The work gives compilers and libraries
          something better than folklore for explaining where evaluation goes.
        </p>
        <p>
          The experiment I want ends in the debugger, before the benchmark chart. Force one element of a
          lazy append and inspect the rest. If the tool prints <code>SAppend(SCons(...), ...)</code>, you can
          see the pending operation and what it owns. If the same heap view still offers a gray band named{" "}
          <code>THUNK</code>, I am still reaching for a bang pattern.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
