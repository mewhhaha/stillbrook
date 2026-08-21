import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, Divider, H2, Prose } from "../../components";

export const article = {
  title: "Grain meets you halfway",
  description:
    "Trying Grain convinced me that functional language design becomes approachable when algebraic data types feel ordinary, mutation is explicit, and WebAssembly stays a deployment detail.",
  published: "2026-07-11T17:31:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/grain-meets-you-halfway.jpg",
    alt: "Van Gogh painting of a golden wheat field swaying beneath swirling clouds, with dark cypresses and olive trees at its edge.",
    credit: {
      author: "Vincent van Gogh",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Wheat-Field-with-Cypresses-(1889)-Vincent-van-Gogh-Met.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const parseQuantity = `
  module Cart

  from "number" include Number

  enum Quantity {
    Count(Number),
    Invalid(String),
  }

  let parseQuantity = input => {
    match (Number.parseInt(input, radix=10)) {
      Ok(value) when value > 0 => Count(value),
      Ok(_) => Invalid("quantity must be positive"),
      Err(_) => Invalid("quantity must be a number"),
    }
  }
`;

const sumArray = `
  module Totals

  from "array" include Array

  let sum = values => {
    let mut total = 0

    for (let mut i = 0; i < Array.length(values); i += 1) {
      total += values[i]
    }

    total
  }
`;

const productionBuild = `
  grain cart.gr
  grain compile --release cart.gr
  grain compile --release --elide-type-info cart.gr
`;

const maturity = [
  [
    "Grammar stability",
    "0.7.2 current, shipped February 8, 2026",
    "0.7 changed arrow syntax, parts of the grammar, and the object-file format",
  ],
  ["First build", "Slow once per project", "Around ten seconds with the packaged compiler"],
  [
    "Editor tooling",
    "Formatter and language server ship",
    "Inlay types, document symbols, and multiple-error display landed in recent releases",
  ],
  [
    "Package manager",
    "Proposal only",
    <>
      Cargo-like Silo is{" "}
      <a href="https://github.com/grain-lang/grain/issues/646">still an open issue</a>
    </>,
  ],
];

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I tried Grain because I wanted to see whether a small functional language could make
          WebAssembly feel like a place to write normal programs. It does, mostly. What I didn&apos;t
          expect was how relaxed the functional side would be.
        </p>
        <p>
          Algebraic data types, pattern matching, immutable bindings, and inferred types sit next to
          braces, named arguments, loops, early returns, and mutation when you ask for it. You can
          model your domain on day one, and when you need to count through an array you write a loop
          like everyone else.
        </p>

        <H2>The type system arrives quietly</H2>
        <p>
          My first useful program was input validation. The code names the good and bad outcomes
          directly:
        </p>
        <CodeBlock lang="text" title="cart.gr" highlight="5-8,11-15" code={parseQuantity} />
        <p>
          The compiler infers the function&apos;s type, and anyone reading the code still sees the contract.
          Grain&apos;s{" "}
          <a href="https://grain-lang.org/docs/guide/data_types">custom enum types</a>{" "}
          carry data,{" "}
          <a href="https://grain-lang.org/docs/guide/pattern_matching">pattern matching</a>{" "}
          takes them apart, and <code>Option</code> and <code>Result</code> are built from the same machinery
          as your own types, so there&apos;s no separate convention to memorize.
        </p>
        <p>
          The surface helps more than I expected. <code>parseInt</code> takes a named argument, functions are
          arrows with blocks, and annotations are there when you want them without the compiler demanding
          any. It reads like a normal program that happens to have a serious type system underneath.
        </p>
        <p>
          Even <code>Number</code> is looser than I assumed. Grain&apos;s{" "}
          <a href="https://grain-lang.org/docs/builtin_types">built-in type reference</a>{" "}
          says it covers arbitrary-size integers, floats, and rationals, with fixed-width numbers kept
          separate for when representation matters. I expected a Wasm language to pull every value toward
          the machine; instead you move toward the machine only when you have a reason to.
        </p>

        <H2>Loops without a lecture</H2>
        <p>
          Functional languages tend to lose people in the boring twenty percent of a program. The data
          model goes fine, and then a small accumulator turns into a detour about recursion and which
          combinator a serious person would use. In Grain you write the loop:
        </p>
        <CodeBlock lang="text" title="totals.gr" highlight="6,8-9" code={sumArray} />
        <p>
          Bindings are{" "}
          <a href="https://grain-lang.org/docs/guide/mutation">immutable by default</a>, so <code>mut</code>{" "}
          marks the two names that change, and the language gives you{" "}
          <a href="https://grain-lang.org/docs/guide/loops">ordinary loops</a>. None of this weakens the
          enum from the last section; the type system keeps doing its job while the local algorithm takes
          whatever shape reads best.
        </p>
        <p>
          I can swap the loop for a fold when the fold explains the operation better, but I don&apos;t have
          to do it to prove anything. Purity is a tool, not a dress code.
        </p>

        <H2>WebAssembly stays at the boundary</H2>
        <p>
          Grain{" "}
          <a href="https://grain-lang.org/">compiles directly to WebAssembly</a>, but you would hardly know
          it from the source. One CLI runs your program, emits Wasm, formats code, generates docs, and
          starts the language server. The target only really shows up when you ask for a production build:
        </p>
        <CodeBlock lang="sh" title="Build commands" code={productionBuild} />
        <p>
          The{" "}
          <a href="https://grain-lang.org/docs/tooling/building_for_production">release profile</a>{" "}
          adds size and speed optimizations. Eliding type information shrinks the module further, at the
          cost of records and enum variants printing less helpfully. I&apos;m fine with that kind of leak —
          it&apos;s a tradeoff with a name, and you pay it once, at build time.
        </p>

        <Divider />

        <H2>Early means early</H2>
        <p>
          The language feels coherent enough that it&apos;s tempting to assume the platform around it is
          finished too. It isn&apos;t, and Grain says so — its own{" "}
          <a href="https://grain-lang.org/docs/">documentation calls the language early and rapidly changing</a>.
          Read examples against the compiler you actually installed.
        </p>
        <p>
          Some rough edges are concrete. The{" "}
          <a href="https://grain-lang.org/docs/getting_grain">packaged compiler guide</a>{" "}
          warns about the first build up front, because the JavaScript compiler writes the runtime and
          standard library into your project. Building the native compiler is the faster path.
        </p>
        <DataTable
          head={["Area", "Current state", "The concrete fact"]}
          rows={maturity}
          caption="Where the platform stands at 0.7.2, from Grain's own documentation and release notes."
        />
        <p>
          Ten seconds is fine for an experiment. In a tight edit cycle I&apos;d feel it every time. Tooling
          is further along than I expected, and dependencies are the younger part of the story — as far as
          I can tell, nothing on that last row has moved past the issue tracker.
        </p>
        <p>
          So for now the bet stays small. Grain fits self-contained Wasm tools, experiments, teaching —
          anything with a modest dependency surface. That suits me. A language doesn&apos;t have to win
          anything to be worth an evening, and this one had me modeling failure states with real enums a
          few hours after I installed it. That&apos;s further than most languages meet me.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
