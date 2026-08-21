#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
out=${OUT_DIR:-"$root/build"}
clang=${CLANG:-clang}
rustc=${RUSTC:-rustc}
zig=${ZIG:-zig}
grain=${GRAIN:-grain}
moon=${MOON:-moon}
go=${GO:-go}
tinygo=${TINYGO:-tinygo}

mkdir -p "$out"

"$clang" --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--strip-all \
  "$root/c.c" -o "$out/c.wasm"

"$rustc" --target wasm32-unknown-unknown --crate-type cdylib -C opt-level=3 \
  -C panic=abort -C link-arg=--strip-all "$root/rust.rs" -o "$out/rust.wasm"

"$zig" build-exe "$root/zig.zig" -target wasm32-freestanding -O ReleaseFast \
  -fno-entry -fstrip --export=fib --export=primes --export=mandelbrot \
  -femit-bin="$out/zig.wasm"

pnpm --package=assemblyscript@0.28.19 dlx asc "$root/assemblyscript.ts" \
  --optimize --noAssert --runtime stub --outFile "$out/assemblyscript.wasm"

grain_build="$out/grain"
mkdir -p "$grain_build"
cp "$root/grain-number.gr" "$root/grain-primitives.gr" "$grain_build"
(cd "$grain_build" && "$grain" compile grain-number.gr --release --elide-type-info \
  -o "$out/grain-number.wasm")
(cd "$grain_build" && "$grain" compile grain-primitives.gr --release --elide-type-info \
  -o "$out/grain-primitives.wasm")

moon_out="$out/moon"
(cd "$root/moonbit" && "$moon" build --target wasm --release --strip --target-dir "$moon_out")
cp "$moon_out/wasm/release/build/wasm-benchmark.wasm" "$out/moonbit.wasm"

(cd "$root" && GOOS=wasip1 GOARCH=wasm "$go" build -buildvcs=false \
  -buildmode=c-shared -ldflags="-s -w" -o "$out/standard-go.wasm" ./standard-go)
(cd "$root" && GOFLAGS=-buildvcs=false "$tinygo" build -target=wasip1 \
  -buildmode=c-shared -scheduler=none -opt=2 -no-debug \
  -o "$out/tinygo.wasm" ./tinygo)
