import console from "node:console";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { WASI } from "node:wasi";

const [, , label, kind, modulePath, workloadName] = process.argv;
const validKinds = new Set(["direct", "grain", "standard-go", "tinygo"]);
const workloads = {
  fib: { args: [30], expected: 832_040 },
  primes: { args: [100_000], expected: 9_592 },
  mandelbrot: { args: [128, 128, 50], expected: 201_544 },
};
const workload = workloads[workloadName];

if (!label || !validKinds.has(kind) || !modulePath || !workload) {
  throw new Error(
    "usage: node benchmark.mjs <label> <direct|grain|standard-go|tinygo> " +
      "<module.wasm> <fib|primes|mandelbrot>",
  );
}

const moduleBytes = await readFile(modulePath);
const gzip = spawnSync("gzip", ["-9", "-n", "-c"], { input: moduleBytes });
if (gzip.error) throw gzip.error;
if (gzip.status !== 0) {
  throw new Error(`gzip failed: ${gzip.stderr.toString().trim()}`);
}
const gzipBytes = gzip.stdout.length;

const module = await globalThis.WebAssembly.compile(moduleBytes);
let imports = {};
let wasi;
if (kind === "grain") {
  imports = { wasi_snapshot_preview1: { fd_write: () => 0 } };
} else if (kind === "standard-go" || kind === "tinygo") {
  wasi = new WASI({ version: "preview1" });
  imports = { wasi_snapshot_preview1: wasi.wasiImport };
}

const instance = await globalThis.WebAssembly.instantiate(module, imports);
if (kind === "grain") instance.exports._start();
if (kind === "standard-go" || kind === "tinygo") wasi.initialize(instance);

const exportedFunction = instance.exports[workloadName];
if (typeof exportedFunction !== "function") {
  throw new Error(`${label} does not export ${workloadName}`);
}

const tagGrainNumber = (value) => (value << 1) | 1;
const untagGrainNumber = (value) => value >> 1;
const args = kind === "grain" ? workload.args.map(tagGrainNumber) : workload.args;
const call =
  kind === "grain"
    ? () => untagGrainNumber(exportedFunction(...args))
    : () => exportedFunction(...args);

const validation = call();
if (validation !== workload.expected) {
  throw new Error(
    `${label} ${workloadName} returned ${validation}; expected ${workload.expected}`,
  );
}

function runBatch(repetitions) {
  let result;
  let checksum = 0;
  const started = process.hrtime.bigint();
  for (let repetition = 0; repetition < repetitions; repetition += 1) {
    result = call();
    checksum = (checksum + result) | 0;
  }
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1_000_000;
  const expectedChecksum = Math.imul(workload.expected, repetitions);
  if (result !== workload.expected || checksum !== expectedChecksum) {
    throw new Error(`${label} ${workloadName} changed its result during measurement`);
  }
  return elapsedMs;
}

let repetitions = 1;
while (repetitions < 1_048_576) {
  if (runBatch(repetitions) >= 500) break;
  repetitions *= 2;
}

let warmup = 0;
while (warmup < 5) {
  const elapsedMs = runBatch(repetitions);
  if (elapsedMs < 400 && repetitions < 1_048_576) {
    repetitions *= 2;
    warmup = 0;
    continue;
  }
  warmup += 1;
}

const batchSamplesMs = [];
for (let sample = 0; sample < 15; sample += 1) {
  batchSamplesMs.push(runBatch(repetitions));
}
const samplesMs = batchSamplesMs.map((elapsedMs) => elapsedMs / repetitions);

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.round((sorted.length - 1) * fraction)];
}

console.log(
  JSON.stringify(
    {
      label,
      kind,
      modulePath,
      environment: {
        node: process.version,
        v8: process.versions.v8,
        platform: process.platform,
        arch: process.arch,
      },
      size: { rawBytes: moduleBytes.length, gzipBytes },
      workload: {
        name: workloadName,
        args: workload.args,
        expected: workload.expected,
        repetitions,
        medianMs: percentile(samplesMs, 0.5),
        p10Ms: percentile(samplesMs, 0.1),
        p90Ms: percentile(samplesMs, 0.9),
        samplesMs,
        batchSamplesMs,
      },
    },
    null,
    2,
  ),
);
