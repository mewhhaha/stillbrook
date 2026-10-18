import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Callout,
  CodeBlock,
  FlowSequence,
  H2,
  Prose,
  PullQuote,
} from "../../components";

export const article = {
  title: "The building block economy",
  description:
    "Agents make integration cheap enough that small, dependable capabilities can become products in their own right.",
  published: "2026-07-11T12:00:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/building-block-economy-journal.webp",
    alt: "Interchangeable wooden blocks assemble into a hand tool as their delivery rail folds away.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const capabilityContract = `
  {
    "name": "verify_supplier",
    "accepts": "supplier_record",
    "returns": "risk_report",
    "price": { "currency": "USD", "maximum": 0.03 },
    "service": { "p95_ms": 400, "uptime": 0.999 },
    "evidence": ["sources", "checked_at"],
    "permissions": ["read:supplier_record"]
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Software gets sold in containers sized for people: the app, the dashboard, the workflow, the
          subscription. An agent doesn&apos;t need most of that packaging. Give it a clear contract, a
          permission boundary, a price, and some evidence of the result, and it will happily assemble
          an outcome from parts no person would ever sit down and browse one by one.
        </p>
        <p>
          Which changes what&apos;s worth selling. Once integration is cheap, you don&apos;t have to
          ship a whole product anymore — a small capability that reliably does one thing can be the
          product.
        </p>

        <H2>The package gets smaller</H2>
        <p>
          Applications bundle search, comparison, verification, payment, and support because nobody
          wants to stitch five vendors together by hand. A lot of what you pay for in a bundle is
          coordination — shared state, navigation, translating data between systems, recovering when
          something fails halfway through. An agent can redo that integration on the fly, per task.
        </p>
        <p>
          The{" "}
          <a href="https://modelcontextprotocol.io/docs/learn/server-concepts">
            Model Context Protocol
          </a>{" "}
          standardizes how AI applications discover tools and resources. The{" "}
          <a href="https://a2a-protocol.org/latest/topics/agent-discovery/">A2A protocol</a>{" "}
          lets agents advertise skills in JSON Agent Cards and delegate work without exposing their
          internals. Stripe&apos;s{" "}
          <a href="https://stripe.com/newsroom/news/agentic-commerce-suite">
            Agentic Commerce Protocol
          </a>{" "}
          adds shared language between agents and sellers. All of this is early, and some of it
          probably won&apos;t survive, but the pieces point the same way: capabilities described in a
          form machines can read and compare.
        </p>
        <FlowSequence
          caption="One request can assemble a temporary supply chain."
          steps={[
            { label: "Intent", title: "Source a vendor under $500" },
            { label: "Agent", title: "Assembles the blocks", items: ["Search", "Verify", "Price", "Pay"] },
            { label: "Outcome", title: "Approved order with an audit trail" },
          ]}
        />

        <H2>A contract agents can buy</H2>
        <p>
          A machine can call an API without knowing whether it should. For a market to work, inputs
          and outputs aren&apos;t enough — the agent needs metadata it can compare offers on: price,
          latency, how fresh the data is, what permissions the block demands, where the answer came
          from, what happens on failure, and who is responsible when the result is wrong.
        </p>
        <p>A purchasable capability might publish something like this:</p>
        <CodeBlock lang="json" highlight="5-8" code={capabilityContract} />
        <p>
          The highlighted fields are what make this an offer rather than a function signature. With
          them, an agent can pick a slower verified supplier for payroll, a cheaper one for a rough
          draft, or a local fallback when the data can&apos;t leave the building.
        </p>
        <Callout variant="caution" title="The trust bill">
          <p>
            Every block you add is another place for data to leak or a promise to quietly fail.
            Discovery only works when it comes with identity, scoped authorization, versioned
            contracts, logs, and reliability someone has measured.
          </p>
        </Callout>

        <H2>Where value settles</H2>
        <p>
          Pricing shrinks along with the unit. Subscriptions make sense for a person who keeps coming
          back to a product they know by name; an agent can buy per result, per minute, or on success,
          and route the next job somewhere else without a trace of loyalty. The bill ends up attached
          to whichever block did the work.
        </p>
        <p>
          This is bad news for the integration moat. If a company wins by owning the screen and gluing
          commodity services together, an agent that can reproduce the glue on demand takes most of
          that protection away. The interface still matters — but more and more as the place where a
          person states intent, grants authority, and reviews what happened.
        </p>
        <p>
          What&apos;s left to defend is whatever can&apos;t be recomposed cheaply: exclusive data,
          legal rights, physical fulfillment, low latency, reputation, distribution. Orchestrators
          keep leverage too, since they hold identity, memory, and payment, and they decide which
          blocks even get seen. I suspect the marketplace itself ends up being the largest block of
          all.
        </p>
        <PullQuote>
          The scarce thing is not assembly. It is a promise another machine can safely depend on.
        </PullQuote>
        <p>
          If you&apos;re building for this economy, the move is a smaller promise, kept where other
          machines can check it: publish the contract, honor the numbers, log the evidence. The
          product a person sees may still look like one calm application. Underneath it, a temporary
          supply chain forms for each request and dissolves once the outcome is delivered.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
