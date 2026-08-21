"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { BrainfuckSyntaxError, compileBrainfuck } from "./brainfuck-wasm-compiler";
import { BRAINFUCK_SAMPLES, DEFAULT_SAMPLE } from "./brainfuck-samples";
import {
  compileToWasmOnGpu,
  createGpuWasmRuntime,
  gpuWasmSupported,
  type GpuWasmRuntime,
} from "./brainfuck-gpu-wasm-runtime";
import { MAX_SOURCE_BYTES } from "./brainfuck-gpu-wasm-shader";

type Phase = "idle" | "compiling" | "running" | "done" | "error";
type CompilationPath = { kind: "gpu" } | { kind: "cpu"; reason: string };

type RunResult = {
  wat: string;
  wasmBytes: number;
  sourceBytes: number;
  sourceOps: number;
  output: string;
  outputBytes: number;
  compilePhaseMs: number;
  instantiateAndRunMs: number;
  path: CompilationPath;
  trapped: boolean;
};

function byteMismatch(expected: Uint8Array, actual: Uint8Array): string | null {
  if (expected.length !== actual.length) {
    return `GPU emitted ${actual.length} bytes; the CPU reference emitted ${expected.length}`;
  }
  for (let offset = 0; offset < expected.length; offset += 1) {
    if (expected[offset] !== actual[offset]) {
      return `GPU byte ${offset} was ${actual[offset]}; the CPU reference byte was ${expected[offset]}`;
    }
  }
  return null;
}

