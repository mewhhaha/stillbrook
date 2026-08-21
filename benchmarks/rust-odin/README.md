# Rust and Odin comparison benchmark

This directory preserves the measurements used by the Still Brook article
[Two kinds of control](../../app/routes/articles.two-kinds-of-control/route.tsx).
The benchmark ran on a GitHub Actions `ubuntu-latest` runner on July 13, 2026.

## Toolchains

- Rust `1.97.0` (`2d8144b78`, LLVM `22.1.6`)
- Cargo `1.97.0`
- Odin `dev-2026-07-nightly:819fdc7`, installed from release tag
  `dev-2026-07a`
- Ubuntu 24.04, two logical CPUs on an AMD EPYC 9V74 host
- Hyperfine for timing; `/usr/bin/time` for peak resident memory

The generated fixture, commands, and source programs are in
[`harness.yml`](harness.yml). Raw Hyperfine JSON and one-run RSS readings are
under [`raw/`](raw/). [`results.md`](results.md) is the compact machine-generated
summary.

## Compilation fixture

The larger fixture generated 256 dependency-free source files in each language.
Every file contains one integer-mixing procedure; `main` calls all 256 in order.
The benchmark measured:

1. A tiny one-file program compiled directly with `rustc` or `odin build -file`.
2. A clean unoptimized/development build of the 256-file program.
3. A clean optimized build. Rust used one codegen unit, thin LTO, and aborting
   panics; Odin used `-o:speed`.
4. A warm rebuild after changing a comment in one leaf file. Cargo retained its
   incremental directory; Odin rebuilt the package.

Clean builds used five timed runs after one warm-up. Tiny and edit builds used
ten timed runs after warm-up.

| Build | Rust median | Odin median | Odin / Rust |
|---|---:|---:|---:|
| One file, default | 62.7 ms | 720.3 ms | 11.5× |
| 256 files, clean development | 245.3 ms | 926.9 ms | 3.8× |
| One leaf edited, warm state | 214.9 ms | 943.0 ms | 4.4× |
| 256 files, clean optimized | 3.195 s | 3.511 s | 1.10× |

These numbers compare the complete installed toolchains, including their current
standard-library distribution and build strategy. They are not parser-only or
backend-only timings.

## Runtime fixture

All three pairs were compiled as optimized native x86-64 executables and were
required to print identical checksums before timing.

- **Scan:** allocate eight million `u64` values, initialize them with a fixed
  xorshift sequence, then perform twelve branchy update passes (96 million
  updates).
- **Tree:** construct a flat complete binary tree of `(1 << 22) - 1` nodes, then
  traverse it depth-first ten times (about 42 million node visits).
- **Map:** insert 1.5 million mixed integer keys into each language's default map,
  then perform five complete lookup passes (7.5 million lookups).

| Workload | Rust median | Odin median | Lead | Peak RSS Rust / Odin |
|---|---:|---:|---:|---:|
| Integer scan | 572.7 ms | 587.6 ms | Rust 2.6% | 62.97 / 62.74 MiB |
| Flat tree traversal | 97.8 ms | 95.8 ms | Odin 2.1% | 65.94 / 65.73 MiB |
| Default hash map | 581.9 ms | 759.4 ms | Rust 30.5% | 35.93 / 49.77 MiB |

Runtime timings used ten runs after three warm-ups. Peak RSS is a separate single
run and should be read more coarsely than the medians.

## Executable size

The Linux executables were not stripped.

| Workload | Rust | Odin |
|---|---:|---:|
| Scan | 430,848 B | 222,000 B |
| Tree | 431,440 B | 222,000 B |
| Map | 445,760 B | 230,648 B |

## Scope

The numeric and tree programs isolate code generation over matched representations.
The map program intentionally compares each language's default container, which
brings hashing policy and library implementation into the result. Alternative
allocators, hashers, containers, target flags, crate graphs, procedural macros,
and CPUs can change the ranking. The raw data is retained so later runs can be
compared without rewriting the original result.
