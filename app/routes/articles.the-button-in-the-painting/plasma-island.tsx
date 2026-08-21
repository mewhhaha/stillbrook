"use client";

import { useEffect, useRef, useState } from "react";

const WGSL = /* wgsl */ `
struct Uniforms { time: f32, width: f32, height: f32, pad: f32 };
@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let corners = array(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(corners[i], 0, 1);
}

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / vec2f(u.width, u.height);
  let p = vec2f(uv.x * (u.width / u.height), uv.y) * 6.0;
  var v = sin(p.x + u.time);
  v += sin(0.5 * (p.y + u.time));
  v += sin(0.4 * (p.x + p.y + u.time));
  v += sin(length(p - vec2f(3.0, 1.5)) + u.time * 1.2);
  let col = 0.5 + 0.5 * cos(6.2832 * (vec3f(v * 0.25) + vec3f(0.0, 0.33, 0.67)));
  return vec4f(col, 1.0);
}
`;

type Status = "loading" | "running" | "paused" | "unsupported";

export function PlasmaIsland() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const runningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0;
    let disposed = false;
    let visible = true;

    const run = async () => {
      await Promise.resolve();
      if (!("gpu" in navigator)) {
        setStatus("unsupported");
        return;
      }
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter || disposed) {
        if (!disposed) setStatus("unsupported");
        return;
      }
      const device = await adapter.requestDevice();
      if (disposed) return;
      const ctx = canvas.getContext("webgpu");
      if (!ctx) {
        setStatus("unsupported");
        return;
      }
      const format = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({ device, format, alphaMode: "premultiplied" });

      const module = device.createShaderModule({ code: WGSL });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: { module, entryPoint: "vs" },
        fragment: { module, entryPoint: "fs", targets: [{ format }] },
      });
      const uniforms = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniforms } }],
      });

      const frame = (ms: number) => {
        raf = requestAnimationFrame(frame);
        if (!runningRef.current || !visible) return;
        device.queue.writeBuffer(
          uniforms,
          0,
          new Float32Array([ms / 1000, canvas.width, canvas.height, 0]),
        );
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: ctx.getCurrentTexture().createView(),
              loadOp: "clear" as const,
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              storeOp: "store" as const,
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      };
      raf = requestAnimationFrame(frame);
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      runningRef.current = !reduced;
      setStatus(reduced ? "paused" : "running");
      // paint one frame even when starting paused, so the box isn't black
      if (reduced) {
        device.queue.writeBuffer(uniforms, 0, new Float32Array([1.5, canvas.width, canvas.height, 0]));
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: ctx.getCurrentTexture().createView(),
              loadOp: "clear" as const,
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              storeOp: "store" as const,
            },
          ],
        });
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    run();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <figure style={{ margin: "2rem auto", textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          aria-label="Animated plasma gradient rendered by a WebGPU fragment shader"
          style={{ maxWidth: "100%", borderRadius: "8px", background: "#0b0d10" }}
        />
        {status === "unsupported" && (
          <p
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              margin: 0,
              color: "#9aa1ab",
              font: "14px ui-monospace, monospace",
              padding: "1rem",
            }}
          >
            No WebGPU adapter here — this box would be animating in any major browser
            released since January 2026.
          </p>
        )}
        {(status === "running" || status === "paused") && (
          <button
            type="button"
            onClick={() => {
              runningRef.current = status !== "running";
              setStatus(status === "running" ? "paused" : "running");
            }}
            style={{
              position: "absolute",
              right: "0.6rem",
              bottom: "0.6rem",
              border: 0,
              borderRadius: "4px",
              padding: "0.25rem 0.6rem",
              background: "rgba(11,13,16,0.7)",
              color: "#e6e3da",
              font: "12px ui-monospace, monospace",
              cursor: "pointer",
            }}
          >
            {status === "running" ? "pause" : "play"}
          </button>
        )}
      </div>
      <figcaption style={{ fontSize: "0.8rem", color: "var(--color-muted, #888)", marginTop: "0.5rem" }}>
        The fragment shader from this section, running live on your GPU. Four sine
        waves and a cosine palette; the only input is the clock.
      </figcaption>
    </figure>
  );
}