function compilationPathLabel(path: CompilationPath): string {
  return path.kind === "gpu"
    ? "compiled on the GPU; bytes matched the CPU reference"
    : `compiled on the CPU: ${path.reason}`;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-zinc-950">
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-zinc-500">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function BrainfuckWasmLab() {
  const runtimeRef = useRef<Promise<GpuWasmRuntime> | null>(null);
  const [source, setSource] = useState(DEFAULT_SAMPLE.source);
  const [input, setInput] = useState(DEFAULT_SAMPLE.input);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<RunResult | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const run = async () => {
    setProblem(null);
    setResult(null);
    setPhase("compiling");

    const compileStarted = performance.now();
    let compiled;
    try {
      compiled = compileBrainfuck(source);
    } catch (error) {
      setProblem(
        error instanceof BrainfuckSyntaxError
          ? error.message
          : `Could not compile: ${error instanceof Error ? error.message : String(error)}`,
      );
      setPhase("error");
      return;
    }

    // The CPU emitter is the reference; the GPU must match it byte for byte.
    const sourceBytes = new TextEncoder().encode(source);
    let wasm = compiled.wasm;
    let path: CompilationPath = {
      kind: "cpu",
      reason: "this browser does not expose WebGPU",
    };
    const commands = compiled.program.sourceOps;

    if (sourceBytes.length > MAX_SOURCE_BYTES) {
      path = {
        kind: "cpu",
        reason: `${sourceBytes.length} UTF-8 source bytes exceed the 256-lane workgroup`,
      };
    } else if (gpuWasmSupported()) {
      try {
        const runtime = await (runtimeRef.current ??= createGpuWasmRuntime());
        const gpu = await compileToWasmOnGpu(runtime, sourceBytes);
        const mismatch = byteMismatch(compiled.wasm, gpu.wasm);
        if (gpu.error === 0 && mismatch === null) {
          wasm = gpu.wasm;
          path = { kind: "gpu" };
        } else if (gpu.error !== 0) {
          path = { kind: "cpu", reason: `the GPU reported bracket error ${gpu.error}` };
        } else {
          path = { kind: "cpu", reason: mismatch ?? "the GPU output did not match" };
        }
      } catch (error) {
        runtimeRef.current = null;
        path = {
          kind: "cpu",
          reason: `WebGPU failed: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    const compilePhaseMs = performance.now() - compileStarted;

    setPhase("running");
    await new Promise((resolve) => setTimeout(resolve, 0));

    const inputBytes = new TextEncoder().encode(input);
    let inputPos = 0;
    const output: number[] = [];
    const imports = {
      bf: {
        read: (current: number) => (inputPos < inputBytes.length ? inputBytes[inputPos++] : current),
        write: (byte: number) => output.push(byte & 0xff),
      },
    };

    let trapped = false;
    const runStarted = performance.now();
    try {
      const { instance } = await WebAssembly.instantiate(wasm as BufferSource, imports);
      (instance.exports.run as () => void)();
    } catch {
      trapped = true;
    }
    const instantiateAndRunMs = performance.now() - runStarted;

    setResult({
      wat: compiled.wat,
      wasmBytes: wasm.length,
      sourceBytes: sourceBytes.length,
      sourceOps: commands,
      output: new TextDecoder().decode(Uint8Array.from(output)),
      outputBytes: output.length,
      compilePhaseMs,
      instantiateAndRunMs,
      path,
      trapped,
    });
    if (trapped) {
      setProblem(
        "The program was stopped before it finished — it ran past the step budget or moved the data pointer off the tape.",
      );
    }
    setPhase(trapped ? "error" : "done");
  };

  const busy = phase === "compiling" || phase === "running";
  const status =
    phase === "compiling"
      ? "Compiling the source to a WebAssembly module…"
      : phase === "running"
        ? "Instantiating the module and running it…"
        : phase === "done" && result
          ? result.path.kind === "gpu"
            ? "The GPU wrote a module, the reference bytes matched, and the browser ran it."
            : "The browser ran the CPU reference module."
          : problem ?? "Pick a sample or paste your own, then compile it.";

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900">
      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="bf-source" className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              Brainfuck source
            </label>
            <div className="flex flex-wrap gap-2">
              {BRAINFUCK_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setSource(sample.source);
                    setInput(sample.input);
                  }}
                  className="rounded-md border border-zinc-950/10 bg-white px-2.5 py-1 font-mono text-xs text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="bf-source"
            value={source}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSource(event.target.value)}
            spellCheck={false}
            className="mt-2 h-44 w-full resize-y rounded-xl border border-zinc-950/10 bg-white p-3 font-mono text-xs leading-5 text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                Input for <code className="text-zinc-600 dark:text-zinc-400">,</code>
              </span>
              <input
                value={input}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <button
              type="button"
              onClick={() => void run()}
              disabled={busy}
              className="rounded-lg bg-zinc-950 px-4 py-2 font-mono text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {busy ? "compiling…" : "compile + run"}
            </button>
          </div>
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${problem ? "text-red-700 dark:text-red-400" : "text-zinc-500"}`}
          >
            {status}
          </p>
          {result ? (
            <p className="mt-1 font-mono text-xs text-zinc-500">
              {compilationPathLabel(result.path)}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 space-y-3">
          <dl className="grid grid-cols-2 gap-2">
            <Metric label="source bytes" value={result ? String(result.sourceBytes) : "—"} />
            <Metric label="commands" value={result ? String(result.sourceOps) : "—"} />
            <Metric label="wasm bytes" value={result ? result.wasmBytes.toLocaleString() : "—"} />
            <Metric label="output bytes" value={result ? String(result.outputBytes) : "—"} />
            <Metric
              label="compile phase"
              value={result ? `${result.compilePhaseMs.toFixed(1)} ms` : "—"}
            />
            <Metric
              label="instantiate + run"
              value={result ? `${result.instantiateAndRunMs.toFixed(1)} ms` : "—"}
            />
          </dl>
          <div className="rounded-xl border border-zinc-950/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Program output</p>
            <pre className="mt-2 max-h-40 min-h-16 overflow-auto whitespace-pre-wrap break-words font-mono text-sm text-zinc-900 dark:text-zinc-100">
              {result ? result.output || "(no output)" : "Run the program to fill this buffer."}
            </pre>
          </div>
          <details className="rounded-xl border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-950">
            <summary className="cursor-pointer px-3 py-2 font-mono text-xs uppercase tracking-widest text-zinc-500">
              CPU-rendered WAT (fuel omitted)
            </summary>
            <pre className="max-h-80 overflow-auto border-t border-zinc-950/10 p-3 font-mono text-xs leading-5 text-zinc-700 dark:border-white/10 dark:text-zinc-300">
              {result ? result.wat : "No module yet."}
            </pre>
          </details>
        </div>
      </div>
      <figcaption className="border-t border-zinc-950/10 px-4 py-3 text-sm text-zinc-500 dark:border-white/10 sm:px-5">
        Add plain letters such as &quot;hello&quot; around a compact sample: source bytes rise while the
        command count and module stay fixed. The path label records whether the source still fits one
        workgroup.
      </figcaption>
    </figure>
  );
}
