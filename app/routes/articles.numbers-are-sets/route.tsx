import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Numbers are sets",
  description:
    "Numeric types become practical when they denote sets of machine integers, letting guards intersect them and arithmetic map them while successor encodings remain available for induction.",
  published: "2026-07-27T14:55:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/numbers-are-sets.jpg",
    alt: "Three round metal laboratory sieves with different mesh sizes lie side by side.",
    credit: {
      author: "BMK",
      license: "CC BY-SA 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Laboratory_sieves_BMK.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const peanoNat = `
  inductive Nat where
    | zero : Nat
    | succ : Nat → Nat

  def three : Nat :=
    .succ (.succ (.succ .zero))
`;

const narrowingExample = `
  fn usable(n: I8) -> I8 {
    if n > 0 {
      let m = n - 3
      if m > 0 { return m }
    }
    return 0
  }
`;

const narrowingSteps = [
  {
    label: "Entry",
    title: "n ∈ [-128, 127]",
    detail: "The declared I8 type begins as every representable signed byte.",
  },
  {
    label: "Intersect",
    title: "n ∈ [1, 127]",
    detail: "The true branch of n > 0 removes zero and every negative value.",
  },
  {
    label: "Map",
    title: "m ∈ [-2, 124]",
    detail: "m = n - 3 shifts every surviving value down by three.",
  },
  {
    label: "Relate",
    title: "m ∈ [1, 124]",
    detail: "The second guard also implies n ∈ [4, 127] when the equation is retained.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Write three at the type level and the classic answer is a small tower: successor of successor of
          successor of zero. The shape is mathematically clean. For the questions a compiler asks about machine
          integers, though, walking a unary spine feels like bringing a family tree to a bounds check.
        </p>
        <p>
          A numeric type can instead denote every value a term may still hold. <code>I8</code> starts life as
          everything from -128 through 127, and the program itself whittles it down — a guard cuts values away,
          arithmetic shifts what survives. By the time you are three branches deep, the type is a running
          approximation of the number actually in your program.
        </p>

        <H2>Successor earns its place</H2>
        <p>
          Lean introduces natural numbers with the familiar inductive definition: zero is a natural, and the
          successor of a natural is another natural. Three is therefore a nested proof object.
        </p>
        <CodeBlock lang="lean" title="An inductive natural" highlight="2-4,6-7" code={peanoNat} />
        <p>
          This representation is excellent when a proof follows the structure of <code>Nat</code>. Handle zero,
          assume the result for <code>n</code>, and prove it for <code>succ n</code>. Recursive definitions line up
          with the same eliminator. The official{" "}
          <a href="https://lean-lang.org/theorem_proving_in_lean4/Inductive-Types/">Lean chapter</a> also introduces
          subtype notation such as <code>{"{x : α // p x}"}</code>, whose inhabitants are the values of a base
          type satisfying a predicate.
        </p>
        <p>
          Machine-integer guards ask a different question: which inhabitants survive this branch? Your program
          compares offsets and lengths all day and inducts over unary numerals roughly never, so the checker
          needs a vocabulary for shrinking what an ordinary integer might be.
        </p>

        <H2>A branch cuts the set</H2>
        <p>
          Consider a signed byte that must survive two positive checks. The source is ordinary control flow; the
          interesting part is what the checker can know at each line.
        </p>
        <CodeBlock lang="text" title="A range-narrowing example" highlight="2-5" code={narrowingExample} />
        <FlowSequence
          steps={narrowingSteps}
          caption="The possible values through one branch: declaration, guard intersection, arithmetic image, and a relation recovered from the second guard."
        />
        <p>
          The first guard is a straight cut. Subtraction is stranger — it does not shrink the set so much as drag
          the whole thing three places down. And if the checker keeps the equation <code>m = n - 3</code> around,
          the later fact <code>m &gt; 0</code> travels backwards and sharpens <code>n</code> too, which is the
          little move that sold me on the whole framing.
        </p>
        <p>
          F* makes the set interpretation explicit with{" "}
          <a href="https://fstar-lang.org/tutorial/book/part1/part1_getting_off_the_ground.html">
            <code>let nat = x:int&#123;x &gt;= 0&#125;</code>
          </a>. The{" "}
          <a href="https://ucsd-progsys.github.io/liquidhaskell-tutorial/Tutorial_03_Basic.html">
            LiquidHaskell tutorial
          </a>{" "}
          gives refinements the same reading: a base type plus a logical predicate constraining its inhabitants.
          Neither checker needs to turn four into four applications of <code>succ</code> before proving that four is
          positive.
        </p>

        <H2>Intervals eventually lie</H2>
        <p>
          One lower bound and one upper bound can only describe a solid interval. After <code>n != 0</code>, the
          exact set is <code>[-128, -1] ∪ [1, 127]</code>, so an interval-only checker gets two options — forget
          the hole, or start juggling unions of ranges — and neither is free.
        </p>
        <p>
          Relationships between variables cost more. Separate ranges for <code>x</code> and <code>y</code> cannot
          remember <code>x &lt; y</code> once both ranges widen. Antoine Miné&apos;s{" "}
          <a href="https://arxiv.org/abs/cs/0703084">octagon domain</a> keeps constraints shaped like
          <code>±x ±y ≤ c</code>, enough to retain many differences and sums without paying for arbitrary
          polyhedra. Its matrix representation makes a specific trade between precision and analysis cost.
        </p>
        <p>
          Fixed-width arithmetic adds another cut. A range crossing the wrap boundary can become two disjoint
          ranges, while multiplication introduces relations that no interval can express exactly. Abstract
          interpretation gives this engineering choice a name: the analyzer chooses an abstract domain, performs
          operations there, and accepts safe approximation when exact sets would explode. Cousot and Cousot&apos;s{" "}
          <a href="https://www.di.ens.fr/~cousot/COUSOTpapers/POPL77.shtml">original formulation</a> treats program
          execution through abstract objects instead of enumerating every concrete state.
        </p>
        <p>
          I do not know a convincing way to make arbitrary nonlinear refinements feel predictable in ordinary
          editor feedback. A deliberately limited{" "}
          <a href="https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.FSTTCS.2024.1">
            linear-integer arithmetic
          </a>{" "}
          fragment still handles useful equalities and inequalities, while leaving a programmer some chance of
          understanding why a branch failed to prove its bound.
        </p>

        <H2>Keep both number systems</H2>
        <p>
          Use inductive naturals where the proof genuinely follows zero and successor. For indexes, lengths,
          offsets, counters, and fixed-width values, let the type checker track a set or a deliberate approximation
          of one. A language can expose each view at the boundary where it fits.
        </p>
        <p>
          F*&apos;s factorial lecture reduces the safe recursive call to one obligation:{" "}
          <a href="https://fstar-lang.org/oplss2021/out/lecture1.html">
            <code>n &gt;= 0, n &lt;&gt; 0 ⊢ n - 1 &gt;= 0</code>
          </a>. The branch removes zero, subtraction shifts the remaining set, and the recursive argument stays
          inside <code>nat</code>.
        </p>
        <p>
          The last expression on that proof line is <code>n - 1 &gt;= 0</code>. That is the fact the recursive call
          needs, and it fits without printing another successor.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
