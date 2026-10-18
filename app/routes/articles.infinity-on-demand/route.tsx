import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Infinity on demand",
  description:
    "Haskell’s infinite lists are finite producers whose usefulness depends on productivity, short-circuiting consumers, fair enumeration, and forgetting prefixes the program has already used.",
  published: "2026-07-16T20:12:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/infinity-on-demand-journal.webp",
    alt: "A hand-cranked dispenser feeds a few glass seeds into a tray while one remains caught in a sieve.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const infiniteType = `
  data Infinite a = Inf a (Infinite a)

  naturalsFrom :: Integer -> Infinite Integer
  naturalsFrom n = Inf n (naturalsFrom (n + 1))

  takeInf :: Int -> Infinite a -> [a]
  takeInf 0 _ = []
  takeInf n (Inf x xs) = x : takeInf (n - 1) xs
`;

const consumerRows = [
  [<code key="take">take 5 [0..]</code>, "Five constructors", "Returns [0,1,2,3,4]"],
  [<code key="map">take 5 (map (* 2) [0..])</code>, "One input per output", "Returns a prefix"],
  [<code key="any">any (&gt; 1000) [0..]</code>, "Until the first match", "Returns True"],
  [<code key="foldr">foldr (&amp;&amp;) True (repeat False)</code>, "The first False", "Returns False"],
  [<code key="foldl">foldl&apos; (+) 0 [0..]</code>, "The final constructor", "Never returns"],
  [<code key="reverse">head (reverse [0..])</code>, "The end before the first output", "Never returns"],
  [<code key="filter">head (filter (&lt; 0) [0..])</code>, "A matching element", "Never returns"],
] as const;

const pairSearch = `
  unfairPairs = [(x, y) | x <- [0..], y <- [0..]]

  fairPairs =
    [ (x, total - x)
    | total <- [0..]
    , x <- [0..total]
    ]

  take 6 unfairPairs -- [(0,0),(0,1),(0,2),(0,3),(0,4),(0,5)]
  take 6 fairPairs   -- [(0,0),(0,1),(1,0),(0,2),(1,1),(2,0)]
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Ask GHCi for <code>take 8 [0..]</code> and it answers immediately. The notation makes an endless row
          look as though it already exists somewhere behind the prompt, waiting to be sliced. There is no infinite
          list waiting behind <code>[0..]</code>; there is a rule for producing another cell when the consumer asks.
        </p>
        <p>
          Haskell makes infinity useful by arranging finite observations of an unbounded process. The property that
          keeps the trick honest is <em>productivity</em>: every request for the next constructor must reach one after
          finite work. Lose that property and the type can still say “infinite” while the program waits forever.
        </p>

        <H2>The tail is a promise</H2>
        <p>
          GHC itself carries an internal infinite-list type with no empty constructor. Stripped to the part that
          matters, the design looks like this:
        </p>
        <AnnotatedCode
          lang="haskell"
          title="Infinite.hs"
          code={infiniteType}
          notes={[
            { line: 1, note: <>Every value exposes one element and another <code>Infinite</code>; there is no <code>Nil</code> case.</> },
            { line: 4, note: <>The outer <code>Inf</code> appears before the recursive tail is demanded.</> },
            { line: 8, note: <>The consumer supplies the finite budget. Only that many tails need evaluation.</> },
          ]}
          caption="The producer offers one constructor at a time, while the consumer decides how many constructors become observable."
        />
        <p>
          The recursive call in <code>naturalsFrom</code> sits in the lazy tail. Constructing the first cell leaves
          the second as suspended work. I love how little machinery this needs: the ellipsis in <code>[0..]</code>{" "}
          does an outrageous amount of conceptual work, while the heap receives only the portion evaluation reaches.
        </p>
        <p>
          The type still cannot guarantee progress. GHC&apos;s internal{" "}
          <a href="https://github.com/ghc/ghc/blob/master/compiler/GHC/Data/List/Infinite.hs#L55-L76">
            <code>filter</code> for <code>Infinite</code>
          </a>{" "}
          may reject elements until it finds one to emit. Apply <code>filter (const False)</code> to
          <code> repeat 1</code> and even <code>head</code> diverges. Its no-empty shape says nothing about how long
          the program searches before producing another constructor.
        </p>

        <H2>The consumer chooses the ending</H2>
        <p>
          The same unbounded producer can answer one consumer and hang under another. Ask for its end and you have
          asked for a constructor it never promised.
        </p>
        <DataTable
          head={["Expression", "What it must inspect", "Outcome"]}
          rows={consumerRows}
          caption="Each expression starts from an infinite list; termination depends on how much of that list the consumer needs."
        />
        <p>
          The{" "}
          <a href="https://github.com/ghc/ghc/blob/master/libraries/base/src/Data/Foldable.hs#L181-L209">
            <code>Data.Foldable</code> documentation
          </a>{" "}
          draws this line explicitly. A strict left fold must reach the last element before returning, so its input
          has to be finite. A lazy right fold can return when its combining function ignores the recursive result,
          which is why one <code>False</code> settles the infinite conjunction above.
        </p>
        <p>
          Infinite data works well for questions with finite evidence: find the first match, sample a signal,
          generate the next test case, or take a prefix for display. Asking for <code>length</code>, <code>last</code>,
          or a complete strict sum waits for a boundary the producer never promised.
        </p>

        <H2>Productive can still be unfair</H2>
        <p>
          Producing forever is weaker than exploring everything. A nested search over two infinite lists keeps
          yielding pairs, yet the inner list monopolizes the program and the first coordinate never advances.
        </p>
        <CodeBlock lang="haskell" title="Pairs.hs" highlight="1,3-7,9-10" code={pairSearch} />
        <p>
          The diagonal version spends a finite amount of time on each total before moving on, so every pair of
          natural numbers eventually appears. Property-test enumerators and search code need this distinction: a
          generator can remain productive while starving every branch after the first infinite one.
        </p>
        <p>
          GHC&apos;s internal module handles the same problem in{" "}
          <a href="https://github.com/ghc/ghc/blob/master/compiler/GHC/Data/List/Infinite.hs#L159-L162">
            <code>allListsOf</code>
          </a>. It emits all one-element lists, then all two-element lists, then the next length, instead of diving
          into one endless extension. Its output order decides whether every candidate gets a turn.
        </p>

        <H2>The machine stays finite</H2>
        <p>
          An unbounded producer still runs on a bounded heap. A pipeline can operate on a small live prefix when the
          consumer releases old cells. Keep a reference to the beginning and the reachable prefix stays live; the
          list type alone cannot promise constant space.
        </p>
        <p>
          Floating-point infinity is one finite encoding used in numeric operations. An infinite list describes
          continuing structure and survives only because the program never asks to hold all of it at once. I would
          not use the same word for those two representations without checking which one an API means.
        </p>
        <p>
          GHC&apos;s source places <code>data Infinite a = Inf a (Infinite a)</code> near a <code>filter</code> whose result
          carries that same type. Give the filter a predicate that never accepts and the first constructor never
          arrives. The type removes <code>Nil</code>. The predicate can still search forever before returning{" "}
          <code>Inf</code>.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
