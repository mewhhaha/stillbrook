import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Callout,
  CodeBlock,
  CodeTabs,
  FlowSequence,
  H2,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "The functional inheritance",
  description:
    "Mainstream languages quietly inherited functional programming, and the next step is making mutation and effects visible in the types.",
  published: "2026-07-11T11:00:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-functional-inheritance.jpg",
    alt: "Aerial photograph of two rivers, the Inn and the Salzach, merging into a single stream between green banks.",
    credit: {
      author: "Carsten Steger",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Aerial_image_of_the_confluence_of_the_Inn_and_Salzach_(view_from_the_west).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const mutableLoop = `
  const names: string[] = [];

  for (const user of users) {
    if (user.active) names.push(user.name.trim());
  }

  names.sort();
`;

const valuePipeline = `
  const names = users
    .filter((user) => user.active)
    .map((user) => user.name.trim())
    .toSorted();
`;

const effectSignature = `
  price(order) -> money
  quote(order) -> money ! { network, clock, failure }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Functional programming never took over the industry, and at this point it no longer needs
          to. Something quieter already happened: it changed which parts of a program have to justify
          themselves. Mutation used to be the default, the thing you did without thinking about it.
          Now it tends to arrive marked &mdash; scoped, borrowed, or pushed out to a boundary where
          somebody can see it.
        </p>
        <p>
          The history reads less like a contest between paradigms and more like an inheritance.
        </p>

        <H2>A second model of the program</H2>
        <p>
          Early high-level languages mostly preserved the machine&apos;s story: values live in named
          cells, instructions update them, control moves forward. Lisp, ML, and their descendants told
          a different one, where you evaluate expressions and build new values instead of overwriting
          the old ones.
        </p>
        <p>
          The{" "}
          <a href="https://dl.acm.org/doi/10.1145/359576.359579">
            1977 Turing Award lecture by John Backus
          </a>{" "}
          made the case that conventional languages were still, underneath everything, transcriptions
          of the von Neumann machine. Haskell later pushed the alternative all the way and made purity
          and explicit input and output a whole-language discipline. What you get in exchange is local
          reasoning: the same input gives the same output, and you can swap one expression for an
          equal one without hunting through the rest of the program for hidden state.
        </p>
        <FlowSequence
          steps={[
            {
              title: "Then: separate languages",
              items: ["pure functions", "immutable values", "recursion"],
            },
            {
              title: "Now: borrowed vocabulary",
              items: ["lambdas", "pipelines", "pattern matching"],
            },
            {
              title: "Next: visible boundaries",
              items: ["ownership", "effect types", "isolated mutation"],
            },
          ]}
          caption="Functional ideas move from a separate tradition into ordinary language design."
        />

        <H2>The ideas leave home</H2>
        <p>
          Judged by market share, the movement looks like it stalled. The{" "}
          <a href="https://survey.stackoverflow.co/2025/technology/">
            2025 Stack Overflow survey
          </a>{" "}
          places Lisp, F#, and OCaml in the low single digits while JavaScript, Python, TypeScript,
          Java, and the C family dominate. But the survey counts labels, and the labels turn out to be
          the least interesting part &mdash; the dominant languages have spent years absorbing the
          functional vocabulary.
        </p>
        <p>
          Oracle&apos;s{" "}
          <a href="https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html">
            Java tutorial
          </a>{" "}
          describes lambdas as treating code as data and streams as pipelines. Rust&apos;s{" "}
          <a href="https://doc.rust-lang.org/book/ch13-02-iterators.html">
            iterator documentation
          </a>{" "}
          builds lazy transformations out of closures. And every TypeScript codebase I&apos;ve worked
          in leans on <code>map</code>, <code>filter</code>, immutable updates, and discriminated
          unions without anyone once calling it a functional program.
        </p>
        <p>Both styles now sit comfortably in the same file:</p>
        <CodeTabs labels={["Mutable loop", "Value pipeline"]}>
          <CodeBlock lang="ts" code={mutableLoop} />
          <CodeBlock lang="ts" code={valuePipeline} />
        </CodeTabs>
        <p>
          I still write the loop version fairly often. A pipeline can hide allocation, and failure
          handling inside a long chain gets awkward, so the direct loop is sometimes the clearer tool.
          What changed is that mutation became a choice instead of the only grammar the language gives
          you.
        </p>

        <H2>The next boundary is effect</H2>
        <p>
          The forward edge is not a stricter ban on state; it is a better account of it. Rust&apos;s{" "}
          <a href="https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html">
            ownership rules
          </a>{" "}
          let the compiler decide who may access and mutate memory. The research language{" "}
          <a href="https://koka-lang.github.io/koka/doc/book.html">Koka</a>{" "}
          records side effects in function types and can turn a functional update into in-place
          mutation once it proves nobody else is watching the value. OCaml&apos;s{" "}
          <a href="https://ocaml.org/manual/5.3/effects.html">effect handlers</a>{" "}
          separate an operation from the code that interprets it.
        </p>
        <PullQuote>Functional programming may win by becoming too ordinary to name.</PullQuote>
        <p>A future signature might read as much like a permission slip as a return type:</p>
        <CodeBlock
          lang="text"
          title="Illustrative effect signature"
          highlight="2"
          code={effectSignature}
        />
        <Callout variant="note" title="Why this matters for generated code">
          <p>
            As more code gets generated rather than written, visible effects shrink what a reviewer
            has to check. A function that can&apos;t reach the network or touch shared state is easier
            to trust than one whose boundaries exist only by convention.
          </p>
        </Callout>
        <p>
          Databases, interfaces, devices, and distributed systems deal in identity and change over
          time, so a purely functional future was never really on the table. What we are getting
          instead &mdash; slowly, one language feature at a time &mdash; are programs that keep pure
          transformation at the center and mutation local, and that can say precisely where change
          happens and who is allowed to cause it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
