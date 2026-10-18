import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  Figure,
  H2,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "Five languages with no committee",
  description:
    "A tour of five creator-led languages from Reddit shows that tiny languages are strongest when they pursue one rude idea and weakest when they try to become an ecosystem.",
  published: "2026-07-12T22:52:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/five-languages-with-no-committee-journal.webp",
    alt: "Five handmade language machines share a workbench, four compact and one overgrown with levers.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const r3Example = `
  :main
    0 sdlcls
    $ff0000 sdlcolor
    10 10 100 100 sdlfrect
    sdlredraw ;
`;

const laxExample = `
  function { {year} is a leap year } {
    if year % 400 == 0, return true
    if year % 100 == 0, return false
    return year % 4 == 0
  }
`;

const tensaExample = `
  fn attn_scores(q: Tensor<f32, [H, D]>, k: Tensor<f16, [T, D]>)
      -> Tensor<f32, [H, T]>
      with tile=[8, 64], parallel=[h, t] {
    scores[h, t] = sum(i) q[h, i] * (k[t, i] as f32)
    return scores
  }
`;

const multilingualExample = `
  soit somme = 0
  pour i dans intervalle(4):
      somme = somme + i
  afficher(somme)
`;

const dragonstoneExample = `
  con limit: int = 10
  var x = 1024

  while x > 0
    echo x
    x //= 2
  end
