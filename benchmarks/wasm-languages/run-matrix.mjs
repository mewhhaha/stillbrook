import { spawnSync } from "node:child_process";
import console from "node:console";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const root = path.dirname(fileURLToPath(import.meta.url));
const build = process.env.OUT_DIR ?? path.join(root, "build");
const repeatBuild = process.env.REPEAT_OUT_DIR;
const cpu = process.env.CPU;
const profiles = [
  { label: "C", kind: "direct", module: "c.wasm" },
  { label: "Grain Number", kind: "grain", module: "grain-number.wasm" },
  { label: "Rust", kind: "direct", module: "rust.wasm" },
  { label: "standard Go", kind: "standard-go", module: "standard-go.wasm" },
  { label: "Zig", kind: "direct", module: "zig.wasm" },
  { label: "Grain Int32/Float64", kind: "grain", module: "grain-primitives.wasm" },
  { label: "AssemblyScript", kind: "direct", module: "assemblyscript.wasm" },
  { label: "TinyGo", kind: "tinygo", module: "tinygo.wasm" },
  { label: "MoonBit", kind: "direct", module: "moonbit.wasm" },
];
const workloads = ["fib", "primes", "mandelbrot"];
const results = [];
const repeatMeasurements = [];

function runCommand(command, args) {
  const output = spawnSync(command, args, { encoding: "utf8" });
  if (output.error) throw output.error;
  if (output.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${output.stderr || output.stdout}`);
  }
  return output.stdout.trim();
}

function firstLine(output) {
  return output.split("\n", 1)[0];
}

function versionFrom(output) {
  const version = output.match(/\d+\.\d+\.\d+(?:-[\w.]+)?/);
  if (!version) throw new Error(`could not find a version in ${JSON.stringify(output)}`);
  return version[0];
}

function goVersionFrom(output) {
  const version = output.match(/^go version go(\S+)/)?.[1];
  if (!version) throw new Error(`could not find a Go version in ${JSON.stringify(output)}`);
  return version;
}

function gzipSize(bytes) {
  const gzip = spawnSync("gzip", ["-9", "-n", "-c"], { input: bytes });
  if (gzip.error) throw gzip.error;
  if (gzip.status !== 0) {
    throw new Error(`gzip failed: ${gzip.stderr.toString().trim()}`);
  }
  return gzip.stdout.length;
}

function toolchainVersions() {
  const clang = firstLine(runCommand(process.env.CLANG ?? "clang", ["--version"]));
  const rustc = firstLine(runCommand(process.env.RUSTC ?? "rustc", ["--version"]));
  const zig = firstLine(runCommand(process.env.ZIG ?? "zig", ["version"]));
  const assemblyscript = firstLine(
    runCommand("pnpm", ["--package=assemblyscript@0.28.19", "dlx", "asc", "--version"]),
  );
  const grain = firstLine(runCommand(process.env.GRAIN ?? "grain", ["--version"]));
  const moon = firstLine(runCommand(process.env.MOON ?? "moon", ["version"]));
  const go = firstLine(runCommand(process.env.GO ?? "go", ["version"]));
  const tinygo = firstLine(runCommand(process.env.TINYGO ?? "tinygo", ["version"]));

  return {
    clang: versionFrom(clang),
    rustc: rustc.replace(/^rustc\s+/, ""),
    zig: versionFrom(zig),
    assemblyscript: versionFrom(assemblyscript),
    grain: versionFrom(grain),
    moon: versionFrom(moon),
    go: goVersionFrom(go),
    tinygo: versionFrom(tinygo),
  };
}

async function artifactMetadata(profile, directory) {
  const bytes = await readFile(path.join(directory, profile.module));
  return {
    rawBytes: bytes.length,
    gzipBytes: gzipSize(bytes),
    sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes,
  };
}

async function collectArtifacts(directory) {
  return Object.fromEntries(
    await Promise.all(
      profiles.map(async (profile) => [profile.label, await artifactMetadata(profile, directory)]),
    ),
  );
}

async function compareRepeatBuild(artifacts) {
  if (!repeatBuild) {
    return "not checked; set REPEAT_OUT_DIR to the output of a second build";
  }

  const repeatedArtifacts = await collectArtifacts(repeatBuild);
  for (const profile of profiles) {
    const initial = artifacts[profile.label];
    const repeated = repeatedArtifacts[profile.label];
    if (!initial.bytes.equals(repeated.bytes)) {
      throw new Error(
        `${profile.label} differs between ${build} (${initial.sha256}) and ` +
          `${repeatBuild} (${repeated.sha256})`,
      );
    }
  }
  return `all ${profiles.length} Wasm artifacts were byte-identical across two builds`;
}

async function environment() {
  const logicalCpu = cpu === undefined ? null : Number.parseInt(cpu, 10);
  if (cpu !== undefined && !/^\d+$/.test(cpu)) {
    throw new Error(`CPU must name one logical CPU, received ${JSON.stringify(cpu)}`);
  }

  const cpuInfo = await readFile("/proc/cpuinfo", "utf8");
  const cpuModel = cpuInfo.match(/^model name\s*:\s*(.+)$/m)?.[1];
  if (!cpuModel) throw new Error("could not find a CPU model in /proc/cpuinfo");

  let governor = "unavailable";
  if (logicalCpu !== null) {
    try {
      governor = (
        await readFile(
          `/sys/devices/system/cpu/cpu${logicalCpu}/cpufreq/scaling_governor`,
          "utf8",
        )
      ).trim();
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return {
    date: process.env.BENCHMARK_DATE ?? new Date().toISOString().slice(0, 10),
    os: runCommand("uname", ["-srmo"]),
    cpu: cpuModel,
    logicalCpu,
    node: process.version.replace(/^v/, ""),
    v8: process.versions.v8,
    governor,
  };
}

function protocol(buildRepeat) {
  const processDescription = cpu
    ? `one fresh Node process per module/workload pair, pinned to logical CPU ${cpu}`
    : "one fresh Node process per module/workload pair, not pinned to a CPU";
  return {
    process: processDescription,
    calibration:
      "double repetitions until a batch reaches 500 ms; restart five warmups if a warm batch falls below 400 ms",
    measurement: "median and p10-p90 of 15 batches",
    performanceRepeat:
      "Grain Int32/Float64 primes measured in a second fresh process because the first trace drifted",
    size: "timed Wasm artifact; gzip -9 -n",
    buildRepeat,
  };
}

const recordingEnvironment = await environment();
const recordingToolchains = toolchainVersions();
const artifacts = await collectArtifacts(build);
const repeatBuildEvidence = await compareRepeatBuild(artifacts);

for (const workload of workloads) {
  const rotation = workloads.indexOf(workload) * 3;
  const orderedProfiles = [...profiles.slice(rotation), ...profiles.slice(0, rotation)];
  for (const profile of orderedProfiles) {
    const processRuns =
      profile.label === "Grain Int32/Float64" && workload === "primes" ? 2 : 1;
    for (let processRun = 0; processRun < processRuns; processRun += 1) {
      const benchmarkArgs = [
        "--no-warnings",
        path.join(root, "benchmark.mjs"),
        profile.label,
        profile.kind,
        path.join(build, profile.module),
        workload,
      ];
      const command = cpu ? "taskset" : process.execPath;
      const args = cpu ? ["-c", cpu, process.execPath, ...benchmarkArgs] : benchmarkArgs;
      const benchmark = spawnSync(command, args, { encoding: "utf8" });
      if (benchmark.error) throw benchmark.error;
      if (benchmark.status !== 0) {
        throw new Error(
          `${profile.label} ${workload} failed:\n${benchmark.stderr || benchmark.stdout}`,
        );
      }
      const measurement = JSON.parse(benchmark.stdout);
      const artifact = artifacts[profile.label];
      const recordedMeasurement = {
        label: measurement.label,
        kind: measurement.kind,
        size: { rawBytes: artifact.rawBytes, gzipBytes: artifact.gzipBytes },
        workload: measurement.workload,
      };
      if (processRun === 0) {
        results.push(recordedMeasurement);
      } else {
        repeatMeasurements.push(recordedMeasurement);
      }
      const runLabel = processRun === 0 ? "" : " (fresh-process repeat)";
      process.stderr.write(`finished ${profile.label}: ${workload}${runLabel}\n`);
    }
  }
}

console.log(
  JSON.stringify(
    {
      environment: recordingEnvironment,
      toolchains: recordingToolchains,
      protocol: protocol(repeatBuildEvidence),
      sha256: Object.fromEntries(
        profiles.map((profile) => [profile.label, artifacts[profile.label].sha256]),
      ),
      results,
      repeatMeasurements,
    },
    null,
    2,
  ),
);
