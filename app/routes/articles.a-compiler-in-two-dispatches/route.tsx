import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BrainfuckWasmLab, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "A compiler in two dispatches",
  description:
    "A WebGPU compute shader compacts raw Brainfuck source and emits a WebAssembly module in parallel, which the host checks byte-for-byte before the browser runs it.",
  published: "2026-07-12T23:35:00Z",
  author: "Elias North",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/a-compiler-in-two-dispatches.jpg",
    alt: "The exposed mechanism of a Linotype machine that sorts letter moulds back into their bins.",
    credit: {
      author: "Richard Ash",
      license: "CC BY-SA 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Linotype_typesetting_machine_(45618071855).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const emit = [
  "// dispatch 2: one lane per compacted command",
  "if (lane < count) { op = ops[lane]; len = TPL_LEN[op]; }",
  "scan_values[lane] = len;",
  "workgroupBarrier();",
  "// eight synchronized scan steps produce the running byte total",
  "",
  "// lane zero writes the header and publishes code_start here",
  "workgroupBarrier();",
  "",
  "if (lane < count) {",
  "  let base = code_start + scan_values[lane] - len;",
  "  for (var k = 0u; k < len; k++) {",
  "    wasm_out[base + k] = TPL[TPL_OFF[op] + k];",
  "  }",
  "}",
].join("\n");

const host = [
  "const reference = compileBrainfuck(source); // built first, on the CPU",
  "const sourceBytes = new TextEncoder().encode(source);",
  "const gpu = await compileToWasmOnGpu(runtime, sourceBytes);",
  "",
  "const mismatch = byteMismatch(reference.wasm, gpu.wasm);",
  "const wasm = gpu.error === 0 && mismatch === null",
  "  ? gpu.wasm",
  "  : reference.wasm;",
  "",
  "const { instance } = await WebAssembly.instantiate(wasm, imports);",
  "instance.exports.run();",
].join("\n");

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I had a two-pass GPU compiler whose second pass interpreted the first pass&apos;s output. It
          worked, but the result disappeared with the interpreter. I wanted the shader to leave
          behind a program the rest of the browser understood, so I made the second dispatch write
          a WebAssembly module byte by byte.
        </p>
        <p>
          That turns compilation into a layout problem. The first dispatch reads as many as 256
          UTF-8 source bytes, classifies the eight Brainfuck characters, and uses a prefix scan to
          compact them in source order. Comments finally matter here: they enter the GPU buffer and
          vanish during the scan. One lane then checks the compacted brackets and reports the
          opcode array&apos;s length.
        </p>

        <H2>Every command knows its width</H2>
        <p>
          Parallel emission works because each command has one fixed binary template. The compiler
          deliberately skips run folding and peephole rewrites. The current{" "}
          <a href="https://webassembly.github.io/spec/core/binary/index.html">
            WebAssembly binary format
          </a>{" "}
          gives every template a known byte count before anything is written.
        </p>
        <DataTable
          head={["Command", "Effect", "WebAssembly", "Bytes"]}
          rows={[
            [<code>+ -</code>, "adjust the current cell", "load8, add ±1, store8", "13"],
            [<code>&gt; &lt;</code>, "move the data pointer", "global.set $p", "7"],
            [<code>.</code>, "write the current cell", "call $write", "7"],
            [<code>,</code>, "read into the current cell", "call $read, store8", "12"],
            [<code>[</code>, "guard and enter the loop", "block, loop, br_if", "26"],
            [<code>]</code>, "branch back to the top", "br", "4"],
          ]}
          align={["left", "left", "left", "right"]}
          caption="The six Brainfuck command families, their WebAssembly operations, and their fixed template lengths."
        />
        <p>
          Dispatch two scans those lengths. A lane subtracts its own length from the inclusive sum
          to find its starting offset, then copies its template into that slot. The writes can
          happen together because the slots cannot overlap.
        </p>
        <CodeBlock
          lang="wgsl"
          title="emit_wasm, abridged"
          highlight="4,8,11,13"
          code={emit}
        />
        <p>
          Lane zero handles the serial framing: magic bytes, types, imports, memory, exports, and
          the code-section lengths that depend on the scan total. This shader declares its output
          buffer as an array of <code>u32</code>, so it stores one module byte in each word and the
          host packs them after readback. Both compute passes share one command buffer.
        </p>

        <H2>The reference goes first</H2>
        <p>
          The page always compiles a CPU reference before asking for a GPU. That reference catches
          syntax errors, renders the WAT shown in the lab, and supplies the exact bytes used to
          grade the shader. The host records any WebGPU error or first differing byte, then chooses
          the matching GPU module or the reference copy.
        </p>
        <CodeBlock lang="ts" title="the verification boundary" highlight="2,5,6" code={host} />
        <p>
          The module imports <code>read</code> and <code>write</code>. End-of-input returns the
          current cell, which is the convention used by the included programs, and a fuel global
          traps a loop that consumes its budget. The expandable WAT is CPU-rendered, omits that
          fuel machinery, and describes the reference module. The host checks the executable bytes
          directly in binary form.
        </p>
        <p>
          The current 256-byte ceiling comes from assigning one source byte to each lane in a
          256-lane workgroup. Fixed templates make the scan possible. A larger parallel version
          could tile the source across multiple workgroups and add another scan level, with bracket
          balance carried across tile boundaries. I have not built that version.
        </p>
        <p>
          The lab reports source bytes and commands separately. Its first timer covers compilation
          and, on the GPU path, byte verification. The second covers instantiation and execution.
          The old single label timed only the last part, which looked tidy and was wrong.
        </p>
        <p>
          Try the commented source as well as the compact samples. Browsers without the{" "}
          <a href="https://www.w3.org/TR/webgpu/">WebGPU API</a> still use the CPU emitter and
          runtime boundary, so the same samples remain runnable there.
        </p>
      </Prose>

      <BrainfuckWasmLab />

      <Prose>
        <p>
          ROT13 is 190 source bytes and produces a 2,225-byte module. On the GPU path, its first
          timing includes the CPU reference, both dispatches, readback, and the byte comparison.
          The first click also includes adapter, device, and pipeline setup. The lab starts the
          second timing when the browser instantiates the chosen bytes and leaves both numbers visible.
        </p>
        <p>
          The first time the comparison returned no differing offset, I checked the output buffer
          anyway. The first four output words held <code>00 61 73 6d</code>. Lane zero had placed that
          magic number beside the rest of a program assembled by a graphics device.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
