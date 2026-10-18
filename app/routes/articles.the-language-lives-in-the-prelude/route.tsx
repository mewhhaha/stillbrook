import { articleMeta, type ArticleMeta } from "../../article";
import {
  AnnotatedCode,
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The language lives in the prelude",
  description:
    "Ducklang implements structs, attributes, derivation, and protocol dispatch as compile-time Duck code over a smaller set of privileged compiler operations.",
  published: "2026-07-22T21:10:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-language-lives-in-the-prelude-journal.webp",
    alt: "An unfinished wooden puppet theatre sits among tools, fabric, and carved stage pieces.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const pointSource = `
  const { struct } = import "duck:prelude/types" ()

  type Point = struct { .x = I32, .y = I32 }

  let point = Point.new { .x = 20, .y = 22 }
  Point.x point
`;

const structImplementation = `
  const struct = (const shape) => {
    let product_type = []

    for field in shape {
      product_type = [...product_type, field.value]
    }

    for index, field in shape {
      product_type = product_type :+ (field.name, value => value[index])
    }

    let new = (const values) => { /* checked product construction */ }
    product_type = product_type :+ { shape, new }
    product_type
  }
`;

const testUsage = `
  const { test } = import "duck:prelude/attributes" ()

  @[test]
  const addition_returns_the_sum: () -> Unit = () => {
    assert(add(20, 22) == 42)
  }
`;

const testImplementation = `
  const test = (const target) => if import.meta.mode == #test {
    \`Export ()
  } else {
    \`Drop ()
  }
`;

const deriveImplementation = `
  const derive = (const ...generators) => (const target) =>
    \`Replace (comptime {
      let derived = target
      for generator in generators {
        derived = @type.extend(derived, generator(derived))
      }
      derived
    })
`;

const duckDispatch = `
  duck Add Self Other Output {
    .add = [Self, Other] -> Output
  }

  extend I32 {
    .add = [left, right] => @wasm.add_i32 [left, right]
  }

  Add.add [20, 22]
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          <code>{"type Point = struct { .x = I32 }"}</code> looks like a compiler feature. Delete one
          import, though, and Ducklang reports <code>Unbound core value: struct</code>. The supposed
          type constructor is a const function in the repository&apos;s prelude.
        </p>
        <p>
          This is the detail I find lovely in{" "}
          <a href="https://github.com/mewhhaha/ducklang">Ducklang</a>. The compiler exposes type values,
          staging, and privileged <code>@</code>{" "}operations. Duck source builds structs, newtypes,
          attributes, derivation, and protocol-style dispatch on top. You can open the feature&apos;s
          implementation before either backend sees it.
        </p>
        <CodeBlock lang="text" title="point.duck" highlight="1,3,5-6" code={pointSource} />

        <H2>Struct assembles a type</H2>
        <p>
          The import above resolves to{" "}
          <a href="https://github.com/mewhhaha/ducklang/blob/main/src/frontend/prelude_types.duck">
            <code>prelude_types.duck</code>
          </a>. Its <code>struct</code> function receives a compile-time shape, builds a product type
          from the field values, and extends that type with named projections. The constructor is
          another value attached to the resulting namespace.
        </p>
        <AnnotatedCode
          lang="text"
          title="prelude_types.duck — struct, abridged"
          code={structImplementation}
          notes={[
            {
              line: 1,
              note: "The shape is a const argument, so the function inspects fields during compilation.",
            },
            {
              line: 4,
              note: "The first loop turns the field types into the stored product representation.",
            },
            {
              line: 8,
              note: "Each field name becomes a projection function attached with type extension.",
            },
            {
              line: 12,
              note: "The omitted body checks named constructor values and casts the ordered product.",
            },
            {
              line: 13,
              note: "The type value leaves with its shape metadata and constructor in its namespace.",
            },
          ]}
          caption="struct from the prelude, abridged to the two loops and the checked constructor the notes walk through."
        />
        <p>
          The compiler still supplies the sharp tools — <code>@cast</code> verifies representation identity,{" "}
          <code>@type.extend</code> adds namespace members, the compile-time evaluator walks the shape — but Duck
          decides what a struct actually is: the field order, the projections, the constructor sitting in the
          namespace.
        </p>
        <p>
          This is a better customization point than a macro that prints an AST fragment and hopes the parser
          agrees. A replacement <code>struct</code> can be an ordinary imported function, provided it returns
          type values the rest of the compiler understands.
        </p>

        <H2>Attributes return data</H2>
        <p>
          Attributes take the same gamble. The compiler calls each attribute expression with the current
          target, then interprets a small result union: keep it, drop it, export it, or replace it. The bundled{" "}
          <code>test</code> attribute reads <code>import.meta.mode</code> and chooses whether the binding exists in
          the build. Cheeky, but inspectable.
        </p>
        <CodeTabs labels={["Use", "test", "derive"]}>
          <CodeBlock lang="text" title="addition.duck" code={testUsage} />
          <CodeBlock
            lang="text"
            title="prelude_attributes.duck — test"
            code={testImplementation}
          />
          <CodeBlock
            lang="text"
            title="prelude_attributes.duck — derive"
            code={deriveImplementation}
          />
        </CodeTabs>
        <p>
          <code>derive</code> is more revealing. It receives a compile-time pack of generators, applies each
          one to the evolving type, and returns <code>Replace</code> with the extended result. The compiler owns
          attribute execution and the four action cases, while the composition loop lives in{" "}
          <a href="https://github.com/mewhhaha/ducklang/blob/main/src/frontend/prelude_attributes.duck">
            Duck source
          </a>{" "}
          — so another derivation strategy costs a function, not a parser keyword.
        </p>

        <H2>Duck dispatch disappears</H2>
        <p>
          The repository&apos;s protocol mechanism is named <code>duck</code>, because subtlety had already left
          the room. A declaration names roles and required members. Lexical <code>extend</code> blocks supply
          implementations for concrete types.
        </p>
        <CodeBlock
          lang="text"
          title="src/frontend/ducklang.test.ts — structural addition"
          highlight="1-3,5-7,9"
          code={duckDispatch}
        />
        <p>
          During frontend elaboration, the{" "}
          <a href="https://github.com/mewhhaha/ducklang/blob/main/src/frontend/duck_elaborate.ts">
            duck resolver
          </a>{" "}
          infers the role types from the call, checks the selected extension&apos;s signature, and rewrites the
          member call to a hidden const binding. The test above inspects the generated WAT and finds one{" "}
          <code>i32.add</code>. No protocol dictionary survives into that artifact.
        </p>
        <p>
          The restriction is equally concrete. When a role cannot be known during specialization, the elaborator
          rejects an obligation that “escapes without a statically known role” — open runtime polymorphism sits
          outside the mechanism entirely. I think the narrowness helps, although a large application may expose
          costs the repository examples cannot show yet.
        </p>

        <H2>The floor is still steel</H2>
        <p>
          Source-defined features leave plenty of compiler machinery underneath. The shared frontend expands
          attributes, infers signatures, computes source facts, elaborates ducks, checks affine use, and only
          then selects the Interaction Calculus or structured Core route. The current{" "}
          <a href="https://github.com/mewhhaha/ducklang/blob/main/src/frontend/pipeline.ts">
            pipeline
          </a>{" "}
          even runs signature inference on both sides of duck elaboration because each stage exposes facts the
          other needs.
        </p>
        <p>
          You can also tell at a glance which side of the line any name sits on. <code>@type.extend</code>,{" "}
          <code>@cast</code>, and <code>@wasm.add_i32</code> cross into compiler machinery, and any name without
          the sigil is replaceable library code.
        </p>
        <p>
          One test in <code>ducklang.test.ts</code> keeps the whole argument in a dozen lines: delete the import
          and <code>struct</code> is an unbound core value, put it back and the generated WAT contains{" "}
          <code>i32.const 20</code>.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
