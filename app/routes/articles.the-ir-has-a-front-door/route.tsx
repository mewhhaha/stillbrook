import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, CodeTabs, H2, Prose } from "../../components";

export const article = {
  title: "The IR has a front door",
  description:
    "Gpufuck frontends author Functional Surface objects, pack them into a versioned WebGPU transport, and receive numeric resolved Core only after GPU checking.",
  published: "2026-07-20T08:30:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-ir-has-a-front-door-journal.webp",
    alt: "Three laboratory trays carry clay shapes, brass tiles, and resolved pieces in sequence.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const integerRecord = `
  const none = FUNCTIONAL_NO_INDEX;
  const integer42 = Uint32Array.of(
    FunctionalExpressionTag.Integer,
    0, 2, 42,
    none, none, none, none,
  );
`;

const surfaceModule = `
  const module = buildFunctionalSurfaceModule(
    [{
      name: "main",
      parameters: [],
      annotation: null,
      body: surface.binary(
        FunctionalBinaryOperator.Add,
        surface.integer(40),
        surface.integer(2),
      ),
    }],
    [],
    "main",
    sourceBytes,
    { evaluationProfile: FunctionalEvaluationProfile.StrictEager },
  );
`;

const compileModule = `
  const compilation = await compiler.compileModule(module);
  if (!compilation.ok) throw new Error(compilation.diagnostics[0].message);

  try {
    const core = await compilation.module.readCoreNodes();
    const wasm = await compileFunctionalModuleToWasm(compilation.module);
    console.log(core, wasm.byteLength);
  } finally {
    compilation.module.destroy();
  }
`;

const toyLowerer = `
  type Expr =
    | { kind: "int"; value: number }
    | { kind: "name"; name: string }
    | { kind: "add"; left: Expr; right: Expr }
    | { kind: "call"; callee: Expr; arguments: readonly Expr[] };

  function lower(expression: Expr): FunctionalSurfaceExpression {
    switch (expression.kind) {
      case "int": return surface.integer(expression.value);
      case "name": return surface.name(expression.name);
      case "add": return surface.binary(
        FunctionalBinaryOperator.Add,
        lower(expression.left),
        lower(expression.right),
      );
      case "call": return surface.apply(
        lower(expression.callee),
        ...expression.arguments.map(lower),
      );
    }
  }
`;

const optionType = `
  const optionType = {
    name: "Option",
    parameters: ["value"],
    constructors: [
      { name: "None", fields: [] },
      {
        name: "Some",
        fields: [{
          name: "value",
          type: { kind: "parameter", name: "value" },
        }],
      },
    ],
  } satisfies FunctionalSurfaceTypeDeclaration;
`;

const optionUnwrap = `
  const unwrapOrZero = {
    name: "unwrapOrZero",
    parameters: ["option"],
    annotation: null,
    body: {
      kind: "case",
      value: surface.name("option"),
      arms: [
        { constructor: "None", binders: [], body: surface.integer(0) },
        { constructor: "Some", binders: ["value"], body: surface.name("value") },
      ],
    },
  } satisfies FunctionalSurfaceDefinition;
`;

const optionMain = `
  const main = {
    name: "main",
    parameters: [],
    annotation: null,
    body: surface.apply(
      surface.name("unwrapOrZero"),
      surface.apply(surface.name("Some"), surface.integer(42)),
    ),
  } satisfies FunctionalSurfaceDefinition;
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          The most tempting type in gpufuck is{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/compiler_module.ts">
            <code>FunctionalCoreNode</code>
          </a>
          . It already contains local depths, global definition indices, constructor indices, and evaluation modes.
          Start a frontend there and you have arrived after the decision you were supposed to delegate: the GPU creates
          that evidence while resolving and checking the program.
        </p>
        <p>
          The repository actually exposes three related forms, each with its own job: frontends author Functional
          Surface objects, <code>buildFunctionalSurfaceModule()</code> packs them into a versioned transport made of
          fixed-width words, and resolved Core comes back after GPU compilation to feed evaluation or Wasm emission.
          This is the missing companion to{" "}
          <a href="/articles/a-compiler-made-of-resumable-lanes">the lane-machine view</a>: calling all three “the
          IR” makes the frontend boundary look harder than it is.
        </p>

        <H2>Eight words for 42</H2>
        <p>
          The shortest parser-independent fixture in the current{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/tests/functional_compiler_test.ts">
            compiler test suite
          </a>{" "}
          constructs an encoded module by hand. Its only expression is this record:
        </p>
        <CodeBlock
          lang="ts"
          title="tests/functional_compiler_test.ts — integer node"
          highlight="2-7"
          code={integerRecord}
        />
        <p>
          Eight words. For 42. They mean tag, start byte, end byte, payload, three child slots, and parent, and the
          absent relationships hold <code>0xffffffff</code>. A definition record then points symbol zero at node
          zero, while counts, names, type metadata, and the selected evaluation profile complete the module.
        </p>
        <p>
          I like this fixture because it proves the packed ABI is real rather than a diagram in the architecture
          document. I would still hate to build a language this way. Every new expression would make the frontend own
          preorder layout, parent links, symbol interning, span encoding, and whichever ABI version happens to be
          current.
        </p>

        <H2>The builder takes the clerical work</H2>
        <p>
          The intended entrance keeps the same semantics in ordinary TypeScript objects. Here is a complete module for{" "}
          <code>40 + 2</code>, followed by the compile and emission boundary:
        </p>
        <CodeTabs labels={["Build surface", "Compile and emit"]}>
          <CodeBlock lang="ts" title="answer.ts" highlight="2,7-11,16" code={surfaceModule} />
          <CodeBlock lang="ts" title="compile.ts" highlight="2,6-7,10" code={compileModule} />
        </CodeTabs>
        <p>
          The{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/surface_builder.ts">
            Surface builder
          </a>{" "}
          interns names, inserts the reserved unit and pair declarations, curries parameter lists, records source
          spans, and chooses strict or call-by-need node tags from the evaluation profile. The returned object is still
          an <code>EncodedFunctionalModule</code>, so the GPU receives flat buffers rather than a JavaScript object
          graph — but the clerical work now has exactly one owner instead of a copy per frontend.
        </p>
        <p>
          <code>sourceBytes</code> deserves attention. Gpufuck reports UTF-8 byte spans, and the frontend later maps
          those offsets back to files, lines, excerpts, and source-language wording. Passing zero everywhere compiles
          the program, then makes every diagnostic point at the same blank patch of source.
        </p>

        <H2>A toy language reaches the surface</H2>
        <p>
          Once the module wrapper is understood, a small frontend becomes a tree translation. This expression language
          has integers, names, addition, and calls:
        </p>
        <CodeBlock lang="ts" title="lower.ts" highlight="8-20" code={toyLowerer} />
        <p>
          The pleasant surprise is <code>surface.name()</code>. Our toy frontend can leave portable lexical and global
          names unresolved, because the GPU replaces them with local depths and definition indices. A Rust frontend
          still has to reject an illegal move first, and an OCaml frontend must preserve its sequential scope. Those
          rules belong to the source language before this lowerer runs.
        </p>
        <p>
          I have not wrapped this snippet in a parser, and it omits spans to keep the switch readable. Each returned
          shape matches the current{" "}
          <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/surface_contract.ts">
            public Surface contract
          </a>
          , though, and adding <code>span</code> to the objects is the practical next line rather than a different
          lowering strategy.
        </p>

        <H2>The first datatype spends more information</H2>
        <p>
          Algebraic data reveals why the target keeps declarations beside expressions. Suppose the toy language grows{" "}
          <code>Option</code> and one case expression. The frontend supplies the nominal type, constructor fields, arm
          names, and binders:
        </p>
        <CodeTabs labels={["Type declaration", "Case definition", "Entry"]}>
          <CodeBlock lang="ts" title="option-type.ts" highlight="2-14" code={optionType} />
          <CodeBlock lang="ts" title="unwrap.ts" highlight="2-14" code={optionUnwrap} />
          <CodeBlock lang="ts" title="main.ts" highlight="2-10" code={optionMain} />
        </CodeTabs>
        <p>
          At packing time, <code>Option</code>, <code>None</code>, and <code>Some</code> enter symbol, type, and constructor
          tables. The case arms remain names. GPU resolution later checks constructor ownership and binder arity, type
          inference discovers <code>unwrapOrZero : Option&lt;i32&gt; -&gt; i32</code>, and coverage can complain if an arm is
          missing. At that point the agreeable objects turn back into a substantial pile of <code>u32</code>s. Good.
        </p>
        <p>
          Writing those tables directly would force the frontend to calculate the first constructor index for every
          nominal type and maintain the linked case-arm shape by hand. The Surface form lets the frontend describe the
          language fact—this constructor has one field—while the encoder chooses the transport layout.
        </p>

        <H2>Core is the receipt</H2>
        <p>
          After <code>compileModule()</code> succeeds, <code>readCoreNodes()</code> exposes the checked result for traces,
          tests, caches, and the host Wasm backend. The lowerer should inspect that output when debugging, but normal
          source compilation does not require it to manufacture local depths or constructor indices itself.
        </p>
        <Callout variant="note">
          <p>
            <a href="https://github.com/mewhhaha/gpufuck/blob/main/src/functional/compiler.ts">
              <code>restoreCompiledCore()</code>
            </a>{" "}
            exists for validated cache artifacts. Source frontends still author Surface and let the compiler establish
            the resolved indices.
          </p>
        </Callout>
        <p>
          One semantic choice remains visible before packing: evaluation. A strict language selects{" "}
          <code>StrictEager</code>; a Haskell-shaped frontend chooses <code>LazyCallByNeed</code> and may override
          individual binding or argument boundaries. If our toy syntax eventually adds <code>lazy</code>, the lowerer
          has to record that promise where the target can preserve it through Core and Wasm.
        </p>
        <p>
          After the Option example compiles, the readback names <code>Some</code> by constructor index and{" "}
          <code>option</code> by local depth. The first fixture remains smaller and stranger: its integer record ends
          with four copies of <code>0xffffffff</code>, patiently reserving places for children and a parent that 42 never
          needed.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
