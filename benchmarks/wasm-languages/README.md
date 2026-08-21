# WebAssembly language benchmark

This is the reproducible benchmark behind “Six loops finish level.” It keeps
the three source algorithms aligned, validates every result before timing, and
does not run a common post-optimizer over the toolchains’ output.

The workloads are recursive `fib(30)`, trial division below `100,000`, and a
`128 × 128` Mandelbrot checksum capped at 50 iterations. The expected results
are `832040`, `9592`, and `201544`. These inputs fit every language’s numeric
range; matching results do not imply identical dynamic work after each compiler
has optimized the source.

## Build

`build.sh` uses these commands by default: `clang`, `rustc`, `zig`, `grain`,
`moon`, `go`, and `tinygo`. Override any path with the corresponding uppercase
environment variable. AssemblyScript 0.28.19 runs through `pnpm dlx`.

```sh
./build.sh
```

The recorded run used clang 22.1.6, rustc 1.96.0-nightly, Zig 0.15.1,
AssemblyScript 0.28.19, Grain 0.7.2, Moon 0.1.20260703, Go 1.26.4, and TinyGo
0.41.1. Standard Go is built as a stripped WASI reactor with
`-buildmode=c-shared -ldflags="-s -w"`;
TinyGo uses `-target=wasip1 -buildmode=c-shared -scheduler=none -opt=2`;
AssemblyScript uses its stub runtime.
Grain is built with `--elide-type-info` in two profiles: general `Number` code,
and explicit `Int32`/`Float64` operations behind the language’s `Number` export
ABI.

## Run

Run every module/workload pair in a separate Node process. The second argument
selects the small amount of ABI/runtime setup the module needs. For example:

```sh
node --no-warnings benchmark.mjs C direct build/c.wasm fib
node --no-warnings benchmark.mjs C direct build/c.wasm primes
node --no-warnings benchmark.mjs C direct build/c.wasm mandelbrot
```

Use the same three commands for each module and the ABI kind shown in
`results.json`. The runner compiles and initializes once, doubles the calls per
batch until a batch lasts at least 500 ms, runs five warm batches, then reports
the median and 10th/90th percentile of fifteen measured batches. Size is the
raw module and `gzip -9 -n` output.

`run-matrix.mjs` runs the full matrix in rotated order and writes the complete
`results.json` schema: the recording environment, toolchain versions, protocol,
artifact SHA-256 values, and all measurements. It calculates each raw size,
deterministic `gzip -9 -n` size, and SHA-256 directly from the built artifact.
Because the typed-Grain prime trace drifted during the first corrected run, the
matrix records that pair again in a second fresh process under
`repeatMeasurements`.

Build once into the normal output directory and again into a separate directory,
then use one recording command. `REPEAT_OUT_DIR` makes the recorder compare every
artifact byte-for-byte and fail on a mismatch; its result is recorded as the
protocol's `buildRepeat` evidence. Set `CPU` to pin each fresh Node process to
one logical CPU, and `OUT_DIR` if the modules are elsewhere:

```sh
OUT_DIR=build ./build.sh
OUT_DIR=build-repeat ./build.sh
CPU=15 OUT_DIR=build REPEAT_OUT_DIR=build-repeat \
  node --no-warnings run-matrix.mjs > results.json
```

`results.json` records the full samples behind the rounded article table. They came from
Node 24.12.0 (V8 13.6) on Linux x86-64 with an AMD Ryzen 7 7800X3D. CPU frequency
scaling and a single engine still limit what the table can establish.
