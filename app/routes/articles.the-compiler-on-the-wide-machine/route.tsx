import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, FlowSequence, H2, Prose, PullQuote } from "../../components";

export const article = {
  title: "The compiler on the wide machine",
  description:
    "A compiler can run on the GPU only if the language it compiles breaks the build into many small independent jobs.",
  published: "2026-07-11T10:00:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-compiler-on-the-wide-machine.jpg",
    alt: "Close-up of a silicon wafer showing a grid of identical microchip dies shimmering in rainbow iridescence.",
    credit: {
      author: "Rob Bulmahn",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:5C2A5953R_-_49913961083_%E2%80%93_Silicon_Wafer_20200519.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Plenty of languages compile programs for GPUs. The idea I keep circling back to runs the
          other way: a language whose compiler does much of its own work there, thousands of narrow
          workers turning source into machine code together.
        </p>
        <p>
          You can&apos;t get there by porting the CPU loops to kernels. GPUs reward regular batches
          and punish branching &mdash; NVIDIA&apos;s CUDA guide tells you outright to minimize{" "}
          <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html#basics-of-simt">
            divergent paths inside a warp
          </a>. And a compiler, at least the ordinary kind, spends its day walking syntax trees,
          chasing symbol links, and waiting on whatever the previous pass owed it. It&apos;s close to
          the worst GPU workload I can think of.
        </p>

        <H2>Compile on, not for</H2>
        <p>
          Worth being precise here, because the two get conflated. NVIDIA&apos;s toolchain separates
          host and device code, lowers the device side to PTX, and assembles binaries for the target
          GPUs. That&apos;s{" "}
          <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/nvcc.html#nvcc-compilation-workflow">
            compilation for a GPU
          </a>, and it&apos;s well understood. What I&apos;m describing is stranger: the GPU running
          parts of the compiler pipeline itself.
        </p>
        <p>
          Existing compilers already show where the seams are. Rust splits code generation into
          independent units that LLVM can chew on concurrently, while parsing and macro expansion have
          stayed serial. Read the{" "}
          <a href="https://rustc-dev-guide.rust-lang.org/parallel-rustc.html">
            parallel compiler notes
          </a>
          {" "}and the pattern is hard to miss: the compiler goes parallel wherever it can name a
          piece of work that doesn&apos;t have to touch shared state.
        </p>
        <PullQuote>A fast compiler begins with a language that leaves fewer secrets between files.</PullQuote>

        <H2>Make the source wide</H2>
        <p>
          A language designed for this machine would bake independence into its semantics. Modules
          publish explicit signatures, public values carry declared types, and an import is never
          textual inclusion in disguise. Macros can&apos;t peek at the filesystem, or the clock, or
          another module&apos;s private syntax. Type inference stops at the function or module
          boundary instead of quietly stitching the whole program together.
        </p>
        <p>
          With those rules in place the compiler can flatten its work. Source text turns into arrays
          of tokens and symbol records instead of a forest of pointer-linked objects, and type
          checking becomes a batch of local constraint problems over read-only interface tables.
          Constant folding, specialization, instruction selection: the same operation applied across
          hundreds of functions at once, each pass reading immutable input and writing a fresh
          result, so thousands of workers never queue behind a lock.
        </p>
        <p>
          A small CPU scheduler still runs the show. It owns the dependency graph, the weird
          diagnostics, linking, anything that needs a whole-program view, while the GPU gets the
          broad middle of the pipeline, where hundreds of similar jobs sit ready at the same time.
          The compiler itself stays alive as a persistent process, holding source and intermediate
          representation resident so an edit doesn&apos;t pay for a trip across the bus.
        </p>
        <FlowSequence
          steps={[
            { title: "Read explicit interfaces", detail: "The CPU resolves the dependency frontier" },
            { title: "Flatten local jobs", detail: "Functions become tokens, symbols, and constraints" },
            { title: "Run wide passes", detail: "The GPU checks and lowers independent functions in batches" },
            { title: "Finish global work", detail: "The CPU links, formats diagnostics, and updates the cache" },
          ]}
          caption="A heterogeneous compiler keeps scheduling and whole-program work on the CPU while the broad middle runs as batches."
        />
        <p>
          Incremental compilation is where this gets useful day to day. Query-based compilers
          already model their work as a dependency graph of repeatable computations, so when an edit
          dirties one node, the compiler reuses everything unaffected and sends only the newly ready
          frontier to the GPU. The{" "}
          <a href="https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation-in-detail.html">
            graph is both a cache and a schedule
          </a>.
        </p>

        <H2>Speed needs a crowd</H2>
        <p>
          A tiny program will probably compile slower this way. Starting a device, launching
          kernels, and moving data all have fixed costs, and a hundred-line file does nothing to
          amortize them. The GPU earns its place when a workspace holds enough independent
          functions, when a build server batches several projects, or when a coding agent wants many
          candidate changes compiled at once. What it needs is a backlog.
        </p>
        <p>
          Development builds could favor local optimization and immediate machine code, saving the
          expensive global work for an explicit release build, and the rare branch-heavy passes
          would stay on the CPU, which handles them fine. You end up with a heterogeneous compiler,
          each processor doing the work whose shape suits it.
        </p>
        <Callout variant="note">
          <p>
            The GPU has to stay optional. The same immutable job graph should run on a multicore CPU
            when no suitable device is around; a program can&apos;t mean something different because
            of the compiler&apos;s hardware.
          </p>
        </Callout>
        <p>
          The surface language might look ordinary; what would mark it out is everything it refuses.
          No hidden imports, no ambient macros, no global inference, no passes that rewrite shared
          state in place &mdash; each of those conveniences spends exactly the independence the GPU
          needs. I don&apos;t know whether anyone will build this language. But a compiler that
          answers before you&apos;ve looked away from the editor seems like a fair trade.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
