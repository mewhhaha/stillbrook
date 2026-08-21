import { DataTable, H2, Prose } from "../../components";

const compileRows = [
  ["One file, default", "62.7 ms", "720.3 ms", "11.5×"],
  ["256 files, clean development", "245.3 ms", "926.9 ms", "3.8×"],
  ["One leaf edited, warm state", "214.9 ms", "943.0 ms", "4.4×"],
  ["256 files, clean optimized", "3.195 s", "3.511 s", "1.10×"],
] as const;

const runtimeRows = [
  ["Integer scan", "572.7 ms", "587.6 ms", "Rust 2.6%", "62.97 / 62.74 MiB"],
  ["Flat tree traversal", "97.8 ms", "95.8 ms", "Odin 2.1%", "65.94 / 65.73 MiB"],
  ["Default hash map", "581.9 ms", "759.4 ms", "Rust 30.5%", "35.93 / 49.77 MiB"],
] as const;

export function RustOdinEssay() {
  return (
    <Prose>
      <p>
        Rust out-compiled Odin in every fixture of this recorded run, and the matched runtime programs finished
        within three percent of each other. If both results feel backwards, that is the slogans talking — “the
        simple language builds faster” and “the borrow checker buys faster code” each walked into this benchmark,
        and neither walked out.
      </p>
      <p>
        A language benchmark measures a toolchain distribution, a build strategy, generated code, and two standard
        libraries all at once, which is how it can embarrass both camps in one table. So the useful version of the
        exercise is narrow: reproduce the artifacts, disclose the confounders, and connect the numbers to where
        each language actually places control.
      </p>

      <H2>Recorded conditions</H2>
      <p>
        The run used a GitHub Actions <code>ubuntu-latest</code> machine exposing two logical CPUs from an AMD EPYC
        9V74 host, with Rust 1.97.0 on LLVM 22.1.6 against Odin <code>dev-2026-07-nightly:819fdc7</code>. The{" "}
        <a href="https://github.com/mewhhaha/stillbrook/tree/main/benchmarks/rust-odin">benchmark record</a> keeps
        everything needed to argue with it: the workflow, generated fixtures, raw Hyperfine JSON, checksums,
        resident-memory readings, binary sizes, and toolchain output.
      </p>
      <p>
        The compile fixture generated 256 dependency-free files per language, timed clean development and
        optimized builds over five measured runs after a warm-up, and let Cargo keep incremental state for the
        one-leaf edit. Optimized Rust meant one codegen unit, ThinLTO, and aborting panics; Odin got{" "}
        <code>-o:speed</code>.
      </p>
      <DataTable
        head={["Build", "Rust median", "Odin median", "Odin / Rust"]}
        rows={compileRows}
        caption="Complete installed toolchains were timed, with lower results better."
      />
      <p>
        Resist the headline row. The 11.5× on one tiny file mostly measures startup and distribution choices —
        Rust ships a prebuilt standard library — and the gap narrows to ten percent on the optimized build, where
        both pipelines spend their time marinating in LLVM. A different crate graph, procedural macros, or another
        Odin configuration could reorder the whole table.
      </p>

      <H2>Matched runtime work</H2>
      <p>
        Three optimized native pairs printed identical checksums before any timing started. The scan made twelve
        branchy passes over eight million integers, the tree fixture walked a flat complete binary tree ten times,
        and the map fixture inserted 1.5 million mixed integer keys before five lookup passes — ten Hyperfine runs
        after three warm-ups, with peak resident memory from a separate single run.
      </p>
      <DataTable
        head={["Workload", "Rust median", "Odin median", "Lead", "Peak RSS Rust / Odin"]}
        rows={runtimeRows}
        caption="Matched checksums precede every timing. RSS should be read more coarsely than the medians."
      />
      <p>
        The scan and tree rows are a tie for any practical purpose; two and three percent on one shared runner
        supports no broad conclusion. The interesting row is the map, and it is a library comparison wearing a
        language costume — each side&apos;s default container and hashing policy owns that 30.5 percent as much as
        either compiler does. Swap containers and you have started a different experiment.
      </p>
      <p>
        Binary size draws one more boundary worth keeping visible: 430,848 unstripped bytes for the Rust scan
        against 222,000 for Odin. Startup objects, panic policy, and standard-library linkage all live inside
        those artifacts, so the record refuses to call the difference pure code generation.
      </p>

      <H2>Two placements of control</H2>
      <p>
        What the table cannot show is what each language spends its budget on. Rust&apos;s{" "}
        <a href="https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html">ownership model</a> lets a library
        encode exclusive mutation and destruction rules for callers it has never met — reusable proofs, paid for
        in design effort and compile time. Odin&apos;s{" "}
        <a href="https://odin-lang.org/docs/overview/#allocators">allocator model</a> routes policy through an
        implicit context and leaves cleanup at the call site with <code>defer</code>, keeping the executable&apos;s
        memory plan next to the code that owns it.
      </p>
      <p>
        No benchmark selects between those boundaries; this one only retires two slogans on its own fixtures. The
        raw files hold the evidence in both directions — <code>runtime-tree.json</code> still gives Odin a
        1.98-millisecond lead, <code>compile-tiny.json</code> gives Rust more than 650 milliseconds — and an
        honest report prints both rows.
      </p>
    </Prose>
  );
}
