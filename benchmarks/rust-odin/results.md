# Rust and Odin benchmark run

Runner: GitHub Actions ubuntu-latest

```text
rustc 1.97.0 (2d8144b78 2026-07-07)
binary: rustc
commit-hash: 2d8144b7880597b6e6d3dfd63a9a9efae3f533d3
commit-date: 2026-07-07
host: x86_64-unknown-linux-gnu
release: 1.97.0
LLVM version: 22.1.6
cargo 1.97.0 (c980f4866 2026-06-30)
odin version dev-2026-07-nightly:819fdc7
CPU(s):                                  2
On-line CPU(s) list:                     0,1
Model name:                              AMD EPYC 9V74 80-Core Processor
Thread(s) per core:                      2
Core(s) per socket:                      1
Socket(s):                               1
NUMA node0 CPU(s):                       0,1
```

## compile-tiny
- rustc tiny: median=0.06268201890000001s mean=0.0633630299s min=0.0598245394s max=0.0699233694s
- odin tiny: median=0.7203281699000001s mean=0.7228103408000001s min=0.7155515124s max=0.7505329514000001s

## compile-dev-clean
- cargo dev clean: median=0.24530088244s mean=0.24592110764000003s min=0.24350443644s max=0.24912806444000002s
- odin dev clean: median=0.92688420044s mean=0.93372689764s min=0.92224298444s max=0.96105292744s

## compile-release-clean
- cargo release clean: median=3.1954151682s mean=3.198680401s min=3.1653517232s max=3.2220671482000003s
- odin speed clean: median=3.5110656822s mean=3.5187961012000004s min=3.4812032982s max=3.5716828402s

## compile-edit
- cargo one-file edit: median=0.21491169040000002s mean=0.21628093500000004s min=0.21057697190000002s max=0.23206424990000002s
- odin one-file edit: median=0.9429795929000001s mean=0.9425905410000002s min=0.9305497849000001s max=0.9509107539000001s

## runtime-scan
- rust scan: median=0.5726800856600001s mean=0.5725775636599999s min=0.5719384266599999s max=0.57288620566s
- odin scan: median=0.5876295631599999s mean=0.58763957436s min=0.58721352266s max=0.58831049866s

## runtime-tree
- rust tree: median=0.09780401760000001s mean=0.0977519235s min=0.09718606260000001s max=0.09857968460000001s
- odin tree: median=0.0958238861s mean=0.09583521180000001s min=0.09557100360000001s max=0.09612046260000001s

## runtime-map
- rust map: median=0.5818962200400001s mean=0.5773272520400001s min=0.52653906104s max=0.60176094804s
- odin map: median=0.7593535140400001s mean=0.7609414203400001s min=0.7250021170400001s max=0.7859512240400001s

## Peak RSS (KiB)
- scan: Rust 64480, Odin 64248
- tree: Rust 67520, Odin 67304
- map: Rust 36796, Odin 50964

## Binary sizes (bytes)
rust/target/release/scan 430848
rust/target/release/tree 431440
rust/target/release/map 445760
odin/scan-odin 222000
odin/tree-odin 222000
odin/map-odin 230648
