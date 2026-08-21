# Forced-inline code-size benchmark

This directory preserves the fixture behind “The call was cheaper.” It compares
one transform copied into 1,024 template instantiations with the same transform
kept in one outlined function. Both binaries dispatch through the same table,
perform 30 million calls, and must print checksum `5086929079838441426`.

## Build and inspect

The recorded run used clang 22.1.6 on Linux x86-64 with an AMD Ryzen 7 7800X3D.
Both binaries used `-O3 -march=native`; LTO was disabled. Build them with:

```sh
clang++ main.cpp -std=c++20 -O3 -march=native -DINLINE_VARIANT=1 -o inline
clang++ main.cpp -std=c++20 -O3 -march=native -DINLINE_VARIANT=0 -o outlined
size inline outlined
llvm-objdump --demangle --no-show-raw-insn -d inline > inline.asm
llvm-objdump --demangle --no-show-raw-insn -d outlined > outlined.asm
```

Run each binary once to warm it, then collect seven alternating samples pinned
to one logical CPU:

```sh
taskset -c 0 ./inline
taskset -c 0 ./outlined
for binary in inline outlined inline outlined inline outlined inline outlined inline outlined inline outlined inline outlined; do
  taskset -c 0 ./$binary
done
```

The nanosecond samples were:

| Variant | Samples | Median |
|---|---|---:|
| Forced inline | 305844360, 285860083, 287709953, 310163208, 292670437, 288556799, 288566849 | 288566849 |
| Outlined | 199197487, 198930809, 215593284, 211253126, 220759117, 200881759, 200555170 | 200881759 |

GNU `size` reported 153,275 text bytes for the forced-inline binary and 71,499
for the outlined binary. The benchmark isolates a deliberately hostile
code-footprint case. Changing the number of instantiations, dispatch order,
compiler, target flags, or processor can change the result.
