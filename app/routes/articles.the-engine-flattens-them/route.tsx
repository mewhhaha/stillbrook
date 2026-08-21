import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, NumberLine, Prose } from "../../components";

export const article = {
  title: "Six loops finish level",
  description:
    "A nine-profile WebAssembly rerun finds six prime loops clustering within about two percent in V8, while compiler rewrites, ABIs, and runtimes keep the rest of the table apart.",
  published: "2026-07-13T09:00:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-engine-flattens-them.jpg",
    alt: "Allyson Felix crosses the finish line ahead of four competitors in the women's 200 metres at the 2007 World Championships.",
    credit: {
      author: "Eckhard Pecher",
      license: "CC BY 2.5",
      href: "https://commons.wikimedia.org/wiki/File:Osaka07_D7A_W200M_finish.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const primeLoopFix = [
  " for (int32_t candidate = 2; candidate < limit; candidate += 1) {",
  "   int32_t is_prime = 1;",
  "-  for (int32_t divisor = 2; divisor <= candidate / divisor; divisor += 1) {",
  "+  for (int32_t divisor = 2; divisor * divisor <= candidate; divisor += 1) {",
  "     if (candidate % divisor == 0) { is_prime = 0; break; }",
  "   }",
  "   count += is_prime;",
  " }",
].join("\n");

const compiledFibLoop = [
  "loop $L1",
  "  local.get $p0",
  "  local.tee $l2",
  "  i32.const -2",
  "  i32.add",
  "  local.set $p0",
  "  local.get $l2",
  "  i32.const -1",
  "  i32.add",
  "  call $fib",
  "  ;; accumulator update and loop test omitted",
  "  br_if $L1",
  "end",
].join("\n");

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          The first version of this benchmark collapsed on inspection. I had given C an integer
          division in its inner prime loop while the other languages used multiplication, sent every
          module through one common optimizer, kept the fastest of twenty runs, and extrapolated
          Grain&apos;s longest result. Matching answers had let me compare different work. That is an
          annoyingly small way to invalidate an entire table.
        </p>
        <p>
          I rebuilt it with C, Rust, Zig, AssemblyScript, MoonBit, standard Go, TinyGo, and two Grain
          numeric profiles. In this V8 run, six corrected prime loops cluster within about two
          percent. Fibonacci, module size, and one drifting result make a less convenient point:
          source-level parity does not erase what each compiler and runtime emits.
        </p>

        <H2>Fix the source before timing it</H2>
        <p>
          Every profile now gets recursive <code>fib(30)</code>, trial division below 100,000, and a
          128-by-128 Mandelbrot checksum capped at 50 iterations. The expected returns are 832,040,
          9,592, and 201,544. This is the C change that forced me to discard the old measurements:
        </p>
        <CodeBlock lang="diff" title="c.c" highlight="3-4" code={primeLoopFix} />
        <p>
          Both bounds count the same primes for these positive inputs, but the removed version
          performs integer division on every pass. Of course it had an impact. The corrected
          condition appears in all nine sources, and the{" "}
          <a href="https://github.com/mewhhaha/stillbrook/tree/main/benchmarks/wasm-languages">
            complete source, build commands, hashes, and raw samples
          </a>{" "}
          are published with the article. No shared <code>wasm-opt</code> pass follows the compilers.
        </p>

        <H2>The prime cluster</H2>
        <p>
          C, Rust, Zig, AssemblyScript, and MoonBit expose primitive values directly. TinyGo and
          standard Go are WASI reactors. Grain carries its runtime and a tagged{" "}
          <code>Number</code> export ABI. The build column keeps those three cohorts visible before
          the timings invite a ranking.
        </p>
        <p>
          On a Ryzen 7 7800X3D, I ran each module and workload in a fresh Node 24.12.0 process. Each
          process stayed pinned to logical CPU 15. The runner calibrates batches to at least 500
          milliseconds, restarts its five warm-ups if a batch drops below 400 milliseconds, then
          records fifteen batch averages. The desktop was busy and its governor used powersave, so I
          use these numbers only for broad gaps and clusters.
        </p>
        <DataTable
          head={["Profile", "Build / ABI", "gzip", "fib(30)", "primes", "Mandelbrot"]}
          rows={[
            ["C", "clang 22; direct", "385 B", "3.03 ms", "3.64 ms", "0.426 ms"],
            ["Rust", "rustc 1.96 nightly; direct", "670 B", "1.40 ms", "3.65 ms", "0.424 ms"],
            ["Zig", "Zig 0.15; direct", "398 B", "2.41 ms", "3.64 ms", "0.428 ms"],
            ["AssemblyScript", "0.28; direct, stub runtime", "304 B", "2.60 ms", "3.68 ms", "0.366 ms"],
            ["MoonBit", "Moon 0.1; direct", "475 B", "2.78 ms", "3.60 ms", "0.360 ms"],
            ["TinyGo", "0.41; c-shared, no scheduler, opt=2", "6.3 KiB", "2.40 ms", "3.68 ms", "0.419 ms"],
            ["Go", "1.26; stripped c-shared", "532 KiB", "11.04 ms", "4.56 ms", "0.409 ms"],
            ["Grain Number", "0.7.2; runtime, tagged ABI", "8.9 KiB", "215 ms", "480 ms", "492 ms"],
            ["Grain Int32/Float64", "0.7.2; runtime, tagged ABI", "4.0 KiB", "151 ms", "drifting†", "275 ms"],
          ]}
          align={["left", "left", "right", "right", "right", "right"]}
          caption="Median time per exported call in V8, including host-call and checksum overhead. Lower is faster. †Two fresh typed-Grain processes both jumped after batch four, with later batches taking 5.03–15.86 seconds per call, so no stable median is shown. Sizes use gzip -9 -n."
        />
        <p>
          The prime column supplies the clean result, and it is easier to feel as positions than as
          nine table cells: six direct builds inside one thin bracket, Go alone to their right. I
          have not run another engine or inspected V8&apos;s generated machine code, so neither the
          table nor the axis can assign that convergence to its{" "}
          <a href="https://v8.dev/docs/wasm-compilation-pipeline">tiered compiler</a>.
        </p>
        <NumberLine
          title="Median primes time per exported call across build profiles in this V8 run"
          points={[{ value: 4.56, label: "Go (WASI reactor)", side: "above" }]}
          ranges={[{ from: 3.6, to: 3.68, label: "six direct builds" }]}
          min={3.4}
          max={4.8}
          format={(v) => `${v.toFixed(2)} ms`}
          caption="The primes column as positions on one axis. Both Grain profiles sit far past its right edge, at 480 ms and drifting."
        />
        <p>
          Mandelbrot spreads farther. MoonBit leads there, and the fastest-to-slowest span across the
          same six modules is about 19 percent. The table leaves the cause open.
        </p>

        <H2>What the compilers emitted</H2>
        <p>
          Clang and rustc rewrite Fibonacci before V8 runs it. Their release Wasm keeps one
          recursive <code>call</code> inside a loop and changes the source-level call count. This
          excerpt comes from clang. Rustc emits the same structure.
        </p>
        <CodeBlock
          lang="wat"
          title="clang fib, abridged disassembly"
          highlight="1,10,12"
          code={compiledFibLoop}
        />
        <p>
          The compiler has already changed the workload. Rust&apos;s 1.40 milliseconds and C&apos;s 3.03
          therefore mix those transformations with function-call conventions.
        </p>
        <p>
          Standard Go carries a full WASI reactor. Its prime and Mandelbrot times stay within 1.3
          times the direct modules, while Fibonacci reaches 11.04 milliseconds. The compressed size
          remains in a separate cohort even after the Go linker strips symbols and DWARF.
        </p>
        <p>
          Grain changes the arithmetic too. Its general{" "}
          <a href="https://grain-lang.org/docs/builtin_types"><code>Number</code></a>{" "}
          supports more values than a Wasm primitive, while Grain 0.7.2&apos;s{" "}
          <a href="https://github.com/grain-lang/grain/blob/grain-v0.7.2/stdlib/int32.gr">
            <code>Int32</code> operators
          </a>{" "}
          and{" "}
          <a href="https://github.com/grain-lang/grain/blob/grain-v0.7.2/stdlib/float64.gr">
            <code>Float64</code> operators
          </a>{" "}
          allocate wrappers for arithmetic results. I expected the explicit types to repair the
          slowdown. Instead, the prime samples split into two different speed bands.
        </p>
        <p>
          I have not profiled Grain&apos;s collector, so I cannot assign that drift to allocation. The
          slowdown did repeat. A second fresh process made the same jump after its fourth measured
          batch, and its fifteenth call took 7.83 seconds. The table still says <code>drifting</code>.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
