import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, Divider, H2, Prose } from "../../components";

export const article = {
  title: "Functional before runtime",
  description:
    "Zig's comptime can compose functions and types into specialized programs while the runtime keeps allocation and control flow in plain sight.",
  published: "2026-07-11T17:32:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/functional-before-runtime-journal.webp",
    alt: "A brass mold forms wooden function pieces into a simple tool with a direct piston and spring.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const composeCode = `
  fn compose(
      comptime A: type,
      comptime B: type,
      comptime C: type,
      comptime f: fn (A) B,
      comptime g: fn (B) C,
  ) fn (A) C {
      return struct {
          fn call(value: A) C {
              return g(f(value));
          }
      }.call;
  }
`;

const composeUse = `
  fn twice(value: i32) i32 {
      return value * 2;
  }

  fn positive(value: i32) bool {
      return value > 0;
  }

  const doubledIsPositive =
      compose(i32, i32, bool, twice, positive);
`;

const mapIntoCode = `
  fn mapInto(
      comptime A: type,
      comptime B: type,
      comptime transform: fn (A) B,
      input: []const A,
      output: []B,
  ) void {
      std.debug.assert(input.len == output.len);
      for (input, output) |value, *slot| {
          slot.* = transform(value);
      }
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          If you want a functional Zig, don&apos;t teach every slice to say <code>map</code>. Make
          the compiler the functional part and let the runtime stay bluntly Zig: use{" "}
          <code>comptime</code> to combine behavior before code generation, then emit the loop, the
          pointer writes, the error path, and the allocation policy the machine actually runs.
        </p>
        <p>
          Zig already has the pieces for this. Types are values at compile time, functions can take
          types and other functions as compile-time parameters, and a function can hand back another
          function. Put those together and <code>comptime</code> stops looking like an unusually
          capable macro system and starts looking like a small language for building your program
          out of functions.
        </p>
        <CodeBlock lang="zig" title="compose.zig" highlight="2-7,9-13" code={composeCode} />
        <p>
          This <code>compose</code> takes two programs and hands back a third. The intermediate type
          gets checked, both implementations are fixed, and the returned function needs no runtime
          registry or closure allocation — by the time a value reaches it, there&apos;s nothing left
          to decide.
        </p>

        <H2>Functions build functions</H2>
        <p>
          The{" "}
          <a href="https://ziglang.org/documentation/master/#comptime">Zig language reference</a>{" "}
          says compile-time parameters are how the language implements generics. Types are
          first-class compile-time values, and the same ordinary function can run during compilation
          or at runtime when its inputs allow it — so the staging happens in the language you
          already write, with no second macro dialect pasted on top.
        </p>
        <p>
          The standard library leans on this constantly. Its{" "}
          <a href="https://github.com/ziglang/zig/blob/master/lib/std/sort.zig#L18-L36">
            sorting functions accept a comparator at comptime
          </a>{" "}
          while carrying runtime state in an explicit context. The same module&apos;s{" "}
          <a href="https://github.com/ziglang/zig/blob/master/lib/std/sort.zig#L133-L149">
            <code>asc(T)</code> and <code>desc(T)</code> helpers return comparator functions
          </a>{" "}
          generated for whatever type you pick. Zig is already passing programs into programs and
          getting new programs back; it doesn&apos;t advertise it in those words.
        </p>
        <CodeBlock lang="zig" title="usage.zig" code={composeUse} />
        <p>
          John Backus called this direction{" "}
          <a href="https://dl.acm.org/doi/10.1145/359576.359579">function-level programming</a>:
          build programs by applying program-forming operations to other programs. Zig doesn&apos;t
          make that the whole language, but it gives the idea a stage: composition happens in the
          compiler, and ordinary values show up later.
        </p>

        <H2>Functional shape, Zig ownership</H2>
        <p>
          The tempting next move is a whole library of <code>map</code>, <code>filter</code>, folds,
          and pipelines. That can work, as long as the library keeps Zig&apos;s accounting visible:
          a transform can be selected at compile time without anyone pretending the output storage
          appears from nowhere.
        </p>
        <CodeBlock lang="zig" title="map_into.zig" highlight="4,6,9-11" code={mapIntoCode} />
        <p>
          <code>mapInto</code> has a functional boundary and an imperative body. The caller supplies
          the input, the output, and with them the allocation decision; the transform is fixed at
          compile time; the body is still a direct loop writing through a pointer. This is
          functional programming used to choose the machine code, not to hide the machine.
        </p>
        <p>
          Runtime captures can stay honest the same way. Zig&apos;s sorting API doesn&apos;t ask a
          comparator to smuggle state through a lexical closure — it passes a context value plus a
          compile-time function that knows how to use it. The environment is plain data, so you can
          still see who owns that state and how big it is.
        </p>

        <Divider />

        <H2>Staging is not purity</H2>
        <Callout variant="note" title="The boundary matters">
          <p>
            Compile-time evaluation rejects runtime side effects, but the function it generates can
            still mutate through pointers, allocate, do input and output, and return errors. All{" "}
            <code>comptime</code> fixes is when the choices get made.
          </p>
        </Callout>
        <p>
          Here&apos;s where a functional Zig library can lose the language it&apos;s supposed to
          improve. Zig&apos;s own overview promises{" "}
          <a href="https://ziglang.org/learn/overview/#no-hidden-control-flow">
            no hidden control flow and no hidden allocation
          </a>
          . A generic <code>bind</code> that buries <code>try</code>, a lazy pipeline that conceals
          a state machine, a collection operator that quietly picks an allocator — each one looks a
          little more functional and breaks that promise a little more.
        </p>
        <p>
          So aim narrower. Use compile-time composition for the static stuff: policies, codecs,
          validators, command tables, kernels whose shape is settled before runtime. Let combinators
          accept types and functions, reject bad combinations during compilation, and hand back a
          concrete function or type. Allocators, errors, cancellation, mutation — all of that
          belongs on the runtime side of the seam.
        </p>
        <Compare
          attributes={["Inputs", "Output", "What disappears", "What stays visible"]}
          entities={[
            {
              name: "Compile time",
              values: [
                "Types, functions, policies, codecs, command tables",
                "A concrete function or type",
                "Dispatch among already-known choices",
                "Rejected combinations and generated declarations",
              ],
            },
            {
              name: "Runtime",
              values: [
                "Values, buffers, context, external state",
                "The program's result or error",
                "Nothing the machine still has to decide",
                "Allocation, mutation, cancellation, and control flow",
              ],
            },
          ]}
          caption="Comptime settles program shape before runtime exposes the effects and ownership decisions Zig asks readers to see."
        />
        <p>
          And keep public APIs discoverable. Generated private machinery is leverage, but method
          names that only exist after arbitrary compile-time execution are a tax on the editor and
          on whoever reads the code next. I&apos;ve chased a method through a codebase where it
          appeared nowhere in the source, and I don&apos;t recommend the experience.
        </p>

        <H2>A compiler with an algebra</H2>
        <p>
          A serious library would start small: <code>compose</code> for compatible function types,
          adapters for optionals and error unions that keep control flow visible, folds that write
          into caller-owned state, factories that return named, concrete types. Laws still matter
          here — identity and associativity are how you know a refactored pipeline still means the
          same thing. Zig&apos;s type system and compile-time evaluator can check the shape, and
          tests can check the behavior.
        </p>
        <p>
          None of this turns Zig into Haskell, and it isn&apos;t trying to. It hands the compiler a
          small algebra for assembling programs, and it leaves the runtime as plain as Zig promised
          it would be. That&apos;s the version of functional Zig I&apos;d actually want to use.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
