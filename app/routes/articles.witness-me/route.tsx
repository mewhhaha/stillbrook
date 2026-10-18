import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "A value can carry proof",
  description:
    "Pattern matching on a GADT key teaches the type checker the result type, turning an unchecked registry cast into an ordinary lookup.",
  published: "2026-07-15T11:00:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/witness-me-journal.webp",
    alt: "A hand unlocks a specimen drawer beside glass tubes of leaves, feathers, flowers, and differently shaped brass keys.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const uncheckedRegistry = `
  import Data.Map.Strict (Map)
  import qualified Data.Map.Strict as Map
  import Data.Text (Text)
  import GHC.Exts (Any)
  import Unsafe.Coerce (unsafeCoerce)

  type Registry = Map Text Any

  insertValue :: Text -> a -> Registry -> Registry
  insertValue name value = Map.insert name (unsafeCoerce value)

  readValue :: Text -> Registry -> a
  readValue name registry = unsafeCoerce (registry Map.! name)
`;

const typedKey = `
  {-# LANGUAGE GADTs #-}

  data Config = Config { host :: Text, retries :: Int, debug :: Bool }

  data Key a where
    Host    :: Key Text
    Retries :: Key Int
    Debug   :: Key Bool

  readKey :: Key a -> Config -> a
  readKey Host    = host
  readKey Retries = retries
  readKey Debug   = debug
`;

const heterogeneousStore = `
  import Data.Type.Equality ((:~:)(Refl))

  sameKey :: Key a -> Key b -> Maybe (a :~: b)
  sameKey Host Host = Just Refl
  sameKey Retries Retries = Just Refl
  sameKey Debug Debug = Just Refl
  sameKey _ _ = Nothing

  data Entry where
    Entry :: Key a -> a -> Entry

  lookupEntry :: Key a -> [Entry] -> Maybe a
  lookupEntry _ [] = Nothing
  lookupEntry wanted (Entry actual value : rest) =
    case sameKey wanted actual of
      Just Refl -> Just value
      Nothing -> lookupEntry wanted rest
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Every codebase past a certain age has this move somewhere: a string-keyed bag of settings, and a read
          function that lets you name whatever type you would like back. TypeScript spells it{" "}
          <code>config.get(&quot;retries&quot;) as number</code>. The Haskell below spells it with{" "}
          <code>unsafeCoerce</code>, which at least has the decency to look dangerous.
        </p>
        <CodeBlock lang="text" title="UnsafeRegistry.hs" highlight="7-13" code={uncheckedRegistry} />
        <p>
          Look at what <code>readValue</code> promises: any <code>a</code> the caller feels like. The map stores
          every value as <code>Any</code>, the key picks the slot, and you pick the type, and no part of the
          program marries the two. Ask for the <code>retries</code> slot at <code>Text</code> and the registry
          hands you an integer&apos;s bits wearing a text label. That compiles today, passes every test that only
          asks correct questions, and detonates next month inside some innocent function that tried to use the
          value.
        </p>

        <H2>Put the type inside the key</H2>
        <p>
          The repair is one of my favorite tricks in typed programming: stop letting the question and the type of
          its answer travel separately. A generalized algebraic data type lets each constructor pick its own
          index, so <code>Retries</code> does not have type <code>Key</code> — it has type <code>Key Int</code>,
          and asking with it is already a typed act.
        </p>
        <CodeBlock lang="text" title="Settings.hs" highlight="5-8,10-13" code={typedKey} />
        <p>
          Here is the part worth slowing down for. When <code>readKey</code> matches on <code>Retries</code>, GHC
          learns something inside that branch: the abstract <code>a</code> from <code>Key a</code> is now provably{" "}
          <code>Int</code>, which is why returning the <code>retries</code> field type-checks.{" "}
          <a href="https://ghc.gitlab.haskell.org/ghc/doc/users_guide/exts/gadt.html">GHC&apos;s guide</a> calls
          this refinement, and none of it exists at runtime — no cast, no tag check beyond the match you already
          wrote. People call the constructor a witness because holding it testifies to a fact the checker could
          not otherwise see.
        </p>

        <H2>Make equality a value too</H2>
        <p>
          A real registry is harder than <code>readKey</code>, because a registry hides types. Each{" "}
          <code>Entry</code> boxes a key with its value and forgets the index — that is the existential — so
          lookup has to recover a type it can no longer see. The move is the same one again, pushed further:
          comparing two keys can produce the missing proof as an ordinary value.
        </p>
        <CodeBlock lang="text" title="Registry.hs" highlight="3-7,9-17" code={heterogeneousStore} />
        <p>
          The type{" "}
          <a href="https://github.com/ghc/ghc/blob/master/libraries/ghc-internal/src/GHC/Internal/Data/Type/Equality.hs">
            <code>a :~: b</code>
          </a>{" "}
          has exactly one constructor, <code>Refl :: a :~: a</code>. So if <code>sameKey</code> hands you a{" "}
          <code>Refl</code>, the hidden type and the requested type were equal all along, and matching on it lets{" "}
          <code>value</code> walk out of its box at the type you asked for. Misses stay boring: different
          constructors mean <code>Nothing</code>, the search moves on, and no <code>Any</code> ever leaks past the
          door.
        </p>
        <p>
          You could build something similar on <code>TypeRep</code>, which is how GHC&apos;s own{" "}
          <a href="https://github.com/ghc/ghc/blob/master/libraries/ghc-internal/src/GHC/Internal/Data/Dynamic.hs">
            <code>Dynamic</code>
          </a>{" "}
          compares types at runtime. What <code>Dynamic</code> cannot tell you is why <code>retries</code> should
          be an <code>Int</code> in the first place. Untrusted configuration text still needs a parser at the
          boundary, one that returns an existential <code>SomeKey</code> and rejects unknown names, but that
          check runs once instead of at every use site.
        </p>
        <Compare
          attributes={["Who names the result type", "When a mismatch surfaces", "The key vocabulary"]}
          entities={[
            {
              name: "Any + unsafeCoerce",
              values: [
                "the caller, with nothing checking the choice",
                "at runtime, later, inside whatever code uses the mislabeled value",
                "any string at all",
              ],
            },
            {
              name: "Dynamic + TypeRep",
              values: [
                "the caller, checked against the stored type",
                "at lookup, when the runtime comparison fails",
                "every type in the program",
              ],
            },
            {
              name: "GADT Key",
              values: [
                <span key="who">
                  the key itself — <code>Retries</code> is a <code>Key Int</code>
                </span>,
                "the compiler rejects a mistyped ask before the program runs",
                <span key="vocab">
                  <code>Host</code>, <code>Retries</code>, <code>Debug</code> — the registry&apos;s actual domain
                </span>,
              ],
            },
          ]}
          caption="Three designs for the same settings registry, from unchecked cast to carried proof."
        />
        <p>
          The snag in my toy version is the wildcard at the bottom of <code>sameKey</code>. Add a{" "}
          <code>Timeout</code> constructor and forget its equal case, and everything still compiles — the new key
          is simply unfindable, every lookup a polite <code>Nothing</code>. Deleting the wildcard and enumerating
          the unequal pairs makes the compiler name the missing case, at the price of a quadratic pile of{" "}
          <code>Nothing</code> clauses. Whether that trade is worth it might be taste, but key vocabularies tend
          to grow exactly when nobody is thinking about this file anymore.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
