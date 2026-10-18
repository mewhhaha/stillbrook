import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Figure, H2, Prose } from "../../components";

export const article = {
  title: "The architecture diagram shrank",
  description:
    "Cloudflare keeps folding routing, state, durable work, browsers, containers, and AI into one programmable surface, and that compression is the real advantage.",
  published: "2026-07-11T17:18:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-architecture-diagram-shrank-journal.webp",
    alt: "A worker opens a compact cabinet full of pipes and tanks beside a sprawling cluster of service buildings.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const cacheConfig = `
  {
    "cache": {
      "enabled": true
    }
  }
`;

const order = [
  ["request runtime", "Worker"],
  ["durable identity", "Durable Object"],
  ["long-running work", "Workflow"],
  ["full computer", "Sandbox"],
  ["real browser", "Browser Run"],
  ["generated code", "Dynamic Worker"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Cloudflare&apos;s most telling launch this week is, of all things, a cache. One
          configuration block, normal <code>Cache-Control</code> headers, no second product to
          provision.
        </p>
        <CodeBlock lang="json" title="wrangler.jsonc" highlight="2-4" code={cacheConfig} />
        <p>
          The{" "}
          <a href="https://blog.cloudflare.com/workers-cache/">Workers Cache announcement</a>{" "}
          says it plainly: no zone, no rules engine, no separate cache to stand up. The cache belongs
          to the Worker and follows it across entrypoints. That&apos;s the pattern I keep noticing
          with Cloudflare lately — every few weeks another box disappears from the architecture
          diagram.
        </p>
        <KitchenTicket />

        <H2>The seams are the strategy</H2>
        <p>
          None of these ingredients is rare on its own; what&apos;s interesting is how close they sit
          to each other. A request comes in through a Worker, a globally named Durable Object owns the
          state (with its own SQLite database attached), and when an isolate is too small, a Sandbox
          supplies a shell and a filesystem. Generated code goes to a Dynamic Worker, which runs it
          behind narrow bindings instead of handing it your secrets.
        </p>
        <p>
          Cloudflare&apos;s{" "}
          <a href="https://blog.cloudflare.com/agents-week-in-review/">Agents Week summary</a>{" "}
          spells out the intended range: everything from lightweight isolates up through full
          operating systems, with identity, security, models, tools, and production deployment wrapped
          around them. Sandboxes and Containers are now generally available, and a named{" "}
          <a href="https://blog.cloudflare.com/sandbox-ga/">Sandbox</a>{" "}
          sleeps when idle, wakes on demand, keeps its workspace, and can receive credentials through
          an egress proxy without ever showing them to the agent.
        </p>
        <p>
          The stateful middle is the clever part. A{" "}
          <a href="https://developers.cloudflare.com/durable-objects/">Durable Object</a>{" "}
          gives you one globally addressable identity with strongly consistent storage underneath,
          which means you stop gluing together a function, a lock service, a database, a sticky router,
          and a recovery process for every little actor in the system. The primitive already thinks in
          the unit your application cares about: this room, this document, this tenant.
        </p>
        <p>
          And the pieces are arranged so the output of one is the natural input of the next. That
          arrangement, as far as I can tell, is the actual strategy — not any single product.
        </p>

        <H2>The awkward workload found its cloud</H2>
        <p>
          Agents fit badly into the old split between short stateless functions and always-on virtual
          machines. They&apos;re stateful but mostly idle. They live for weeks, do everything in
          bursts, and every so often one needs a real browser, or a terminal, or somewhere safe to run
          code it wrote five seconds ago.
        </p>
        <p>
          Cloudflare&apos;s long-running agent model treats the agent as something that exists
          continuously but runs intermittently: the Durable Object hibernates, keeps its SQLite state,
          and wakes when a message arrives. If the task needs Linux, the agent reaches into a Sandbox.
          If it generates a small program, a{" "}
          <a href="https://blog.cloudflare.com/dynamic-workers/">Dynamic Worker</a>{" "}
          can execute it with scoped RPC capabilities and filtered network access. The whole
          progression feels like one runtime changing gears.
        </p>
        <Callout variant="caution" title="The gravity is real">
          <p>
            The diagram only shrinks because the vendor boundary grew to cover it. Durable Objects,
            bindings, and Workers Cache are Cloudflare-shaped all the way down, so before you commit,
            test the limits, the observability, where your data actually lives, the local dev
            workflow, and — probably the most important one — how you&apos;d leave.
          </p>
        </Callout>
        <p>
          Still, the rest of the cloud spent years selling assembly as flexibility. Cloudflare&apos;s
          bet is that developers would rather program the application than maintain the seams around
          it, and every launch that turns another infrastructure box into a binding makes that bet
          look a little less reckless.
        </p>
        <p>
          The insight underneath all of it is that nobody wants to own the glue. When routing, state,
          durable work, browsers, containers, and generated code share one control plane, the
          architecture diagram stops looking like a procurement receipt and starts looking like a
          program.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

function KitchenTicket() {
  return (
    <Figure caption="Cloudflare read the agent architecture diagram as a kitchen ticket.">
      <div
        role="img"
        aria-label="A kitchen order ticket lists a Worker, Durable Object, Workflow, Sandbox, Browser Run, and Dynamic Worker as ingredients for one agent."
        className="mx-auto max-w-xl border-y border-dashed border-zinc-950/20 bg-zinc-50 px-5 py-6 dark:border-white/20 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-4 font-mono">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Platform kitchen</p>
            <p className="mt-2 font-semibold text-zinc-950 dark:text-white">Order: one useful agent</p>
          </div>
          <span className="text-xs text-zinc-400">#2026</span>
        </div>
        <div className="my-5 border-t border-dashed border-zinc-950/20 dark:border-white/20" />
        <div className="space-y-2.5">
          {order.map(([need, primitive]) => (
            <div key={need} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">{need}</span>
              <span className="font-mono font-medium text-zinc-950 dark:text-white">{primitive}</span>
            </div>
          ))}
        </div>
        <div className="my-5 border-t border-zinc-950/20 dark:border-white/20" />
        <div className="flex flex-col justify-between gap-1 font-mono text-xs text-zinc-500 sm:flex-row">
          <span>service note</span>
          <span>wake only when ordered</span>
        </div>
        <p className="mt-5 text-center font-mono text-xs text-orange-700 dark:text-orange-400">
          no Kubernetes tab was opened
        </p>
      </div>
    </Figure>
  );
}
