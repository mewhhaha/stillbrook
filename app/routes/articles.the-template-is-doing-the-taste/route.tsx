import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "A template can say no",
  description:
    "A useful design template records the audience, decision, hierarchy, and vetoes that make a polished output fit its task.",
  published: "2026-07-15T00:08:00Z",
  author: "Mira Voss",
  tags: ["craft", "software"],
  image: {
    src: "/images/articles/the-template-is-doing-the-taste-journal.webp",
    alt: "A hand places a round botanical tile into a wooden template surrounded by tiles depicting plants and landscapes.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const designBrief = `
- Make a clean, modern analytics dashboard.
+ Audience: support lead deciding which queue needs staff.
+ Keep backlog, breach risk, and staffing gap visible together.
+ Preserve the existing table; summaries may not replace records.
+ One primary action: move an agent between queues.
+ Use the product type scale and spacing tokens.
+ Reject any layout where color carries status alone.
`;

const comparisonAttributes = ["Brief", "Composition", "Decision support", "Reason to reject"] as const;

const comparisonEntities = [
  {
    name: "Open brief",
    values: [
      '“Make a clean, modern analytics dashboard”',
      "Metric cards, chart, table, and several equally prominent controls",
      "Backlog is visible, but the staffing decision has no privileged path",
      "Only a general judgment that the page does not feel right",
    ],
  },
  {
    name: "Brief with vetoes",
    values: [
      "Names the support lead, staffing decision, required facts, inherited table, and forbidden failure",
      "Breach risk and staffing gap stay adjacent, with the queue table as the main body",
      "One move-agent action is evaluated against the facts that justify it",
      "Reject if records disappear, actions compete, or status depends on color",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Ask a model for a clean, modern analytics dashboard and you will get one, in roughly the sense that
          asking a kitchen for &quot;something nice&quot; gets you food. Now compare that brief with one that
          names the person using the page, the decision she is making, the facts that must stay visible together,
          and three reasons to throw away an otherwise handsome result. Both leave room for visual invention.
          Only the second can tell you whether the invention worked.
        </p>
        <p>
          That second brief is where taste actually lives when you hand design to a template. Not in the token
          for &quot;modern&quot;, which carries no audience, no hierarchy, and no stopping rule — in the
          priorities and the refusals.
        </p>

        <H2>The same task permits different pages</H2>
        <p>
          The open brief makes familiar dashboard furniture easy to justify. Backlog gets a card, staffing gets a
          card, breach risk gets a third, the queue table slides below a chart. Every piece is plausible on its
          own, and together they hand the support lead an inventory when she came for a decision: which queue
          needs a person moved, right now?
        </p>
        <Compare
          attributes={comparisonAttributes}
          entities={comparisonEntities}
          caption="Two defensible responses to one dashboard task, with explicit vetoes making the second easier to evaluate."
        />
        <p>
          Under the constrained brief, breach risk sits beside the staffing gap because those two facts jointly
          answer her question. The table survives because a summary may not replace the records an operator has
          to inspect, and status wears a label as well as a color. The page can still turn out ugly — but its
          important failures now have names a reviewer can point at, which is a real improvement over &quot;it
          feels off&quot;.
        </p>
        <p>
          I should say plainly that this is a constructed comparison, not a benchmark. The claim it supports is
          narrower and, as far as I can tell, solid: changing a few lines of brief changes which design choices
          can be defended in review. Creativity research has a name for the half that &quot;modern&quot; skips —
          Runco and Jaeger&apos;s{" "}
          <a href="https://doi.org/10.1080/10400419.2012.650092">standard definition</a> pairs originality with
          effectiveness, and effectiveness means fit: this institution, this decision, this reader.
        </p>

        <H2>Write the refusal into the brief</H2>
        <p>Watch what each added line buys.</p>
        <CodeBlock lang="diff" title="design-brief.diff" code={designBrief} />
        <p>
          The audience line fixes a point of view. Keeping three facts together defines the page&apos;s central
          relationship, and preserving the table stops a common &quot;simplification&quot; from deleting the
          evidence. One primary action settles the fight between buttons. The last line catches the page that
          looks perfectly coherent to a sighted reviewer while hiding status from anyone who cannot split its
          colors — the failure a polished render is best at smuggling through.
        </p>
        <p>
          UICoder ran this principle at training scale: generate interface programs, compile them, render them,
          score the renders, drop the near-duplicates. The{" "}
          <a href="https://arxiv.org/abs/2406.07739">paper reports</a> that 0.4 percent of the generated examples
          survived. Generation made the options cheap; the filters that discarded the other 99.6 percent were the
          taste.
        </p>

        <H2>A template can preserve the wrong taste</H2>
        <p>
          Vetoes are inherited decisions, so they age like any other decision. A template built for a calm
          marketing dashboard will quietly suppress the density an incident console needs, and a mandatory
          three-card summary can outlive the product it summarized. Reuse makes decisions consistent, including
          the stale ones — the refusals need review too, on some schedule nobody has invented yet.
        </p>
        <p>
          For the support dashboard, that review at least has material to work with. Breach risk drifted away
          from staffing, the records vanished, status leans on color alone: specific defects, each traceable to a
          line in the brief. The sharpest of those lines is still the last one, and it is doing more design work
          than the word &quot;modern&quot; ever did.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
