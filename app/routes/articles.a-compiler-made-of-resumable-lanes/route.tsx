import { articleMeta, type ArticleMeta } from "../../article";
import {
  AnnotatedCode,
  ArticleLayout,
  DataTable,
  FeedbackLoop,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "A compiler made of resumable lanes",
  description:
    "Gpufuck turns functional-language semantics into bounded GPU state machines, batches independent programs across lanes, and reads resolved Core back to emit ordinary WebAssembly on the host.",
  published: "2026-07-19T00:30:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/a-compiler-made-of-resumable-lanes-journal.webp",
    alt: "Beads pause in parallel copper lanes before a hand assembles them into a wooden cylinder.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const compilerLane = `
  fn compile_lane() {
    if state.status != STATUS_PENDING { return; }
    initialize_compilation();
    let dispatch_start_steps = state.total_steps;
    loop {
      if state.status != STATUS_PENDING { return; }
      if state.total_steps >= state.maximum_steps {
        state.status = STATUS_STEP_LIMIT;
        return;
      }
      if state.total_steps - dispatch_start_steps >=
        state.maximum_steps_per_dispatch { return; }
      state.total_steps += 1u;
      advance_compilation();
    }
  }
`;

const traceRows = [
  [
    <code key="argument">$argument0</code>,
    <code key="local">Local depth=0</code>,
    "A lexical name becomes a position relative to its binder.",
  ],
  [
    <code key="map-tree">mapTree</code>,
    <code key="global">Global definition=d1</code>,
    "A recursive global becomes an index into the linked definition table.",
  ],
  [
    <code key="branch">Branch</code>,
    <code key="constructor">Constructor c1:Branch</code>,
    "A nominal constructor keeps its identity through a numeric constructor index.",
  ],
  [
    <code key="gpu-main">gpuMain: &lt;inferred&gt;</code>,
    <code key="entry">entry=d3; type=i32</code>,
    "Inference leaves the public entry with a concrete first-order boundary.",
  ],
] as const;

const dispatchLoop = [
  {
    title: "Dispatch",
    detail: "A lane advances by at most the current semantic quantum.",
  },
  {
    title: "Observe",
    detail: "The host reads status, transition counts, output size, and any exhausted arena.",
  },
  {
    title: "Grow",
    detail: "Only the exhausted logical arena is enlarged, with live records copied to new bases.",
  },
  {
    title: "Rebind",
    detail: "The replacement buffers resume with the same phase, results, and semantic fuel.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Gpufuck&apos;s semantic shader opens with <code>@workgroup_size(1)</code>, which on a GPU is a small
          heresy. One invocation owns one compilation lane, loads one durable state record, and advances it until
          a bounded quantum expires — no workgroup cooperating on a program in sight.
        </p>
        <p>
          That odd choice makes the repository understandable.{" "}
          <a href="https://github.com/mewhhaha/gpufuck">Gpufuck</a> flattens functional programs into
          fixed-width tables, runs name resolution and type inference as resumable machines, batches
          independent programs across lanes, then gives resolved Core to TypeScript for WebAssembly emission.
          The arrangement gives regular semantic work to the GPU while the host keeps the irregular edges.
        </p>

        <H2>The GPU sees tables</H2>
        <p>
          A frontend keeps its parser, module discovery, ownership rules, and diagnostic wording, then lowers an
          accepted program into the Functional Surface, where the{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/surface_builder.ts">
            surface builder
          </a>{" "}
          interns names and writes fixed-width <code>u32</code> records. Whatever your language argues about —
          Rust moves, OCaml&apos;s sequential scope — it argues about before this point. The GPU never learns what
          your keywords were.
        </p>
        <p>
          The generated{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/examples/haskell-functional/tree.trace.md">
            Haskell tree trace
          </a>{" "}
          shows the handoff. <code>mapTree</code> enters the packed ABI without an annotation, while GPU
          resolution and inference replace source names with numeric evidence and leave the entry concrete.
        </p>
        <DataTable
          head={["Surface evidence", "Resolved Core", "What changed"]}
          rows={traceRows}
          caption="Four rows from tree.trace.md — each one is a name's last appearance before it becomes an index."
        />

        <H2>A dispatch is a time slice</H2>
        <p>
          WGSL offers no recursion and no comfortable heap of pointer-linked compiler objects. Gpufuck stores
          the active phase, cursors, source spans, fuel, and unfinished work in buffers. The relevant loop in{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/lazuli/compiler_shader.ts">
            compiler_shader.ts
          </a>{" "}
          is almost aggressively plain:
        </p>
        <AnnotatedCode
          lang="wgsl"
          title="compiler_shader.ts — compile_lane, abridged"
          code={compilerLane}
          notes={[
            { line: 2, note: "A completed or failed lane costs no more semantic work." },
            { line: 4, note: "The dispatch records its own starting fuel before entering the machine." },
            { line: 7, note: "The total budget bounds the complete compilation across resumed dispatches." },
            { line: 11, note: "The quantum returns control to the host while the program remains pending." },
            { line: 14, note: "One transition advances one explicit validation, resolution, or inference phase." },
          ]}
          caption="One lane advances a durable compiler state until completion, failure, total fuel exhaustion, or the dispatch quantum."
        />
        <p>
          Type inference uses the same discipline for union-find traversal, occurs checks, generalization,
          indexed refinements, and coverage. Input-sized work becomes durable frames that survive dispatches.
          There is an honesty to this loop: a charged step performs bounded semantic work instead of hiding a
          million-record scan behind the word “step.”
        </p>
        <p>
          Cancellation remains cooperative because WebGPU cannot interrupt a command after submission. Smaller
          quanta shorten the interval before the host can observe an abort; a quantum of one makes every transition
          a submission and readback boundary. Whether that trade stings in practice I can&apos;t say — the latency
          benchmarks exist, but the repository avoids pretending one adapter&apos;s numbers apply to another.
        </p>

        <H2>The host keeps the machine alive</H2>
        <p>
          Inference keeps logical arenas for types, environments, frames, refinements, scratch data, and output.
          When one fills, the shader stops and names the arena that ran out — more courtesy than most out-of-memory
          paths ever manage. The{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/lazuli/gpu_type_inference_runner.ts">
            host runner
          </a>{" "}
          enlarges that region, copies live records, patches the bindings, and resumes the same machine state.
        </p>
        <FeedbackLoop
          steps={dispatchLoop}
          returnLabel="a pending lane enters the scheduler again"
          caption="The host/device loop used while inference remains pending or one logical workspace arena must grow."
        />
        <p>
          The workspace tests begin with deliberately tiny capacities and force every arena to exhaust. They verify
          that only the named capacity grows and that the resumed transition count stays unchanged. Memory repair
          happens between semantic steps, so growth does not spend compiler fuel or restart inference.
        </p>

        <H2>Width arrives between programs</H2>
        <p>
          One lane advances one branch-heavy program. Width comes from putting independent programs beside it.{" "}
          <code>compileBatch()</code> packs modules into lanes, while the{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/gpu_dispatch_scheduler.ts">
            dispatch scheduler
          </a>{" "}
          lets sibling promises meet and coalesces their command encoders into one submission.
        </p>
        <p>
          One test keeps 512 copies of the repository&apos;s Brainfuck compiler fixture in a single GPU pack —
          512 compilers running at once is the whole pitch condensed into one fixture. Another test makes one lane
          exhaust its output arena while a sibling finishes normally; the exceptional lane takes the growth path and
          the completed result remains valid. Tiny one-off programs still pay submission and
          readback overhead, which is why the{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/benchmarks/lazuli_compiler_bench.ts">
            benchmarks
          </a>{" "}
          include batches instead of offering one grand speed number.
        </p>

        <H2>The GPU stops at Core</H2>
        <p>
          Semantic success leaves a <code>GpuFunctionalModule</code> owning resolved buffers. Wasm emission reads
          those Core nodes back and runs capture analysis, storage planning, reachability, and specialization on
          the host. The{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/wasm_artifacts.ts">
            artifact boundary
          </a>{" "}
          calls the TypeScript emitter directly, with no WAT round trip and no GPU dependency in the resulting
          module.
        </p>
        <p>
          The current sharp edge follows from that split. Compilation has no CPU semantic fallback; the TypeScript
          inferencer is a differential oracle for tests, and the development guide explicitly rejects turning it
          into an implicit production path. A machine without WebGPU can run the emitted artifact, but it cannot
          build one through this package.
        </p>
        <p>
          The Haskell trace finishes with the names gone: <code>mapTree</code> is <code>d1</code>, <code>Branch</code>{" "}
          is <code>c1</code>, and <code>gpuMain</code> has settled at <code>i32</code>. Nothing in the emitted module
          remembers WebGPU either. The artifact runs on any Wasm host; only the build machine ever needed a GPU.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
