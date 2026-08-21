import { articleMeta, type ArticleMeta } from "../../article";
import {
  AnnotatedCode,
  ArticleLayout,
  CodeBlock,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Typeclasses with the grain",
  description:
    "Functional programming in TypeScript becomes elegant when Haskell's laws are translated through native JavaScript shapes instead of copied as foreign syntax.",
  published: "2026-07-11T16:47:12Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/typeclasses-with-the-grain.jpg",
    alt: "A black block plane resting on a wooden workbench surrounded by curled wood shavings.",
    credit: {
      author: "fireskystudios.com asthetik",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:Shaving_wood_(Unsplash).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const fluentEither = `
  const parsed = Right("42")
    .bind((text) => from_number(Number.parseInt(text, 10)))
    .map((value) => value + 1);

  const label = parsed.match({
    Left: (error) => "error:" + error,
    Right: (value) => "value:" + value,
  });
`;

const openMaybeDictionary = `
  interface AsMaybe extends As<AsMaybe>, Monad<AsMaybe> {
    readonly [type_item]: unknown;
    readonly [type_data]: Maybe<this[typeof type_item]>;
  }

  const Maybe = data<AsMaybe>(
    union(["Just", $slot], ["Nothing"]),
  );
`;

const doNotation = `
  const saved = Do(function* () {
    const text = yield* parse(input);
    const value = yield* validate(text);

    return yield* save(value);
  });
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Functional programming in TypeScript gets ugly the moment a library
          asks you to pretend the host language is Haskell. Higher-kinded
          encodings leak into your application types, half the import list ends
          up being point-free helpers, and ordinary JavaScript values disappear
          under a vocabulary that got transplanted without translation. None of
          that is the algebra&apos;s fault.
        </p>
        <p>
          <a href="https://github.com/mewhhaha/typeclasses">
            @mewhhaha/typeclasses
          </a>{" "}
          interests me because it makes the opposite wager: import the
          typeclass semantics, then let TypeScript decide how they should feel
          under the hand.
        </p>
        <CodeBlock lang="ts" title="A fluent Either" code={fluentEither} />

        <H2>The surface belongs to the host</H2>
        <p>
          The chain above looks like TypeScript. A value carries methods your
          editor can discover, callbacks keep their arrow syntax, and{" "}
          <code>match</code> turns a tagged tuple into an exhaustive expression
          you can read left to right without first learning a wall of
          operators.
        </p>
        <p>
          The package still exposes a{" "}
          <a href="https://github.com/mewhhaha/typeclasses#function-prelude">
            function-first prelude
          </a>{" "}
          with <code>fmap</code>, <code>pure</code>, <code>bind</code>, and{" "}
          <code>traverse</code>, and both surfaces dispatch through the same
          dictionaries — so picking the fluent methods costs you nothing.
          You&apos;re reaching the same operations from a friendlier angle, not
          settling for a beginner façade pasted over a second implementation.
        </p>
        <p>
          Purity of notation is a poor goal for a multi-paradigm language
          anyway. Sometimes a chain keeps the value visible, sometimes a
          standalone combinator makes generic code clearer, and the pleasant
          choice is usually whichever one lets the surrounding program keep its
          existing grammar.
        </p>

        <H2>The ugly part is allowed to be ugly</H2>
        <p>
          The{" "}
          <a href="https://dl.acm.org/doi/10.1145/75277.75283">
            original typeclass proposal
          </a>{" "}
          made ad-hoc polymorphism systematic, and in Haskell the compiler
          elaborates a constraint into the right instance dictionary for you.
          TypeScript has no native higher-kinded types — the request has been
          an{" "}
          <a href="https://github.com/microsoft/TypeScript/issues/1213">
            open language-design issue
          </a>{" "}
          since 2014 — so a library has to build the missing joints itself.
        </p>
        <AnnotatedCode
          lang="ts"
          title="The open-HKT adapter"
          code={openMaybeDictionary}
          notes={[
            {
              line: 1,
              note: (
                <>
                  The recursive constraint: <code>AsMaybe</code> extends the
                  typeclasses it implements, passing itself as the argument.
                  Each contributes canonical methods in symbol-keyed slots, so
                  unrelated typeclasses can reuse a method name without
                  colliding.
                </>
              ),
            },
            {
              line: 2,
              note: (
                <>
                  A phantom slot: nothing reads <code>[type_item]</code> at
                  runtime. It exists to carry the varying item type.
                </>
              ),
            },
            {
              line: 3,
              note: (
                <>
                  The payoff: <code>[type_data]</code> reapplies{" "}
                  <code>Maybe</code> to whatever the item slot holds,
                  recovering the raw shape a higher-kinded type would name
                  directly.
                </>
              ),
            },
            {
              line: 6,
              note: (
                <>
                  The <code>Maybe</code> this produces is callable and doubles
                  as the runtime dictionary. Wrapped values inherit its
                  implementations through a shared prototype.
                </>
              ),
            },
          ]}
          caption="The entire adapter: two phantom slots at the type level, one data call at runtime."
        />
        <p>
          This is dense code, and application authors should rarely have to
          look at any of it. A good abstraction keeps this machinery inside the
          library instead of making each application author reconstruct it.
        </p>
        <p>
          TypeScript&apos;s{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/type-compatibility.html">
            structural type system
          </a>{" "}
          and{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/declaration-merging.html">
            module augmentation
          </a>{" "}
          help at the boundary here. A local typeclass can extend an open data
          dictionary, install a runtime implementation, and get both generic
          and fluent access. The library covers for the language&apos;s missing
          feature by leaning on one it actually has.
        </p>

        <H2>Borrow syntax, account for cost</H2>
        <p>
          Generator-based <code>Do</code> notation is the most theatrical part
          of the package. It uses JavaScript&apos;s iterator protocol to make
          sequential binding look like ordinary assignment:
        </p>
        <CodeBlock lang="ts" title="Generator do notation" code={doNotation} />
        <p>
          The syntax works because the dependency stays visible: parsing
          produces the text validation needs, validation produces the value
          saving needs. When the inputs are independent, an applicative
          expression is still the better shape, and nothing here blurs that
          line.
        </p>
        <p>
          The runtime technique does have a cost. A multi-shot monad like a
          list may replay the generator for each branch, so code before a yield
          can run more than once. The repository says so up front, then offers
          an optional{" "}
          <a href="https://github.com/mewhhaha/typeclasses#build-time-transform">
            build-time transformer
          </a>{" "}
          that lowers supported blocks to direct method chains. Unsupported
          shapes are left alone and produce diagnostics, and detection is
          anchored to package imports rather than to any local function that
          happens to be named <code>Do</code>.
        </p>
        <p>
          That narrowness is the part I keep coming back to. A transform should
          compress ceremony, not grow into a private language whose execution
          model only the build step understands. The source can differ from the
          runtime, but a reader should still be able to see how the two relate.
        </p>

        <H2>The blank cells matter</H2>
        <p>
          The project is most convincing where it refuses an instance. Look at
          its{" "}
          <a href="https://github.com/mewhhaha/typeclasses#javascript-shapes">
            JavaScript-shape matrix
          </a>{" "}
          and notice what&apos;s missing: every empty cell marks a place where
          a familiar abstraction would have made a false promise.
        </p>
        <DataTable
          caption="The useful typeclass matrix includes deliberate blank cells."
          head={[
            "Shape",
            "Functor",
            "Applicative",
            "Monad",
            "Semigroup · Monoid",
            "Foldable",
            "Why the blank",
          ]}
          rows={[
            [
              "Validation",
              "✓",
              "✓",
              "",
              "",
              "",
              "Monad would break independent error accumulation.",
            ],
            [
              "Typed arrays",
              "",
              "",
              "",
              "",
              "✓",
              "A general map can't keep the numeric representation.",
            ],
            [
              "Map and Record",
              "✓",
              "",
              "",
              "✓",
              "✓",
              "No honest pure for an unknown key space.",
            ],
            [
              "Task",
              "✓",
              "✓",
              "✓",
              "",
              "",
              "None: parallel and sequential composition stay distinct.",
            ],
          ]}
        />
        <p>
          <code>Validation</code> has an accumulating <code>Applicative</code>{" "}
          but no <code>Monad</code>, because dependent binding would throw away
          the independent error accumulation the type exists for. Maps and
          records get useful semigroups and monoids but no arbitrary{" "}
          <code>pure</code> — there&apos;s no honest way to conjure one for an
          unknown key space. Typed arrays can fold, but a general{" "}
          <code>map</code> can&apos;t promise the output type still fits the
          underlying numeric representation.
        </p>
        <p>
          <code>Task</code> keeps both abstractions and makes their difference
          operational: applicative composition starts independent work
          together, while monadic composition sequences work whose next step
          needs the previous result. For once the vocabulary surfaces an actual
          scheduling decision.
        </p>
        <p>
          That restraint is where the experiment stops feeling like Haskell
          copied into TypeScript and starts feeling like language design. The
          laws decide what the API may promise, JavaScript decides what the
          runtime can deliver, and the editor gets a say too, since
          discoverability shaped the fluent surface. What comes out still has a
          functional accent, but it sounds like TypeScript.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
