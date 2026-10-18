import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, H2, Prose } from "../../components";

export const article = {
  title: "A problem worth the tokens",
  description:
    "Agent work earns its cost when the system carries a case to an externally verified result or a precise escalation.",
  published: "2026-07-15T09:30:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/a-problem-worth-the-tokens-journal.webp",
    alt: "A drafted order balances against a delivered parcel beside a chain of approval and receipt objects.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          The demo is always the same. The model drafts a flawless purchase order — correct filter, approved
          supplier, right price — and the room is impressed. Nothing has been purchased. The budget may be stale,
          the approver may say no, the supplier may never answer; what everyone is admiring is a document that has
          reached the first handoff.
        </p>
        <p>
          So here is the question I want asked of every agent feature: when the model stops, whose job is it to
          find out whether reality agrees? If the answer is you — you reconcile the draft against the purchasing
          system, you chase the approval, you notice the duplicate — then the feature made one step cheaper and
          left the job intact. The token bill bought typing.
        </p>

        <H2>Name the finish line</H2>
        <p>
          Paul David&apos;s{" "}
          <a href="https://www.jstor.org/stable/2006600">history of factory electrification</a> describes plants
          that swapped their central steam engine for one big electric motor and kept everything else: the
          shafts, the belts, the floor plan designed around steam. Productivity barely moved. It moved decades
          later, when factories reorganized the work itself around small motors at each station.
        </p>
        <p>
          Most AI features are the motor swap. The inbox drafts a reply, the project board clusters tickets, the
          IDE proposes a patch — each one genuinely useful, and each one keeping you employed as the shafts and
          belts, carrying state between systems and repairing the mismatch when reality disagrees with the text.
        </p>
        <Compare
          attributes={["Unit delivered", "Durable state", "Truth test", "Failure"]}
          entities={[
            {
              name: "Drafting feature",
              values: [
                "A suggestion",
                "Conversation and retrieved text",
                "A person checks another system",
                "Returns the best available completion",
              ],
            },
            {
              name: "Outcome system",
              values: [
                "A resolved case",
                "Decisions, evidence, authority, and deadlines",
                "The system of record confirms the result",
                "Escalates the exact missing premise",
              ],
            },
          ]}
          caption="The model may be identical; the product boundary decides whether it delivers a draft or carries a case."
        />
        <p>
          The right column demos badly, because its value only shows up after the generated text: identity,
          permissions, idempotent tool calls, observations read back from the target system, a repair path for
          the write that half-succeeded. Building those is the unglamorous product work. Skip it and the same
          fluent output leaves an unpaid order, a duplicate purchase, a delivery nobody recorded.
        </p>

        <H2>Verification changes the unit of work</H2>
        <p>
          METR&apos;s <a href="https://metr.org/time-horizons/">time-horizon measurements</a> score agents on
          self-contained software tasks with success criteria a script can check, and they report a substantial
          drop the moment evaluators judge performance more holistically. Product work lives on the far side of
          that drop. &quot;Send a plausible order&quot; grades as text; &quot;restock the filter without an
          unauthorized charge&quot; grades against external state that no transcript contains.
        </p>
        <p>
          An outcome system therefore keeps a case record, not a chat log. For the filter that means the
          requested part, the price ceiling, the approver, the vendor&apos;s response, the payment identifier,
          the receipt. Each model call reads a typed slice of that record, and each tool call comes back with
          evidence that advances the case or contradicts it.
        </p>
        <p>
          Token count loses its grip as a metric here, and good riddance. Ten completions proposing the same
          order are wasted motion, while one long, ugly run that checks authority, survives a vendor timeout,
          reconciles the acknowledgement, and closes the inventory discrepancy may have replaced the actual job.
        </p>

        <H2>A precise stop is part of the outcome</H2>
        <p>
          Some cases should end with a person, and the quality of that ending is measurable too. The useful
          escalation is narrow: the preferred supplier raised the price above the approved ceiling, no policy
          grants the agent authority to accept, and the quote expires Friday. Hand a reviewer a chat log instead
          and they get to rediscover all three facts themselves, which is the old job with extra reading.
        </p>
        <p>
          The filter case stays open through approval, payment, delivery, and reconciliation, and a blocked case
          waits with the quote attached. On the happy path it closes on the least glamorous line in the record —{" "}
          <code>received_quantity: 12</code> — which is exactly the line the demo never shows.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
