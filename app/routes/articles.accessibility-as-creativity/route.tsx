import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, Figure, H2, Prose } from "../../components";
import { AestheticLab } from "./aesthetic-lab";

export const article = {
  title: "Accessibility as creativity",
  description:
    "Three aggressive redesigns of one event page leave its accessibility tree untouched — which is exactly what frees them to be aggressive.",
  published: "2026-07-15T10:15:00Z",
  author: "Mira Voss",
  tags: ["web", "craft"],
  image: {
    src: "/images/articles/accessibility-as-creativity-journal.webp",
    alt: "Three differently colored curtains reveal the same tactile public noticeboard.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const sharedPage = `
  <section aria-labelledby="event-title" aria-describedby="event-summary">
    <p>Public programme</p>
    <p>Saturday 19 September · 21:00</p>
    <h3 id="event-title">After dark at the observatory</h3>
    <p id="event-summary">A small-group evening for learning the autumn sky.</p>
    <ul>
      <li>Rooftop telescope session</li>
      <li>Printed sky map included</li>
      <li>Step-free route to the dome</li>
    </ul>
    <p>Ticket €12</p>
    <button type="button">Reserve a place</button>
    <p role="status">12 places left</p>
  </section>
`;

const treeTest = `
  for (const theme of ["Field notes", "Night signal", "Civic notice"]) {
    await page.getByRole("button", { name: theme }).click();
    await expect(page.getByRole("region", {
      name: "After dark at the observatory",
    })).toMatchAriaSnapshot(` + "`" + `
      - region "After dark at the observatory":
        - heading "After dark at the observatory" [level=3]
        - list:
          - listitem: Rooftop telescope session
          - listitem: Printed sky map included
          - listitem: Step-free route to the dome
        - button "Reserve a place"
        - status: 12 places left
    ` + "`" + `);
  }
`;

const designReadings = [
  ["Field notes", "Serif title and paper tones", "Details read as a numbered notebook list", "Rounded dark reserve button"],
  ["Night signal", "Uppercase display type against deep blue", "Details become three instrument-like panels", "Mint control isolated in its own module"],
  ["Civic notice", "Date and title share a hard public grid", "Heavy rules divide the schedule", "Square black action beside the price"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Go ahead and press the three buttons below. The same event turns from a field notebook into a night
          instrument and then into a municipal notice, and through all of it the heading, the list, the price, the
          reserve button, and the live status stay exactly where they are. Only the paint moves.
        </p>
        <p>
          Accessibility has a reputation as the department of no — the late review that sands every design down to
          beige. I think this little lab argues the opposite case: bolt the meaning down first and you can afford
          to be reckless with everything else. Color, type, density, borders, and spatial emphasis all stay open,
          and the facts stop being collateral damage in every aesthetic pass.
        </p>

        <Figure caption="The same event region rendered as field notes, a night signal, and a civic notice.">
          <AestheticLab />
        </Figure>

        <H2>One spoken page</H2>
        <p>
          Under all three skins sits one semantic subtree: a labelled region holding the programme label, date,
          heading, summary, three details, price, button, and status message. Switching the treatment swaps a set
          of class names and touches nothing else.
        </p>
        <CodeBlock lang="html" title="observatory-event.html" highlight="1,4-5,7-11,14-15" code={sharedPage} />
        <p>
          Browsers derive roles, names, states, and relationships from native HTML and ARIA according to the{" "}
          <a href="https://www.w3.org/TR/core-aam-1.2/">Core Accessibility API Mappings</a> — the region takes its
          name from the heading, the button stays a button, the status keeps announcing reservation changes. That
          contract is settled before a single pixel is painted.
        </p>
        <p>
          <a href="/articles/the-tree-before-the-pixels">The tree before the pixels</a> used the same idea as a
          repair, an intended tree keeping a screenshot-driven build from shedding semantics. Here the repaired
          document gets a better job: design surface instead of frozen screenshot.
        </p>

        <H2>Three visual arguments</H2>
        <p>
          The CSS regroups without ever replacing the list. Field notes stacks the three details as numbered
          notebook lines, night signal rearranges the same items into instrument panels, and the civic notice
          drives heavy rules between them. A screen reader meets one list with three items every time, because the
          visual grammar comes from layout and paint rather than from alternate DOM branches.
        </p>
        <DataTable
          head={["Treatment", "Primary voice", "Detail structure", "Action treatment"]}
          rows={designReadings}
          caption="Each treatment changes hierarchy and spatial language while drawing from the same elements."
        />
        <p>
          The fixed document also keeps the comparison honest. Sneak in a second call to action, or drop the
          step-free route because it crowds the grid, and you have changed the proposition, not the style. With
          the document pinned, the visual system has to do all of the expressive work itself.
        </p>
        <p>
          Interaction lives inside the shared subtree too. Reserving a place disables the one real button, renames
          it “Place reserved,” and updates the status to “Place held for 10 minutes” — and that state survives
          switching treatments, so each design has to style the awkward disabled control it actually has instead
          of inventing a prettier success screen.
        </p>
        <p>
          Whether the three versions are equally pleasant to read is a question I have made no attempt to answer.
          The lab isolates one variable: substantial visual disagreement does not require semantic churn.
          Preference and usability still need evidence from people using the rendered pages.
        </p>

        <H2>The tree has a narrow jurisdiction</H2>
        <p>
          You can hold the invariant in a test. Playwright&apos;s{" "}
          <a href="https://playwright.dev/docs/aria-snapshots">ARIA snapshots</a> compare the accessible structure
          after each switch, and the assertion is deliberately strict about the named region, list contents,
          button, and status:
        </p>
        <CodeBlock lang="ts" title="same-tree.spec.ts" highlight="1-5,7-15" code={treeTest} />
        <p>
          What a passing snapshot cannot do is approve the design. Contrast, visible focus, reflow, target size,
          and reading order all need their own checks — WCAG separates{" "}
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">use of color</a> from{" "}
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html">focus appearance</a> and{" "}
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html">meaningful sequence</a>{" "}
          precisely because a tree settles none of them.
        </p>
        <p>
          The civic treatment makes the date impossible to miss, and its yellow band still looks a little like a
          depot warning. The snapshot reports the same region, heading, list, button, and status as the quiet
          field-notes version. On whether that yellow reads as urgent or merely loud, the tree has no opinion.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