`;

const booths = [
  { name: "R3", stars: 212, pitch: "the whole computer is a stack" },
  { name: "Lax", stars: 54, pitch: "grammar belongs to the programmer" },
  { name: "TensaLang", stars: 76, pitch: "attention should be source code" },
  { name: "multilingual", stars: 10, pitch: "one AST, many human languages" },
  { name: "Dragonstone", stars: 4, pitch: "Ruby, but every switch is optional" },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I searched creator posts in{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/">r/ProgrammingLanguages</a>{" "}
          and threw out anything with a company, foundation, or obvious user base. I wanted languages you
          could still mentally fit inside one person&apos;s head.
        </p>
        <p>
          These five repositories had between four and 212 GitHub stars when I checked on July 12, 2026.
          Stars are not quality scores. Here they are just proof that we are safely inside the garage.
        </p>
        <SmallLanguageExpo />
        <p>First, the five dialects of “I can fix programming”:</p>
        <CodeTabs labels={["R3", "Lax", "Tensa", "Multi", "Dragon"]}>
          <CodeBlock lang="text" title="main.r3" code={r3Example} />
          <CodeBlock lang="text" title="leap-year.lax" code={laxExample} />
          <CodeBlock lang="text" title="attention.tl" code={tensaExample} />
          <CodeBlock lang="text" title="bonjour.multi" code={multilingualExample} />
          <CodeBlock lang="text" title="countdown.ds" code={dragonstoneExample} />
        </CodeTabs>

        <H2>R3: the complete tiny computer</H2>
        <p>
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1sogdk4/showcase_r3forth_a_minimalist_stackbased_language/">
            <code>phreda4</code> presented R3
          </a>{" "}
          as a ColorForth-inspired language for recreational programming. The{" "}
          <a href="https://github.com/phreda4/r3">repository</a>{" "}
          contains the language, a roughly 40 KB C VM, a self-hosted compiler, an editor, and SDL-backed
          graphics and game tools. That coherence is the win: clone one strange little world and start
          drawing.
        </p>
        <ReviewCard
          strength="It has a point of view all the way down. The language, VM, tools, and demos agree about what R3 is for."
          cost="The data stack is invisible, the vocabulary is alien, and the core mostly treats values as 64-bit words. Team readability is not the project."
          verdict="Best tiny system. I would keep it installed for fun, not payroll."
        />

        <H2>Lax: grammar as user space</H2>
        <p>
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/182sfqi/lax_a_programming_language_where_the_syntax_is/">
            Lax&apos;s creator
          </a>{" "}
          wanted functions to define their own sentence-shaped call patterns. The{" "}
          <a href="https://github.com/swedishvegan/complax">compiler and VM</a>{" "}
          combine those patterns with static typing, inference, bytecode, and an experimental JIT. This is
          not prettier parentheses. It is mixfix syntax treated as the normal function interface.
        </p>
        <ReviewCard
          strength="It is the most interesting language-design idea here. A domain API can read like its domain without waiting for a macro system to bless it."
          cost="Every module can become a dialect. Ambiguity, formatting, search, documentation, and onboarding all inherit the grammar. One Reddit commenter called it “99 languages in a trench coat.”"
          verdict="Best research toy. Worst language to discover during an incident."
        />

        <H2>TensaLang: the one with a job</H2>
        <p>
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1r9d3il/tensalang_a_tensorfirst_programming_lowering/">
            Ben Chaliah introduced TensaLang
          </a>{" "}
          as a tensor-first language where an inference forward pass, reductions, tiling, and parallel
          dimensions live in source. The{" "}
          <a href="https://github.com/BenChaliah/Tensa-Lang">compiler</a>{" "}
          lowers through MLIR to an LLVM JIT on CPU or NVVM on CUDA.
        </p>
        <ReviewCard
          strength="It attacks a real seam: model code and scheduling decisions are visible instead of buried across a runtime and a pile of kernels."
          cost="The scheduling hints leak hardware into source, the toolchain is heavy, and the current backend story is mostly CPU plus CUDA. This is a research compiler, not an ecosystem."
          verdict="Most convincing language here because it refuses to be general purpose."
        />

        <H2>multilingual: semantics before spelling</H2>
        <p>
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1r860hw/multilingual_a_programming_language_with_one/">
            John Samuel&apos;s multilingual
          </a>{" "}
          keeps one semantic core beneath English, French, Spanish, and other surfaces. The{" "}
          <a href="https://github.com/johnsamuelwrites/multilingual">current implementation</a>{" "}
          has a browser playground, cross-language module imports, Python execution, and WAT/Wasm output.
          The experiment is better than simple keyword substitution because the shared AST is the actual
          product.
        </p>
        <ReviewCard
          strength="It separates program meaning from the historical accident that most syntax keywords are English. That is useful for teaching and tooling research."
          cost="Natural languages do not share word order, reserved words collide, and translated syntax can still feel foreign. The roadmap also sprawls into AI, multimodal, reactive, and distributed programming."
          verdict="Keep the semantic-core experiment. Ruthlessly cut the platform pitch."
        />

        <H2>Dragonstone: ambition without a knife</H2>
        <p>
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1psnmga/wanted_to_share_the_language_ive_been_working_on/">
            Vallereya&apos;s Dragonstone
          </a>{" "}
          is a Ruby-and-Crystal-inspired language with an interpreter, compiler, optional explicit types,
          classes, mixins, enums, LLVM and bytecode targets, and a self-hosting effort. The creator is
          refreshingly open about the unfinished{" "}
          <a href="https://github.com/Vallereya/dragonstone">repository</a>: garbage collection, a borrow
          checker, FFI, concurrency, package management, and editor tooling are all still moving.
        </p>
        <ReviewCard
          strength="There is real implementation behind the feature list, and the syntax has the easy familiarity of a Ruby-family language."
          cost="Optional typing, optional GC, an optional borrow checker, multiple backends, OOP, FFI, and self-hosting multiply each other. One contributor cannot test every combination into coherence."
          verdict="Cut 70 percent. The remaining 30 percent might become a language people can describe."
        />

        <PullQuote>A tiny language does not need a market. It needs an opinion worth stealing.</PullQuote>
        <p>
          R3 says the environment matters. Lax says grammar is an API. TensaLang says scheduling belongs
          beside the tensor program. multilingual says semantics should survive translation. Dragonstone
          accidentally supplies the control case: saying yes to everything is not a thesis.
        </p>
        <p>
          I would not build a company on any of these tomorrow. I would steal something from four of them
          today. That is the point of small languages. They can afford to be wrong in one interesting
          direction before a committee rounds the idea back into Java.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

function SmallLanguageExpo() {
  return (
    <Figure caption="GitHub stars on July 12, 2026: a size filter, not a ranking.">
      <div
        role="img"
        aria-label="Five small programming language booths show R3 with 212 stars, Lax with 54, TensaLang with 76, multilingual with 10, and Dragonstone with 4."
        className="rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {booths.map((booth) => (
            <div
              key={booth.name}
              className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-widest text-orange-700 dark:text-orange-400">
                  {booth.name}
                </p>
                <span className="font-mono text-xs text-zinc-400">★ {booth.stars}</span>
              </div>
              <p className="mt-3 text-sm leading-5 text-zinc-700 dark:text-zinc-300">
                {booth.pitch}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-dashed border-zinc-950/20 pt-4 text-center font-mono text-xs text-zinc-500 dark:border-white/20">
          no foundation · no steering council · package manager possibly imaginary
        </p>
      </div>
    </Figure>
  );
}

function ReviewCard({
  strength,
  cost,
  verdict,
}: {
  strength: string;
  cost: string;
  verdict: string;
}) {
  return (
    <div className="not-prose my-7 overflow-hidden rounded-xl border border-zinc-950/10 dark:border-white/10">
      <div className="grid sm:grid-cols-2">
        <div className="bg-zinc-50 p-4 dark:bg-zinc-900">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            What works
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{strength}</p>
        </div>
        <div className="border-t border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900 sm:border-l sm:border-t-0">
          <p className="font-mono text-xs uppercase tracking-widest text-red-700 dark:text-red-400">
            What bites
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{cost}</p>
        </div>
      </div>
      <div className="border-t border-zinc-950/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-950">
        <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
          <span className="mr-2 uppercase tracking-widest text-zinc-400">Verdict</span>
          {verdict}
        </p>
      </div>
    </div>
  );
}
