import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The proof budget",
  description:
    "Types are useful proofs when they encode stable, expensive invariants at compositional boundaries, while stronger proof languages trade automation and ergonomics for richer claims.",
  published: "2026-07-12T00:07:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-proof-budget-journal.webp",
    alt: "A hand checks a metal housing with a plug gauge beside calipers, measuring blocks, and stacked brass discs.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const leanComposition = `
  variable {A B C : Prop}

  theorem compose
      (ab : A → B)
      (bc : B → C) :
      A → C :=
    fun a => bc (ab a)
`;

const typescriptComposition = `
  type Fn<A, B> = (value: A) => B;

  const compose =
    <A, B, C>(bc: Fn<B, C>, ab: Fn<A, B>): Fn<A, C> =>
    (a) => bc(ab(a));
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I once spent an afternoon teaching TypeScript that a command list was non-empty. The helper
          worked, the red underline vanished, and the next function read untrusted JSON through
          <code> as Config</code>. I had proved a fact about the safe end of the pipe while leaving the
          input boundary open with a crowbar. Why was I proving the middle while a cast had kicked the
          front door off its hinges?
        </p>
        <p>
          The plug gauge in the photograph checks one dimension ruthlessly and ignores everything it was
          never built to measure. Types work the same way: they can prove whatever their logic can state and
          their checker can verify, under the assumptions you supply. In practice, teams stop much earlier
          because specifications take time, requirements move, and a perfect proof of the wrong property
          still ships the bug.
        </p>

        <H2>The arrow already means implication</H2>
        <p>
          <a href="https://lean-lang.org/theorem_proving_in_lean4/Propositions-and-Proofs/">
            Lean&apos;s propositions-and-proofs guide
          </a>{" "}
          makes the connection literal. A value of type <code>A</code> can be evidence for proposition A,
          while a function <code>A → B</code> turns evidence for A into evidence for B. The kernel checks the
          resulting proof term.
        </p>
        <CodeTabs labels={["Lean", "TypeScript"]}>
          <CodeBlock lang="text" title="Composition as implication" code={leanComposition} />
          <CodeBlock lang="ts" title="Composition as compatibility" code={typescriptComposition} />
        </CodeTabs>
        <p>
          Both snippets prove the joint: given the first two arrows, an <code>A → C</code> can be built.
          Lean reads the letters as propositions when they live in <code>Prop</code>. TypeScript&apos;s{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/type-compatibility.html">
            structural type system
          </a>{" "}
          treats them as sets of values accepted at each call site. Composition is proof composition when
          the types carry facts you care about. With ordinary application types, it usually proves that one
          output can be passed to the next input.
        </p>
        <p>
          TypeScript checks a weaker claim. A function may throw, loop forever, mutate shared state, or forge
          a return value through <code>any</code>. Even an honest <code>Email → Receipt</code> cannot establish
          that a person read the message. The business nouns make a call signature sound more worldly than
          the guarantee the checker actually provides.
        </p>

        <H2>The ladder runs sideways</H2>
        <p>
          &ldquo;Most advanced&rdquo; suggests one ranking, and these languages refuse to line up. Each picks a
          different balance among proof expressiveness, automation, executable code, kernel size, and daily
          ergonomics.
        </p>
        <DataTable
          head={["System", "Proof surface", "Automation", "Good first target"]}
          rows={[
            [
              <a href="https://ucsd-progsys.github.io/liquidhaskell-tutorial/Tutorial_01_Introduction.html">
                Liquid Haskell
              </a>,
              "Logical predicates on Haskell types",
              "SMT-heavy",
              "Bounds and data invariants",
            ],
            [
              <a href="https://idris2.readthedocs.io/en/latest/tutorial/typesfuns.html">Idris 2</a>,
              "Types may depend on values",
              "Elaboration and holes",
              "Sized collections and protocols",
            ],
            [
              <a href="https://agda.readthedocs.io/en/latest/getting-started/what-is-agda.html">Agda</a>,
              "Dependent types with checked termination",
              "Interactive checking",
              "Inductive proofs and algorithms",
            ],
            [
              <a href="https://fstar-lang.org/tutorial/book/index.html">F*</a>,
              "Refinements, effects, dependent types",
              "SMT plus tactics",
              "Security and cryptographic code",
            ],
            [
              <a href="https://lean-lang.org/theorem_proving_in_lean4/">Lean 4</a>,
              "Propositions and programs in dependent type theory",
              "Tactics plus a small kernel",
              "Mathematics and verified functions",
            ],
            [
              <a href="https://rocq-prover.org/doc/master/refman/language/core/basic.html">Rocq</a>,
              "Calculus of Inductive Constructions",
              "Tactics plus a kernel",
              "Large formal developments and extraction",
            ],
          ]}
          caption="Six proof-oriented systems by surface, automation, and the first problem they handle well."
        />
        <p>
          Liquid Haskell deliberately restricts its refinements to logic that fast SMT solvers can handle.
          Idris 2 can put a vector&apos;s length in its type and use <code>Fin n</code> to rule out an invalid
          index. F* combines richer types with automated verification for security-sensitive programs, while
          Lean and Rocq are comfortable when the theorem itself becomes the main artifact.
        </p>
        <p>
          You pay for those choices in termination and proof search. <a href="https://agda.readthedocs.io/en/latest/language/termination-checking.html">Agda checks recursive definitions for termination</a>, and Rocq restricts recursive constructions so a looping term cannot masquerade as evidence for any proposition. As the logic becomes richer, the checker usually asks for more guidance.
        </p>
        <p>
          I learned that distinction while encoding a small state machine in Idris. The legal transitions
          felt good in the editor until one helper needed a proof that it preserved a length index and
          consumed the evening. I eventually moved the helper behind a tested runtime boundary because its
          proof changed more often than the bug it prevented. I still like the type, though I no longer treat
          difficulty as evidence of value.
        </p>

        <H2>Spend proof where failure compounds</H2>
        <p>
          A proof pays best at a stable boundary used by many callers. Array bounds, protocol order,
          ownership, capability restrictions, serialization round trips, and cryptographic invariants qualify
          because one checked fact removes repeated defensive work downstream. A proof earns its keep when
          many callers get to stop checking the same fact.
        </p>
        <p>
          Product copy, recommendation quality, whether checkout feels confusing, and what a remote service
          actually did resist the same treatment. You can formalize a model of them, but then the expensive
          question moves to whether the model matches the next release. I have not found a universal cutoff.
          I look for a costly failure, a stable statement, and enough reuse to amortize the proof.
        </p>
        <p>
          Every theorem still relies on a trusted base: the kernel, chosen axioms, the compiler or extraction
          path, and whatever connects the model to the machine. F* can verify that code respects a protocol
          model. A foreign function can violate an assumption the proof accepted.
        </p>
        <p>
          On the branch I kept, <code>decodeConfig</code> returns a validated configuration and the retry layer
          refuses the raw version. The payment call still checks the provider response at runtime and records
          the idempotency key beside it. I left that assertion in place because our code cannot inspect the
          bank&apos;s ledger.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
