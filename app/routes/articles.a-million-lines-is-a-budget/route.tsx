import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BarChart, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "A million lines is a budget",
  description:
    "Jonathan Blow's compile-speed target leaves only a few places to find the time: reduce the work, make it cheaper, or overlap it. The serial parts still get a vote.",
  published: "2026-10-18T00:13:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/a-million-lines-is-a-budget-journal.webp",
    alt: "Three brass printing presses feed paper strips into one finishing roller beside an unnumbered stopwatch.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const workers = [1, 4, 16, 64];
const modeledThroughput = workers.map((count) => ({
  label: `Workers: ${count}`,
  value: 1_000_000 / (2 + 8 / count),
}));

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          A million lines per second makes a large program sound pleasantly small. Change something,
          compile everything, try it. Jonathan Blow named roughly that rate as a target for Jai in his{" "}
          <a href="https://youtu.be/uZgbKrDEzAs?t=1522">2018 Gamelab talk</a>. He was describing
          where planned speedups should take the compiler. The target is worth examining on its own;
          it is not evidence of a current measured result.
        </p>
        <p>
          There are surprisingly few places to find that much time. For a fixed job, you can remove
          work, execute each unit more cheaply, or overlap work that can proceed independently.
          Caches remove work from later builds. More cores help with the overlap. A faster lexer
          makes one unit cheaper. These techniques have different ceilings, even when they all
          improve the same stopwatch reading.
        </p>

        <H2>Decide what the stopwatch includes</H2>
        <p>
          Before comparing compilers, I would require the source revision, line-count convention,
          machine, compiler flags, target, and cache state. The interval should end when the
          executable is ready. Parsing a million lines and emitting an optimized, linked program
          from those lines are very different amounts of work.
        </p>
        <p>
          Lines also vary. A declaration can instantiate many generic bodies or trigger a large
          compile-time computation. Blank lines cost almost nothing. There cannot be a universal
          throughput guarantee for arbitrary programs with arbitrary build-time work. A useful
          target needs a representative corpus, including failures and the diagnostics they produce.
        </p>
        <p>
          Here is a deliberately rough budget. One core running at 4 GHz has about 4,000 cycles per
          source line at a million lines per second. Those cycles must cover every stage assigned
          to that core. They are cycles, not instructions, and cache misses can consume them without
          much useful work. This is an illustrative calculation, not a measurement of Jai.
        </p>

        <H2>Remove repeated work first</H2>
        <p>
          My first target would be avoidable visits to the same information: reparsing shared
          declarations, repeatedly looking up identical names, walking the same tree for facts a
          previous pass already knew. Then I would look at representation. Compact arrays and
          integer handles can reduce allocation and pointer chasing. Fewer bytes per node can
          help several stages at once, provided decoding them does not cost more than it saves.
        </p>
        <p>
          There is a concrete example in Zig&apos;s July 2025{" "}
          <a href="https://ziglang.org/devlog/2025/#new-aarch64-backend">AArch64 backend report</a>:
          its second liveness pass also produces machine-level intermediate instructions. The
          design combines work that had required separate traversals. Instruction encoding also
          moves onto code-generation workers instead of the linker thread. That changes both
          the amount of work and where it can run.
        </p>
        <p>
          A development backend is another large lever. Cheap code generation can get a correct
          executable onto the screen while a separate release path spends more time optimizing.
          The useful comparison includes runtime performance and debug information. A quick build
          that makes the next test painfully slow has merely moved the wait.
        </p>

        <H2>More cores meet the serial part</H2>
        <p>
          Imagine a million-line build taking ten seconds on one worker. Two seconds are serial;
          eight can be split perfectly. With P workers the ideal time is <code>2 + 8 / P</code>{" "}
          seconds. This is Amdahl&apos;s law applied to an invented workload, with scheduling and
          memory contention generously ignored.
        </p>
        <BarChart
          title="Modeled throughput for a build with two serial seconds and eight parallelizable seconds"
          data={modeledThroughput}
          max={650_000}
          format={(value) => `${Math.round(value / 1_000)}k lines/s`}
          caption="Calculated example, not a compiler benchmark. Even unlimited workers stop at 500k lines/s because the two serial seconds remain."
        />
        <p>
          Sixty-four workers still miss the target. To reach a million, this example must reduce
          the serial work too. A dependency chain can impose the same kind of limit: ten tiny
          tasks that each need the previous result cannot run together just because ten cores
          are available.
        </p>
        <p>
          Zig&apos;s June 2025{" "}
          <a href="https://ziglang.org/devlog/2025/#parallel-self-hosted-code-generation">
            parallel code-generation report
          </a>{" "}
          describes semantic analysis on one thread feeding code-generation workers, with another
          thread linking results. That is useful overlap, with visible limits. LLVM&apos;s{" "}
          <a href="https://clang.llvm.org/docs/ThinLTO.html">ThinLTO</a>{" "}
          takes another approach: compact module summaries support global analysis, followed by
          parallel backend work. Both examples make the work separable before adding workers.
        </p>
        <p>
          I would aim for that separation at function or module boundaries, keep temporary state
          local to a worker, and measure queue contention. Shared tables, tiny jobs, memory
          bandwidth, and a final output stage can consume the expected gain. SIMD belongs in
          this plan when profiling finds regular scans; putting the whole type checker on a GPU
          would be a much larger bet on having enough uniform, independent work.
        </p>

        <H2>Keep two scoreboards</H2>
        <p>
          Incremental compilation can be the best answer to an ordinary edit. It is allowed to
          skip almost everything. A clean-build target asks how quickly the compiler handles
          the whole job, so both measurements deserve their own row. The same applies to a warm
          filesystem cache versus reused semantic or machine-code artifacts.
        </p>
        <DataTable
          head={["Build", "Question"]}
          rows={[
            ["Clean, development", "How soon can the whole program run?"],
            ["One function edited", "How soon can I test this change?"],
            ["Shared type edited", "How far does invalidation spread?"],
            ["Optimized release", "What build cost buys the required runtime speed?"],
          ]}
          caption="Four workloads to time separately, with the same source corpus and recorded machine and compiler settings."
        />
        <p>
          My order would be: profile the complete build, remove duplicated work in its dominant
          stages, make a fast development backend, then parallelize independent jobs and shorten
          the remaining serial path. For C and C++, Clang&apos;s{" "}
          <a href="https://clang.llvm.org/docs/UsersManual.html#options-to-emit-resource-consumption-reports">
            timing and resource reports
          </a>{" "}
          help locate those costs. The exact order after profiling should follow the measured
          bottleneck; a linker dominating the build moves to the front of the queue.
        </p>
        <p>
          Track elapsed time, CPU time, peak memory, and the spread across repeated runs. Keep
          correctness, diagnostics, and executable behavior in the comparison. The million-line
          ambition becomes useful when each change can answer a smaller question: which work
          disappeared, which work got cheaper, and which waiting period got shorter?
        </p>
      </Prose>
    </ArticleLayout>
  );
}
