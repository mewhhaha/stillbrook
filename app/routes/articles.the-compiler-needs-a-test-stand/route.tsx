import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "The compiler needs a test stand",
  description:
    "Five familiar programs go into a benchmark filter and four come out labeled with how they would ruin the measurement; cmark survives, pinned to a contract.",
  published: "2026-07-15T11:45:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-compiler-needs-a-test-stand.jpg",
    alt: "An automobile engine is mounted beside measurement equipment on a laboratory test stand.",
    credit: {
      author: "Mikelantis",
      license: "CC BY-SA 3.0",
      href: "https://commons.wikimedia.org/wiki/File:TitanTestStand_Rev2011.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const candidateRows = [
  [<a key="sqlite" href="https://sqlite.org/about.html">SQLite</a>, "Storage, transactions, a virtual machine", "The port becomes a database project"],
  [<a key="zstd" href="https://github.com/facebook/zstd">zstd</a>, "Bit I/O and tuned compression loops", "Hand optimization dominates the comparison"],
  [<a key="ripgrep" href="https://github.com/BurntSushi/ripgrep">ripgrep</a>, "Files, threads, regex, ignore rules", "Missing ecosystem pieces swamp compiler effects"],
  [<a key="jq" href="https://github.com/jqlang/jq">jq</a>, "Parser, bytecode VM, recursive values", "The port needs another language runtime"],
  [<a key="cmark" href="https://github.com/commonmark/cmark">cmark</a>, "Parser, tree, allocation, hashing, renderers", "Large enough to expose systems costs and bounded enough to finish"],
] as const;

const benchmarkSteps = [
  { title: "Conformance", detail: "Compare exact output for the CommonMark specification examples." },
  { title: "Corpus", detail: "Pin the Pro Git input and pathological fixtures to one cmark commit." },
  { title: "Build", detail: "Record clean and one-file rebuilds with fixed compiler and target flags." },
  { title: "Artifact", detail: "Measure runtime, peak memory, executable text, and matching output." },
] as const;

const benchmarkContract = `
  set -eu
  reference=./bin/cmark-c
  candidate=./bin/cmark-port

  for markdown in corpus/*.md; do
    "$reference" --to html "$markdown" > /tmp/reference.html
    "$candidate" --to html "$markdown" > /tmp/candidate.html
    cmp /tmp/reference.html /tmp/candidate.html
  done

  taskset -c 2 hyperfine --warmup 3 --runs 10 \\
    "$reference --to html corpus/progit.md" \\
    "$candidate --to html corpus/progit.md"
  size "$reference" "$candidate"
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Say you have built a language. The compiler compiles, the demos run, and now you want a number you could
          show a stranger without flinching. A tight loop will not get you one — every optimizer looks good in a
          loop — because the question a stranger actually cares about is what happens when strings, allocation,
          error paths, separate compilation, and library policy all arrive in the same executable.
        </p>
        <p>
          So treat it as candidate elimination. Five familiar programs go into the filter, and four come out
          labeled with the specific way they would ruin the measurement.
        </p>
        <DataTable
          head={["Candidate", "Useful pressure", "Decision"]}
          rows={candidateRows}
          caption="cmark is the smallest candidate that still behaves like an application rather than a kernel."
        />

        <H2>Eliminate the projects around the compiler</H2>
        <p>
          The eliminations teach more than the winner does. Port SQLite and you are testing whether a young
          language can express a storage engine — a fine question, and years too early. zstd carries a decade of
          hand tuning that would dominate anything the compiler contributes, ripgrep leans on a regex and
          filesystem stack nobody has rewritten yet, and jq smuggles in an entire second runtime. A slow port of
          any of them indicts the replacement libraries louder than the code generator.
        </p>
        <p>
          cmark survives because its edges are unusually clean: standard C, no required external library, a
          document tree with multiple renderers, and an official specification suite that judges observable
          output. It still exercises none of floating point, concurrency, sockets, or service lifetime, so a good
          score here settles less than it will be tempting to claim.
        </p>
        <p>
          The specification suite is what keeps everyone honest. A candidate cannot get &quot;faster&quot; by
          accepting a smaller Markdown dialect or emitting approximately similar HTML, because the CommonMark
          examples and byte-for-byte renderer comparison settle correctness before any clock starts. A crash is a
          failed run, never a fast sample.
        </p>

        <H2>Freeze the cmark contract</H2>
        <p>
          Pin cmark commit <code>9562204</code>. Its{" "}
          <a href="https://github.com/commonmark/cmark/blob/956220463845ad7115fa91e03cd4f8b041e5ef63/benchmarks.md">
            benchmark document
          </a>{" "}
          already ships a 1,106 KB corpus assembled from the first edition of Pro Git, and the same commit&apos;s
          pathological suite includes 25,000 nested opening brackets with their matching closers. Steady-state
          parsing and hostile structure, both in the repository — nobody gets to invent a private fixture.
        </p>
        <FlowSequence steps={benchmarkSteps} caption="Correctness and fixed inputs precede every timing in the benchmark record." />
        <p>
          One more line has to be drawn before timing anything: the faithful port keeps the C source&apos;s
          algorithms, data structures, and observable behavior. An idiomatic rewrite is worth measuring too — I
          suspect it flatters the language, and that suspicion is exactly what a second scoreboard exists to test
          — but it answers a different question and must not inherit the faithful port&apos;s label.
        </p>
        <p>
          The line matters because good language features make excellent benchmark cheats. Swap cmark&apos;s
          manual allocation for a tracing collector and you have changed the program&apos;s memory behavior. A
          library parser goes further and replaces the measured program outright. Record those as their own
          candidates, proudly, on their own row.
        </p>
        <CodeBlock lang="sh" title="bench.sh" highlight="4-9,11-14" code={benchmarkContract} />
        <p>
          The record that survives names everything that could explain a difference: both commits, compiler
          revision and flags, the CPU and its pinning, allocator, warm-up count, raw samples, output hashes, and
          the tools that measured memory and size. LLVM&apos;s{" "}
          <a href="https://llvm.org/docs/TestSuiteGuide.html">test-suite guide</a> keeps runtime, compile time,
          code size, and reference output as separate measurements for the same reason — an aggregate score is
          where the regression you came to find goes to hide.
        </p>
        <p>
          No port has been timed for this essay, which is the deliberate anticlimax: the contract is the
          deliverable. Meanwhile the least glamorous input sits in <code>test/pathological_tests.py</code> —
          25,000 left brackets, one <code>a</code>, 25,000 right brackets — waiting for every implementation that
          copies a substring on each split.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
