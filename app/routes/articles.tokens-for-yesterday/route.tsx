import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Figure, H2, Prose } from "../../components";

export const article = {
  title: "Tokens for yesterday",
  description:
    "AI spends much of its intelligence preserving documents and workflows that only exist because human coordination used to be slow.",
  published: "2026-07-11T16:33:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/tokens-for-yesterday.jpg",
    alt: "Rows of labeled cardboard archive boxes on tall shelves receding down a corridor in the depot of the Dutch National Archives.",
    credit: {
      author: "Romaine",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:Nationaal_Archief_Den_Haag_(1).JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const agentRun = `
  request                         12 words
  ticket + spec + architecture    18,000 tokens
  repository context              31,000 tokens
  review + repair                 14,000 tokens
  status report                    1,200 tokens

  visible result                  one field moved
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Here&apos;s the embarrassing version of agentic work. You ask to move a field. The agent reads
          a ticket written up from a meeting, a spec that summarizes the ticket, architecture notes that
          contradict the code, and then finally the code itself. A review agent reads the whole pile
          again, and a status agent turns the result back into prose for people who will skim it.
          There&apos;s intelligence at every step and, as far as I can tell, nobody asking why the steps
          are there.
        </p>
        <p>The run below is illustrative, but I don&apos;t think it exaggerates much:</p>
        <CodeBlock lang="text" title="illustrative-agent-run.txt" highlight="2-5" code={agentRun} />
        <p>
          The waste isn&apos;t that the model talked. It&apos;s that we make it reenact a bureaucracy
          built to move context between humans who couldn&apos;t share it quickly — the ticket, the
          spec, the status report all made sense when the readers were people sitting in different
          meetings.
        </p>

        <H2>The artifact laundering machine</H2>
        <p>
          Anthropic&apos;s{" "}
          <a href="https://arxiv.org/abs/2503.04761">
            analysis of more than four million Claude conversations
          </a>{" "}
          found that software development and writing together accounted for nearly half of usage. Both
          useful domains — and both prolific producers of symbolic residue: tickets, wrappers, status
          reports, migration notes, summaries, explanations of explanations.
        </p>
        <p>
          The residue becomes tomorrow&apos;s prompt. In a randomized trial, METR found that{" "}
          <a href="https://arxiv.org/abs/2507.09089">
            experienced developers took 19 percent longer with early-2025 AI tools
          </a>{" "}
          on mature projects they already knew, while believing the whole time that the tools were
          making them faster. On a project like that, most of the work is archaeology — rereading old
          decisions so a new one can fit through them — and a fast generator mostly adds to the pile
          it&apos;s supposed to be digging through.
        </p>
        <p>
          A bigger context window won&apos;t buy your way out either. The{" "}
          <a href="https://arxiv.org/abs/2307.03172">Lost in the Middle study</a>{" "}
          found that models can struggle to use relevant information depending on where it sits in a
          long prompt, so shoveling the entire archive in mostly gets you a bigger warehouse to lose the
          box in.
        </p>
        <ContextReceipt />

        <H2>Delete the task</H2>
        <p>
          Before asking which model should automate a workflow, ask which parts of the workflow only
          survive because people needed handoffs. An agent that maintains shared state doesn&apos;t need
          status reports written for another agent to summarize. A user who can interrogate the source
          of truth doesn&apos;t need it cloned into a dashboard and three documents. And if the
          acceptance criteria can be executable, you can stop translating the same intent through a
          ticket, a specification, a patch description, and a review essay.
        </p>
        <p>
          Some problems stay stubbornly real no matter how much process you delete — safety, law, goals
          that genuinely conflict, inputs you can&apos;t trust, the physical world. Stop spending the
          expensive tokens on proof that a model can navigate an org chart and point them at those
          instead.
        </p>
        <p>
          Every agent leaves a receipt, the receipts feel like productivity, and the next agent pays
          for them as context — which is the quiet way AI defeats itself, producing artifacts faster
          than it removes the coordination that required them. The cheapest token is the one attached
          to a task you deleted.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

function ContextReceipt() {
  const charges = [
    ["generated implementation", "+ context"],
    ["generated tests", "+ context"],
    ["generated documentation", "+ context"],
    ["generated review", "+ context"],
    ["generated summary", "+ context"],
  ] as const;

  return (
    <Figure caption="Everything this run generates gets billed to the next one as context.">
      <div
        role="img"
        aria-label="A receipt listing generated code, tests, documentation, review, and summary, with the total charged to the next agent."
        className="mx-auto max-w-lg border-y border-dashed border-zinc-950/20 bg-zinc-50 px-5 py-6 font-mono text-sm dark:border-white/20 dark:bg-zinc-900"
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Agent economy</p>
          <p className="mt-2 font-semibold text-zinc-950 dark:text-white">Context receipt</p>
        </div>
        <div className="my-5 border-t border-dashed border-zinc-950/20 dark:border-white/20" />
        <div className="space-y-2.5">
          {charges.map(([item, cost]) => (
            <div key={item} className="flex items-baseline justify-between gap-4">
              <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
              <span className="shrink-0 text-zinc-500">{cost}</span>
            </div>
          ))}
        </div>
        <div className="my-5 border-t border-zinc-950/20 dark:border-white/20" />
        <div className="flex items-baseline justify-between gap-4 font-semibold text-zinc-950 dark:text-white">
          <span>Total</span>
          <span className="text-right">charged to the next agent</span>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Thank you for preserving the process.
        </p>
      </div>
    </Figure>
  );
}
