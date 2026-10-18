import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "The catalog dreams in i32",
  description:
    "Guarded While reveals how a hundred distinct grammars are constrained by one small expression language and an i32 WebAssembly result.",
  published: "2026-07-13T13:24:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/the-catalog-dreams-in-i32-journal.webp",
    alt: "A wooden cabinet displays tiny mechanical specimens in glass bottles among stones and wild plants.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const guardedWhile = `
  {
    id: "guarded-while",
    name: "Guarded While",
    model: {
      storage: "counter",
      control: "guarded",
      values: "natural",
    },
    grammar: { program: "WHILE NUMBER NUMBER NUMBER" },
    inputs: numberInputs(3),
    expression: choose(
      operand(0),
      binary("add", operand(1), operand(2)),
      operand(1),
    ),
    example: { source: "while 1 8 3", expected: 11 },
    probe: { source: "while 0 8 3", expected: 8 },
  }
`;

const compilerPath = [
  { title: "Grammar", detail: "Recognize a language-specific token arrangement." },
  { title: "Selectors", detail: "Turn matched text into integer operands." },
  { title: "Expression", detail: "Bind operands into constant, unary, binary, or select nodes." },
  { title: "WebAssembly", detail: "Emit one no-import function returning i32." },
] as const;

const catalogBoundaries = [
  ["Catalog shape", "Ten named families with ten entries each", "Enforced by catalog validation"],
  ["Storage taxonomy", "Accumulator, stack, tape, counter, term, grid, signal, scalar, source, collection", "Descriptive metadata"],
  ["Control taxonomy", "Ten labels including guarded, normalize, vector, and reflect", "Descriptive metadata"],
  ["Executable algebra", "Input, constant, unary, binary, select", "The only expression node kinds"],
  ["Result boundary", <code key="result">run(): i32</code>, "One exported integer result"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          There is a language in this catalog called Guarded While, and its <code>while</code> never goes
          around. The canonical program <code>while 1 8 3</code> evaluates the guard once, performs one
          addition, and returns <code>11</code>; hand it a zero guard and you get your <code>8</code> back
          untouched. However hard you stare at the lowering, no iteration is hiding in it.
        </p>
        <CodeBlock
          lang="ts"
          title="src/families/control_flow.ts (abridged)"
          highlight="2-8,10-17"
          code={guardedWhile}
        />
        <p>
          That mismatch is the honest door into{" "}
          <a href="https://github.com/mewhhaha/hallucinations/tree/d7e9220841885e162f8a4a099a49ef1f79b668d9">
            the catalog at commit <code>d7e9220</code>
          </a>
          : a hundred micro-languages, each with its own grammar and witness programs, and every one of them
          squeezed through the same bounded expression representation on its way to a single{" "}
          <code>i32</code>. I find the gap between the names and the machine more charming than damning. But you
          need to see it, or you will read the catalog as something it is not.
        </p>
        <p>
          You can trace Guarded While end to end without running the generator. The grammar accepts{" "}
          <code>WHILE</code> and three numbers, <code>numberInputs(3)</code> turns the tokens into operands, and{" "}
          <code>choose</code> uses the first operand to pick between one addition and the untouched second
          operand. Nothing feeds a result back into the guard.
        </p>

        <FlowSequence steps={compilerPath} caption="Every catalog entry follows the same path from custom syntax to one integer-returning Wasm function." />

        <H2>The taxonomy is larger than the machine</H2>
        <p>
          Each <code>LanguageSpec</code> declares a family plus storage, control, and value labels — lovely for
          browsing, and purely descriptive. The part that executes lives in two other fields: the token
          selectors and the <code>ExpressionTemplate</code> they feed.
        </p>
        <DataTable
          head={["Boundary", "Declared range", "Status"]}
          rows={catalogBoundaries}
          caption="Rich taxonomy surrounds a deliberately small executable expression algebra."
        />
        <p>
          Look at what the algebra offers: constants, inputs, a fixed set of integer operators, and conditional
          selection. No loop, no recursive call, no heap, no function values. So when an entry advertises
          &quot;reflection&quot; or &quot;rewriting&quot;, the word describes the source metaphor and its
          decoder — the labels are doing literature while the nodes do arithmetic.
        </p>
        <p>
          To read the catalog right, follow the selectors, since a storage label of
          &quot;stack&quot; allocates no stack and a control label of &quot;reflect&quot; reflects nothing at
          runtime. The five node kinds are the machine all hundred languages actually share.
        </p>

        <H2>Validation keeps the hundred apart</H2>
        <p>
          What keeps this from collapsing into one language wearing a hundred costumes is the{" "}
          <a href="https://github.com/mewhhaha/hallucinations/blob/d7e9220841885e162f8a4a099a49ef1f79b668d9/src/catalog_validation.ts">
            catalog validator
          </a>
          , and it is strict: ten entries per family, unique IDs and names, example and probe sources that
          differ, valid closest-relative links, no unused grammar tokens, in-range expression inputs, an{" "}
          <code>i32</code> expected result. It even rejects normalized grammar duplicates and repeated semantic
          fingerprints.
        </p>
        <p>
          That cage is why the artifact feels orderly — every generated entry has to occupy its own checked
          point in a fixed design space. Real variety survives at the decoding layer, where Roman numerals,
          balanced ternary, and token-length tricks all appear, but the compiler behind them always receives
          integer operands and the same five expression forms.
        </p>
        <p>
          The example-and-probe pair is the validator&apos;s nicest idea: each language must ship one witness
          and one counterexample against a dead input. For Guarded While the pair covers both branches of the{" "}
          <code>choose</code>. What it cannot establish is loop behavior, because no expected result anywhere
          contains a second application of the body.
        </p>
        <p>
          A disclosure before the last word: I inspected the source at the pinned commit and did not regenerate
          the private catalog, so take my judgments about the names as taste. The boundary claims you can check
          yourself — the validator will run for you.
        </p>
        <p>
          The <code>guarded-while</code> README calls the construct a bounded loop body. Its probe returns{" "}
          <code>8</code>, its canonical witness returns <code>11</code>, and between those two numbers the
          supposed loop has exactly enough room for one addition.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
