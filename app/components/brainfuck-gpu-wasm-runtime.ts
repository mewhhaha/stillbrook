import {
  BRAINFUCK_WASM_WGSL,
  MAX_SOURCE_BYTES,
  MAX_WASM_BYTES,
} from "./brainfuck-gpu-wasm-shader";

const WORD = 4;

export type GpuWasmRuntime = {
  device: GPUDevice;
  bindGroupLayout: GPUBindGroupLayout;
  compilePipeline: GPUComputePipeline;
  emitPipeline: GPUComputePipeline;
};

export type GpuCompileResult = {
  /** The emitted WebAssembly module. */
  wasm: Uint8Array;
  /** Number of Brainfuck commands the GPU compacted. */
  opCount: number;
  /** 0 = ok, 1 = unmatched ], 2 = unmatched [. */
  error: number;
};

export function gpuWasmSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/** Create the device and both compute pipelines. Throws if WebGPU is missing. */
export async function createGpuWasmRuntime(): Promise<GpuWasmRuntime> {
  if (!gpuWasmSupported()) {
    throw new Error("This browser does not expose WebGPU.");
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("WebGPU is present, but no compatible GPU adapter is available.");
  }
  if (adapter.limits.maxComputeInvocationsPerWorkgroup < MAX_SOURCE_BYTES) {
    throw new Error("This adapter cannot run the 256-lane compiler workgroup.");
  }

  const device = await adapter.requestDevice();
  const module = device.createShaderModule({ label: "Brainfuck to Wasm", code: BRAINFUCK_WASM_WGSL });
  const info = await module.getCompilationInfo();
  const errors = info.messages.filter((m) => m.type === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((m) => `WGSL ${m.lineNum}:${m.linePos} ${m.message}`).join("\n"));
  }

  const bindGroupLayout = device.createBindGroupLayout({
    label: "Brainfuck to Wasm buffers",
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
      { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
    ],
  });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] });
  const [compilePipeline, emitPipeline] = await Promise.all([
    device.createComputePipelineAsync({ label: "compile", layout, compute: { module, entryPoint: "compile_program" } }),
    device.createComputePipelineAsync({ label: "emit", layout, compute: { module, entryPoint: "emit_wasm" } }),
  ]);
  return { device, bindGroupLayout, compilePipeline, emitPipeline };
}

/** Run both dispatches for one UTF-8 source buffer and read back the emitted module. */
export async function compileToWasmOnGpu(
  runtime: GpuWasmRuntime,
  sourceBytes: Uint8Array,
): Promise<GpuCompileResult> {
  if (sourceBytes.length > MAX_SOURCE_BYTES) {
    throw new Error(
      `This source is ${sourceBytes.length} UTF-8 bytes; the GPU compiler handles at most ${MAX_SOURCE_BYTES}.`,
    );
  }

  const { device } = runtime;
  const created: GPUBuffer[] = [];
  const make = (size: number, usage: GPUBufferUsageFlags) => {
    const buffer = device.createBuffer({ size, usage });
    created.push(buffer);
    return buffer;
  };

  const sourceBuffer = make(MAX_SOURCE_BYTES * WORD, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
  const paramsBuffer = make(4 * WORD, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
  const opsBuffer = make(MAX_SOURCE_BYTES * WORD, GPUBufferUsage.STORAGE);
  const wasmBuffer = make(MAX_WASM_BYTES * WORD, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
  const reportBuffer = make(4 * WORD, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
  const wasmReadback = make(MAX_WASM_BYTES * WORD, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);
  const reportReadback = make(4 * WORD, GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ);

  try {
    const sourceWords = new Uint32Array(MAX_SOURCE_BYTES);
    sourceWords.set(sourceBytes);
    device.queue.writeBuffer(sourceBuffer, 0, sourceWords);
    device.queue.writeBuffer(paramsBuffer, 0, new Uint32Array([sourceBytes.length, 0, 0, 0]));

    const bindGroup = device.createBindGroup({
      layout: runtime.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: sourceBuffer } },
        { binding: 1, resource: { buffer: paramsBuffer } },
        { binding: 2, resource: { buffer: opsBuffer } },
        { binding: 3, resource: { buffer: wasmBuffer } },
        { binding: 4, resource: { buffer: reportBuffer } },
      ],
    });

    const encoder = device.createCommandEncoder();
    const compile = encoder.beginComputePass();
    compile.setPipeline(runtime.compilePipeline);
    compile.setBindGroup(0, bindGroup);
    compile.dispatchWorkgroups(1);
    compile.end();

    const emit = encoder.beginComputePass();
    emit.setPipeline(runtime.emitPipeline);
    emit.setBindGroup(0, bindGroup);
    emit.dispatchWorkgroups(1);
    emit.end();

    encoder.copyBufferToBuffer(wasmBuffer, 0, wasmReadback, 0, MAX_WASM_BYTES * WORD);
    encoder.copyBufferToBuffer(reportBuffer, 0, reportReadback, 0, 4 * WORD);
    device.queue.submit([encoder.finish()]);

    await Promise.all([
      reportReadback.mapAsync(GPUMapMode.READ),
      wasmReadback.mapAsync(GPUMapMode.READ),
    ]);
    const report = new Uint32Array(reportReadback.getMappedRange().slice(0));
    const words = new Uint32Array(wasmReadback.getMappedRange().slice(0));
    reportReadback.unmap();
    wasmReadback.unmap();

    const opCount = report[0];
    const wasmLen = report[1];
    const error = report[2];
    const wasm = new Uint8Array(wasmLen);
    for (let i = 0; i < wasmLen; i += 1) wasm[i] = words[i] & 0xff;
    return { wasm, opCount, error };
  } finally {
    for (const buffer of created) buffer.destroy();
  }
}
