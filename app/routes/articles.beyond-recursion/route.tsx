import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  Compare,
  H2,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "Beyond recursion",
  description:
    "Recursion describes repeated structure well, but production traversal needs explicit work once depth, cycles, budgets, or cancellation matter.",
  published: "2026-07-11T16:18:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/beyond-recursion.jpg",
    alt: "Six antique painted matryoshka dolls arranged from largest to smallest on a blue museum shelf.",
    credit: {
      author: "Лапоть",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:Early_matryoshka_-_All-Russian_Decorative_Art_Museum.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const recursiveWalk = `
  function walk(node: Node): void {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    consume(node);

    for (const child of node.children) walk(child);
  }
`;

const worklistWalk = `
  const pending = [root];
  let budget = 10_000;

  while (pending.length && !signal.aborted && budget-- > 0) {
    const node = pending.pop()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    consume(node);
    pending.push(...node.children);
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Recursion is a lovely way to describe a problem. You call the function again, the stack
          remembers the unfinished work, and everything feels inevitable &mdash; right up until the tree
          turns out to be a graph, one path runs 80,000 nodes deep, and the user clicks cancel while
          your elegant definition has nowhere to put the request.
        </p>

        <H2>The stack made choices</H2>
        <p>
          A recursive traversal makes a pile of decisions without telling you: depth-first order,
          last-in-first-out scheduling, one active branch at a time, one frame per level. The state
          didn&apos;t go away. It moved into the call stack, which happens to be the one place where
          you can&apos;t easily inspect it, budget it, pause it, or write it to disk.
        </p>
        <p>
          Python&apos;s{" "}
          <a href="https://docs.python.org/3/library/sys.html#sys.getrecursionlimit">
            recursion limit
          </a>{" "}
          exists to stop that hidden state from blowing through the C stack, which tells you something
          &mdash; the runtime already treats your tidy definition as a hazard to contain.
        </p>
        <p>Compare the pretty version with the honest one:</p>
        <CodeTabs labels={["Recursive", "Worklist"]}>
          <CodeBlock lang="ts" code={recursiveWalk} />
          <CodeBlock lang="ts" highlight="2,4" code={worklistWalk} />
        </CodeTabs>
        <p>
          The second version admits there&apos;s pending work, a budget, cancellation, and a cycle
          policy. And once the machinery is on the table you can mess with it: swap{" "}
          <code>pop()</code> for a queue and the order changes, swap in a priority queue and you get to
          decide what matters first.
        </p>
        <Compare
          attributes={["The claim", "Conditions"]}
          entities={[
            {
              name: "Tutorial",
              values: [
                "Add a base case.",
                <code key="conditions">tree, depth 8, one owner</code>,
              ],
            },
            {
              name: "Production",
              values: [
                "Which one handles this?",
                <code key="conditions">cycle, cancel, retry, depth 140,000</code>,
              ],
            },
          ]}
          caption="Design review, five minutes later: the data structure grew up; the traversal didn't."
        />

        <H2>Recursive syntax, iterative engine</H2>
        <p>
          Mature systems already make this split. PostgreSQL&apos;s{" "}
          <a href="https://www.postgresql.org/docs/current/queries-with.html">
            recursive query documentation
          </a>{" "}
          is upfront about it: the syntax is recursive, but the engine evaluates it iteratively with a
          working table. Clang&apos;s{" "}
          <a href="https://clang.llvm.org/docs/DataFlowAnalysisIntro.html">
            data-flow analysis guide
          </a>{" "}
          does the same dance, putting changed blocks back onto a worklist queue until the analysis
          reaches a fixpoint.
        </p>
        <p>
          That&apos;s the whole move: separate what repeats from how unfinished work gets scheduled.
          Folds and iterators do it for sequences, worklists for graphs, streams for values arriving
          over time, fixed-point engines for facts that keep producing more facts.
        </p>
        <PullQuote>The stack is an implementation detail pretending to be an architecture.</PullQuote>

        <H2>Keep recursion where it tells the truth</H2>
        <p>
          Use recursion when the input is bounded and tree-shaped and the call stack happens to be the
          schedule you want &mdash; a small syntax tree transform, say. I still reach for it there
          without a second thought. But once you need pause and resume, deduplication, parallelism,
          checkpoints, or any kind of progress reporting, those six lines aren&apos;t elegant anymore;
          they&apos;re hiding the hard part.
        </p>
        <p>
          None of this bans self-reference. Keep the recursive definition &mdash; it&apos;s usually the
          clearest statement of the problem &mdash; and promote the progress to data, so unfinished
          work can be inspected, reordered, cancelled, or picked back up after a crash. The program
          reads about the same, and now you can actually operate it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
