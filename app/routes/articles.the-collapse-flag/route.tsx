import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The collapse flag",
  description:
    "Reading HVM4's single-file runtime shows the interaction calculus surviving its fourth rewrite while the machine around it quietly turns from an evaluator into a program-search engine.",
  published: "2026-07-12T22:40:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-collapse-flag.jpg",
    alt: "A Jacquard loom in a museum, hundreds of warp threads fanning into the machine beside a hanging stack of punched pattern cards.",
    credit: {
      author: "Stephencdickson",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:A_Jacquard_loom_showing_information_punchcards,_National_Museum_of_Scotland.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const coreRules = `
(λx.body)(arg)          ! x &L= &L{a, b}; t
-------------- APP-LAM  ------------------- DUP-SUP
x ← arg                 x₀ ← a
body                    x₁ ← b
                        t
`;

const labelsExample = `
(&A{1, 2} + &A{10, 20})     (&A{1, 2} + &B{10, 20})
-----------------------
&A{11, 22}                  &A{&B{11, 21}, &B{12, 22}}
`;

const genBench = `
@expr = λ&L. λ{
  0n: λf. λx. x;
  1n+: λ&K. λf. λx.
    ! f &(L) = f
    ! x &(L) = x
    &(L){f₀(x₀), 1n+@expr(L+1,K,f₁,x₁)}
}

@main =
  ! &F = λF. @muln(1, 100000n, F)
  ! e0 = @Y(F)(3n) === 12000n
  ! e1 = @Y(F)(4n) === 16000n
  @when([e0,e1], [F])
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          This morning I published <a href="/articles/following-the-wire">an essay</a> about
          learning to read the output of HVM2, the interaction-net runtime under Bend, with a
          pencil and a pinned version number. By dinnertime the pin had slipped. The repository
          worth reading is <a href="https://github.com/HigherOrderCO/HVM4">HVM4</a>, unreleased
          and warning you off five lines into its README, and according to{" "}
          <a href="https://x.com/VictorTaelin/status/2063392469195338129">its author</a> an HVM5
          already exists and runs five times faster. So this follow-up trades the pencil for the
          source: HVM4&apos;s entire runtime is one 6,435-line C file, and I spent the evening in
          it.
        </p>
        <p>
          Two things came out of that reading. The calculus at the center has barely moved through
          four rewrites, while everything around it has been replaced every time — and the newest
          machinery exists to run many candidate programs at once and fish out the one that
          answers.
        </p>

        <H2>Four machines, four bets</H2>
        <p>
          The lineage is short but violent. Each generation kept the theory and re-bet the
          engineering:
        </p>
        <DataTable
          head={["Runtime", "Year", "Written in", "Evaluation", "The bet"]}
          rows={[
            [
              <a href="https://github.com/HigherOrderCO/HVM1">HVM1</a>,
              "2022",
              "Rust",
              "Lazy",
              "Optimal reduction can beat GHC outright",
            ],
            [
              <a href="https://github.com/HigherOrderCO/HVM2">HVM2</a>,
              "2024",
              "Rust + CUDA",
              "Strict",
              "Interaction combinators scale to GPUs",
            ],
            [
              <a href="https://github.com/HigherOrderCO/HVM3">HVM3</a>,
              "2025",
              "Haskell + C",
              "Lazy",
              "Compile the hot fragments to C",
            ],
            [
              <a href="https://github.com/HigherOrderCO/HVM4">HVM4</a>,
              "2026",
              "One C file",
              "Lazy",
              "Superpose programs and collapse to answers",
            ],
          ]}
        />
        <p>
          HVM1 promised to be &quot;exponentially (in the asymptotical sense) faster than
          alternatives, including Haskell&apos;s GHC&quot; on higher-order code, and its README
          still says &quot;Production Ready Soon!&quot;. HVM2 went strict, targeted CUDA, got{" "}
          <a href="https://github.com/HigherOrderCO/HVM2">a paper</a>, and became the machine Bend
          shipped on — the one this morning&apos;s essay dissected. Then the third swung back to
          lazy, swapped Rust for Haskell, and grew a compiler that lifts hot fragments into C.
        </p>
        <p>
          Lazy, strict, lazy: the same theory keeps auditioning in different theaters. An
          ecosystem lives downstream of every audition — Bend programs, tutorials, my own morning
          essay — and it reinterviews for its part each time.
        </p>

        <H2>The calculus that survives every rewrite</H2>
        <p>
          What never changes is the <em>Interaction Calculus</em>: a lambda calculus where
          variables are affine and global, plus two dual constructs — duplication, which lets one
          value exist in two places, and superposition, which lets two values exist in one place.
          The whole engine is four rewrite rules. Here are the two that do the work, straight
          from{" "}
          <a href="https://github.com/HigherOrderCO/HVM4/blob/main/docs/theory/interaction_calculus.md">
            the theory doc
          </a>
          :
        </p>
        <CodeBlock lang="text" title="two of the four core interactions" code={coreRules} />
        <p>
          In HVM4 every one of those terms is a single 64-bit word — an 8-bit tag, 24 bits of
          label, 32 bits of payload. The 6,435 lines are mostly the four rules multiplied out
          across numbers, constructors, and pattern matches: 61 interactions, each with its own
          documentation file and a sequent-calculus comment in the source.
        </p>
        <p>
          The load-bearing subtlety is <em>labels</em>. A duplication meeting a superposition with
          the same label annihilates, pairing first with first; different labels commute and
          produce every combination:
        </p>
        <CodeBlock lang="text" title="same label pairs, different labels multiply" code={labelsExample} />
        <p>
          Read that right column again. Two two-way superpositions with distinct labels just
          computed a four-way cross product in one expression. Every node picks, through its
          label, whether it zips pairwise or multiplies into every combination.
        </p>

        <H2>The second purpose</H2>
        <p>
          A cross product of every choice is a search space, and this is where HVM4 stops being a
          faster HVM2. Collapse — enumerating the plain lambda terms hiding inside a superposed
          result — is a first-class CLI flag, <code>-C10</code> meaning &quot;give me ten
          answers.&quot; And once you know to look, the term table reads like an inventory for
          something other than evaluation:
        </p>
        <DataTable
          head={["Sign in the repo", "What it is for"]}
          rows={[
            [
              <code>ANY</code>,
              <>
                A wildcard that &quot;duplicates itself, equals anything&quot; — a hole a search
                can fill
              </>,
            ],
            ["Stuck names", "Heads that stay symbolic instead of reducing away"],
            ["Equality node", "Structural comparison as a term inside the machine"],
            ["Priority wrapper", "Steers which branches the collapser visits first"],
            ["Runtime labels", "Superpositions whose labels are computed while the program runs"],
          ]}
          caption="Term-table entries that serve enumeration rather than speed."
        />
        <p>
          None of those make Fibonacci faster. And the benchmark directory gives the game away —{" "}
          <code>gen_mul4k.hvm</code> does not compute a number:
        </p>
        <CodeBlock lang="text" title="devs/bench/gen_mul4k.hvm (excerpt)" code={genBench} />
        <p>
          <code>@expr</code> superposes, at every step, &quot;stop here&quot; against &quot;keep
          building,&quot; using a fresh runtime label per layer so choices multiply instead of
          pairing. <code>@main</code> then constrains an unknown function to satisfy two equations
          and asks the collapser for whatever survives. The output of this benchmark is a program.
          That is <a href="https://x.com/VictorTaelin/status/1985320306001477783">SupGen</a>, the
          program-synthesis project this runtime now clearly serves, sitting in the folder where
          fib benchmarks used to live.
        </p>
        <p>
          Honesty requires an asterisk here, in two directions. The November announcement promised
          compilation of interaction-calculus functions to &quot;zero-overhead machine
          code&quot;, and the word compile appears nowhere in this repository — so the public HVM4
          is a very fast interpreter, and the compiler lives somewhere I cannot read yet.
        </p>
        <p>
          The other direction: unlike this morning&apos;s essay, nothing here was executed. The
          README says &quot;you&apos;re here before launch. Use at your own risk,&quot; and every
          reduction quoted above is the repo&apos;s own documented output, not mine. I read the
          machine without once turning the crank, and a benchmark of my own is the obvious debt
          for a third essay.
        </p>
        <p>
          The Jacquard loom in the picture above holds its whole pattern space in a chain of
          punched cards, and weavers rebuilt looms around the card chain for a century without
          changing the cards. Four runtimes in, that is what the Interaction Calculus looks like
          to me — and somewhere past the pin I set this morning, the fifth loom is reportedly
          already threaded.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
