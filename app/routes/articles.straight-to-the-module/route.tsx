import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Straight to the module",
  description:
    "Hand-written WebAssembly is a pleasure while the whole contract fits on one screen, and misery the moment it needs an ABI.",
  published: "2026-07-11T17:29:00Z",
  author: "Still Brook",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/straight-to-the-module.jpg",
    alt: "A Curta mechanical calculator standing beside its black cylindrical case on a white museum pedestal.",
    credit: {
      author: "Don DeBold",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Curta_Mechanical_Calculator_at_CHM_(7995215541).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const lerpWat = `
  (module
    (func (export "lerp")
      (param $a f32) (param $b f32) (param $t f32)
      (result f32)
      local.get $b
      local.get $a
      f32.sub
      local.get $t
      f32.mul
      local.get $a
      f32.add))
`;

const sumWat = `
  (module
    (memory (export "memory") 1)
    (func (export "sum_i32")
      (param $ptr i32) (param $len i32) (result i32)
      (local $sum i32)
      (block $done
        (loop $next
          (br_if $done (i32.eqz (local.get $len)))
          (local.set $sum
            (i32.add (local.get $sum) (i32.load (local.get $ptr))))
          (local.set $ptr (i32.add (local.get $ptr) (i32.const 4)))
          (local.set $len (i32.sub (local.get $len) (i32.const 1)))
          (br $next)))
      (local.get $sum)))
`;

const hostCode = `
  const { instance } = await WebAssembly.instantiateStreaming(
    fetch("/sum.wasm"),
  );

  const { memory, sum_i32 } = instance.exports;
  const values = new Int32Array(memory.buffer, 0, 4);
  values.set([4, 8, 15, 16]);

  sum_i32(0, values.length); // 43
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Three parameters go in, one value comes out, and the seven instructions in between are every
          step of the work. That&apos;s the whole module. For a leaf calculation this small, a source
          language wouldn&apos;t make anything clearer &mdash; it would move those same seven instructions
          behind a compiler and ask you to trust the round trip.
        </p>
        <CodeBlock lang="wat" title="lerp.wat" code={lerpWat} />
        <p>
          Writing &ldquo;straight WASM&rdquo; usually means writing WebAssembly&apos;s standardized text
          format, WAT, then assembling it into the binary a runtime loads. The <a href="https://github.com/WebAssembly/wabt#running-wat2wasm">WABT toolchain</a> makes that boundary refreshingly dull: run <code>wat2wasm lerp.wat -o lerp.wasm</code> and you&apos;re done. The text is the source, the binary is the build artifact, and nobody has to squint at hex.
        </p>

        <H2>The text is already a language</H2>
        <p>
          WebAssembly 3.0 was published yesterday, July 10, 2026, and its <a href="https://webassembly.github.io/spec/core/appendix/changes.html#release-30">change history</a> runs long: tail calls, exception handling, multiple and 64-bit memories, typed function references, managed references, more. The format has grown well past its original minimum, but the center of it is still small enough to hold in your head.
        </p>
        <p>
          The <a href="https://webassembly.github.io/spec/core/intro/overview.html">official overview</a> describes a typed stack machine with structured blocks, loops, and conditionals, where functions declare their parameters and results and validation checks the operand stack before anything runs. Linear memory is a bounded byte array &mdash; no invisible heap with opinions about your data. A module names exactly what it imports and exports.
        </p>
        <p>
          And the <a href="https://webassembly.github.io/spec/core/text/index.html">text format</a> is a real language: it has names, comments, folded expressions, and a grammar maintained right beside the binary one. WABT deliberately stays a full-fidelity converter instead of growing into an optimizing compiler, which means you can commit the readable module, generate the binary in the build, and inspect the round trip without inviting a second semantic universe into the repo.
        </p>
        <p>
          A compiler earns its place when it carries structure the target can&apos;t express comfortably
          &mdash; domain types, ownership rules, generic algorithms, a standard library. When the entire job
          is seven arithmetic instructions and an export name, there isn&apos;t much for it to carry.
        </p>

        <H2>The boundary earns the trouble</H2>
        <p>
          Arithmetic is the flattering demo, though. Memory is where writing WebAssembly by hand gets either
          useful or embarrassing. This module sums a run of 32-bit integers from linear memory:
        </p>
        <CodeBlock lang="wat" title="sum.wat" highlight="2,4,8-13" code={sumWat} />
        <p>
          The loop knows nothing about JavaScript arrays &mdash; only an address, a length, four-byte loads,
          and an accumulator. The meaning comes from the host side:
        </p>
        <CodeBlock lang="js" title="sum.js" highlight="6-10" code={hostCode} />
        <p>
          The browser&apos;s <a href="https://webassembly.github.io/spec/web-api/#streaming-module-compilation-and-instantiation">streaming instantiation API</a> compiles the response and supplies the module&apos;s imports, and the JavaScript interface hands you the <a href="https://webassembly.github.io/spec/js-api/#exported-functions">exported function</a> as a callable value and the memory as an <code>ArrayBuffer</code>. Nothing guesses at layout: both sides have agreed that address zero holds four little 32-bit values and that the function gets their count.
        </p>
        <p>
          This is the good case for hand-written WAT: a checksum, a color transform, a fixed binary decoder,
          a small deterministic state transition. What these all have in common is a contract you can review
          in one sitting, without opening any generated glue.
        </p>

        <H2>Memory removes the romance</H2>
        <p>
          Change the input from integers to text and the bill arrives. Which encoding does the pointer refer
          to? Who owns the buffer? May the module retain it? How does a function return a string whose length
          is unknown? Do errors trap, return a status code, or write a tagged result into memory? No single one
          of those questions is hard, but answer all of them and you&apos;ve written an ABI.
        </p>
        <p>
          Core WebAssembly refuses to invent those answers for you. Its <a href="https://webassembly.github.io/spec/core/syntax/modules.html">module model</a> describes functions, memories, tables, globals, imports, and exports, and a linear memory is &mdash; the spec says so &mdash; a list of raw uninterpreted bytes. That restraint is exactly why the format embeds so cleanly, and also why a rich application interface gets tedious to write by hand.
        </p>
        <p>
          The <a href="https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md">Component Model&apos;s WIT format</a> exists for that next layer: strings, lists, records, variants, results, resources, whole imported and exported worlds, all described in a developer-facing interface definition. Once you need those types, take the generated bindings &mdash; they&apos;re what keeps allocation and ownership rules from leaking into every call site.
        </p>
        <Callout variant="caution" title="The one-screen rule">
          <p>
            Write WAT while every import, export, layout, and ownership rule fits on one screen. The day
            buffer lifetime needs a diagram, switch to a source language or component tooling.
          </p>
        </Callout>

        <H2>Stop before you become the toolchain</H2>
        <p>
          Hand-writing WebAssembly produces a dangerous little satisfaction, and I keep catching myself
          chasing it. The first function is exact. The fifth wants constants and shared helpers. By the
          twentieth you want macros, a test harness, source maps, and a nicer way to spell a record. You
          haven&apos;t escaped the compiler. You&apos;ve started one without admitting it.
        </p>
        <Compare
          attributes={["Contract", "Values", "Ownership", "Tooling", "Good fit"]}
          entities={[
            {
              name: "Hand-written WAT",
              values: [
                "Imports, exports, and layout fit on one screen",
                "Numbers and fixed byte layouts",
                "One explicit rule at each memory boundary",
                "Assembler, validator, and round-trip inspection",
                "Leaf calculations, checksums, and compact decoders",
              ],
            },
            {
              name: "Source language or WIT",
              values: [
                "Interface contains strings, records, variants, or resources",
                "Domain types and reusable algorithms",
                "Generated bindings carry allocation and lifetime rules",
                "Compiler, tests, source maps, and standard libraries",
                "Programs whose structure no longer fits in the module text",
              ],
            },
          ]}
          caption="The boundary is pleasant by hand while its complete contract stays reviewable in one sitting."
        />
        <p>
          And direct WAT doesn&apos;t make anything fast by itself. You get authority over instruction shape,
          not immunity from host-call overhead, memory traffic, engine compilation, or a bad algorithm. Keep
          the module because it reads clearer, then benchmark it against the workload you actually have.
        </p>
        <p>
          So use Rust, or C, or Zig when the program needs a language. But when the module itself is the
          clearest thing you could write &mdash; a lerp, a checksum, a loop over four-byte loads &mdash; skip
          the compiler and write the target. Nobody&apos;s asking you to build a browser in parentheses.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
