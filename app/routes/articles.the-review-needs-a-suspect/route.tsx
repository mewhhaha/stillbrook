import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  DiffReview,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The review needs a suspect",
  description:
    "An LLM can catch bugs in its own patch because the first draft gives the review pass concrete evidence to inspect.",
  published: "2026-07-11T17:08:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-review-needs-a-suspect.jpg",
    alt: "A hand holds a magnifying glass over a sheet of old postage stamps, bringing a single olive-green stamp into sharp focus.",
    credit: {
      author: "Heptagon",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Magnifying_glass2.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const repairedCache = `
  - const cache = new Map<string, User>();
  + const cache = new Map<string, Promise<User>>();

    async function getUser(id: string) {
  -   if (!cache.has(id)) {
  -     cache.set(id, await fetchUser(id));
  -   }
  -   return cache.get(id)!;
  +   const pending = cache.get(id) ?? fetchUser(id);
  +   cache.set(id, pending);
  +   void pending.catch(() => cache.delete(id));
  +   return pending;
    }
`;

const generationLoop = `
  let patch = await generate(task, repository);

  for (let pass = 0; pass < 2; pass++) {
    const evidence = await verify(patch);
    const critique = await review(task, patch, evidence);
    if (!critique.blocking.length) break;

    patch = await repair(patch, critique, evidence);
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          You watch the model write a race condition. Then you ask it to review the patch, and it points
          at the exact <code>await</code> that causes the race. The obvious question feels almost
          insulting: if you knew that, why did you write it?
        </p>
        <p>
          It didn&apos;t know, at least not in the way you mean. There was no finished patch sitting
          inside the model, waiting for the right prompt to fish it out. The review is another inference
          pass, and it gets to look at something the first pass never had: an actual candidate, with a
          control-flow path you can trace, and an instruction to distrust it.
        </p>
        <p>
          Which is a fine reason for the model to fumble the first draft, and a bad reason for a tool to
          hand you that draft as the answer.
        </p>
        <DiffReview
          file="cache.ts"
          lines={[
            { type: "add", text: "const cache = new Map<string, User>();" },
            { type: "add", text: "" },
            { type: "add", text: "async function getUser(id: string) {" },
            { type: "add", text: "  if (!cache.has(id)) {" },
            { type: "add", text: "    cache.set(id, await fetchUser(id));" },
            { type: "add", text: "  }" },
            { type: "add", text: "  return cache.get(id)!;" },
            { type: "add", text: "}" },
          ]}
          comments={[
            {
              line: 5,
              author: "Model as author (14:02)",
              text: "Looks consistent with the surrounding code.",
            },
            {
              line: 5,
              author: "Model as reviewer (14:03)",
              text: "Two calls can cross the await and duplicate the fetch.",
            },
          ]}
          caption="Same weights one minute apart on the same patch; only the objective changed."
        />

        <H2>The bug gets an address</H2>
        <p>
          When the model generates, you&apos;re asking for one plausible implementation out of thousands.
          When it reviews, you&apos;re asking what can fail in these twelve lines. The second question is
          smaller, and it comes with better nouns.
        </p>
        <CodeBlock lang="diff" title="cache.ts" highlight="1-2,5-12" code={repairedCache} />
        <p>
          In the removed version, two callers can both miss the cache before either fetch completes, and
          each one goes off and fetches. That interleaving is hard to ask about in the abstract, but once
          the code exists the reviewer only has to trace it. The repaired version caches the in-flight
          promise instead and evicts it if the fetch rejects.
        </p>
        <p>
          This split is useful enough that people train for it directly. The{" "}
          <a href="https://arxiv.org/abs/2407.00215">CriticGPT research</a>{" "}
          found that model-written critiques of model-written code were preferred over human critiques in
          63 percent of cases, and that the critics caught more bugs than the paid reviewers in the study
          — while also hallucinating defects that weren&apos;t there. Suspicion is a skill, not an oracle.
        </p>
        <p>
          You don&apos;t even need a second model. The{" "}
          <a href="https://arxiv.org/abs/2303.17651">Self-Refine paper</a>{" "}
          used one model as generator, critic, and refiner, and reported roughly twenty percentage points
          of average improvement across seven tasks. Nothing latent got uncovered along the way; the model
          spent one pass creating feedback and another acting on it.
        </p>

        <H2>Stop calling draft one the answer</H2>
        <p>
          So the unit worth building around is the whole loop — generate, verify, critique, repair — and
          the first call is only its opening move.
        </p>
        <CodeBlock lang="ts" title="agent-loop.ts" highlight="4-9" code={generationLoop} />
        <p>
          The <code>verify</code> step matters more than another confident paragraph, because a failing
          test or a profiler trace introduces facts the model can&apos;t manufacture by changing tone. The{" "}
          <a href="https://arxiv.org/abs/2305.01210">EvalPlus study</a>{" "}
          expanded HumanEval&apos;s tests by eighty times and exposed enough hidden failures to drop
          measured pass rates by 19.3 to 28.9 percentage points. A candidate that survives weak tests has
          merely exhausted the questions you happened to ask.
        </p>
        <p>
          Give the reviewer the original task, the patch, and the tool output, and ask for blocking
          defects and counterexamples rather than a ceremonial “make this better.” Then repair against
          those findings and run the checks again. A second model can add some diversity of opinion, but
          as far as I can tell the tool output moves the needle more than a change of personality does.
        </p>
        <p>
          So yes, the LLM can often write the code its review expects — after the review, because the
          expectation came from inspecting the draft. The part that bugs me is the interfaces. Draft one
          gets presented as finished work, and the pass that would actually catch the race sits behind
          another button I have to remember to press.
        </p>
        <p>
          Make the system read what it wrote before it hands you the mess. The model never needed to be
          clairvoyant for that.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
