import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, CodeTabs, Figure, H2, Prose } from "../../components";

export const article = {
  title: "The tree before the pixels",
  description:
    "An accessibility snapshot exposes the headings, labels, form, and button that a screenshot-matched checkout can lose before semantic HTML repairs them.",
  published: "2026-07-14T09:05:00Z",
  author: "Mira Voss",
  tags: ["web", "craft"],
  image: {
    src: "/images/articles/the-tree-before-the-pixels-journal.webp",
    alt: "A visitor with a white cane explores raised dots beneath an exposed wooden framework beside a painted checkout panel.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const intendedTree = `
  - main:
    - heading "Checkout" [level=1]
    - region "Order summary":
      - heading "Order summary" [level=2]
      - list:
        - listitem: Design system audit $48
    - form "Payment details":
      - heading "Payment details" [level=2]
      - textbox "Card number"
      - button "Pay $48"
      - status
`;

const screenshotDrivenHtml = `
  <div class="checkout-card">
    <div class="title">Checkout</div>
    <div class="summary">
      <div>Design system audit</div>
      <div>$48</div>
    </div>
    <div class="field-label">Card number</div>
    <input placeholder="Card number">
    <div class="pay" onclick="submitPayment()">Pay $48</div>
  </div>
`;

const screenshotDrivenTree = `
  - text: Checkout
  - text: Design system audit
  - text: $48
  - textbox "Card number"
  - text: Pay $48
`;

const semanticHtml = `
  <main class="checkout">
    <h1>Checkout</h1>

    <section class="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Order summary</h2>
      <ul>
        <li>
          <span>Design system audit</span>
          <strong>$48</strong>
        </li>
      </ul>
    </section>

    <form class="payment" aria-labelledby="payment-title">
      <h2 id="payment-title">Payment details</h2>

      <label for="card">Card number</label>
      <input
        id="card"
        name="card"
        inputmode="numeric"
        autocomplete="cc-number"
        aria-describedby="card-hint"
      >
      <p id="card-hint">Enter the number without spaces.</p>

      <button type="submit">Pay $48</button>
      <p role="status"></p>
    </form>
  </main>
`;

const ariaTest = `
  await expect(page.getByRole("main")).toMatchAriaSnapshot(` + "`" + `
    - main:
      - heading "Checkout" [level=1]
      - region "Order summary":
        - heading "Order summary" [level=2]
        - list:
          - listitem: Design system audit $48
      - form "Payment details":
        - heading "Payment details" [level=2]
        - textbox "Card number"
        - button "Pay $48"
        - status
  ` + "`" + `);

  await page.getByRole("button", { name: "Pay $48" }).press("Enter");
  await expect(page.getByRole("status")).toHaveText(/Processing|approved/);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          A checkout can pass every visual review and still hand a screen reader five anonymous
          lines. In the fixture below, “Checkout” looks like a heading because CSS enlarged it, and “Pay $48”
          looks like a button because a <code>div</code> got a dark background and an <code>onclick</code>. None
          of that costume reaches the browser&apos;s accessibility tree, which is the page assistive technology
          actually receives.
        </p>
        <CodeTabs labels={["Screenshot-driven HTML", "Observed tree"]}>
          <CodeBlock lang="html" title="checkout.html" highlight="2,3,8-10" code={screenshotDrivenHtml} />
          <CodeBlock lang="text" title="checkout.aria.yml" code={screenshotDrivenTree} />
        </CodeTabs>
        <p>
          Read the second tab the way a screen-reader user meets the page. The textbox has a name only while it
          is empty, because a placeholder vanishes under typed content. There is no heading to jump to, no form
          owning the payment controls, no button role, no keyboard path to pay, and no status node where a result
          could ever be announced. Matching the screenshot concealed every one of those losses, which is the
          trouble with grading pages by their pixels.
        </p>
        <p>
          The fixture is rigged, I admit — it exists to isolate the failure. A production checkout buries the
          same pattern under more markup, where it is harder to spot and no less absent from the tree.
        </p>

        <H2>Repair the document, then look again</H2>
        <p>
          The repair starts with plain elements. Browsers derive roles, names, and relationships from the DOM:
          the{" "}
          <a href="https://www.w3.org/TR/html-aam-1.0/">HTML Accessibility API Mappings</a> spell out how each
          native element enters the tree, and the{" "}
          <a href="https://www.w3.org/TR/accname-1.2/">accessible-name computation</a> decides which visible text
          names a control. So an <code>h1</code> restores something to jump to, a section labeled by its{" "}
          <code>h2</code> becomes the order-summary region, a form named by its heading owns the card field and
          the submit button, and a native button brings focus and keyboard activation along for free. The{" "}
          <code>label</code> survives typing; the placeholder never did.
        </p>
        <CodeTabs labels={["Intended tree", "Semantic HTML"]}>
          <CodeBlock lang="text" title="checkout.aria.yml" code={intendedTree} />
          <CodeBlock lang="html" title="checkout.html" highlight="2-5,15-17,20,30-31" code={semanticHtml} />
        </CodeTabs>
        <p>
          The visible card barely moves. Underneath it, the document has grown enough structure to navigate and
          operate with no pixels at all, which is what the figure&apos;s tree is showing.
        </p>
        <AccessibilityTreeFigure />
        <p>
          None of this dictates layout. CSS can still place the summary beside the form on a wide screen,
          provided source order and focus order keep making sense when the columns collapse — WCAG&apos;s{" "}
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html">
            meaningful-sequence criterion
          </a>{" "}
          tests that relationship rather than any particular grid technique. Reversed flex rows and absolute
          positioning are where the visual order and the programmatic one quietly drift apart, so they have
          earned the suspicion.
        </p>

        <H2>Keep the semantic diff executable</H2>
        <p>
          What do you hand the next agent that edits this page, so it stops undoing the repair? Playwright
          serializes the accessibility tree as order-sensitive YAML and diffs it with{" "}
          <a href="https://playwright.dev/docs/aria-snapshots">ARIA snapshots</a>, which turns “check
          accessibility” into an artifact that fails loudly after an edit. The contract stays scoped to this
          checkout instead of freezing an application-wide tree.
        </p>
        <CodeBlock lang="ts" title="checkout.spec.ts" highlight="1-13,15-16" code={ariaTest} />
        <p>
          The snapshot catches a button collapsing into generic text, a heading losing its level, a status node
          disappearing. The keyboard assertion covers behavior the tree cannot prove. One human duty remains:
          when the snapshot changes on purpose, somebody has to explain why, because regenerating the expected
          YAML on every red run is a machine for blessing regressions.
        </p>
        <p>
          Passing this tree is a narrow success, and it should be kept narrow. The serialization ends at{" "}
          <code>status</code> — no boxes, no contrast ratios, no coordinates — so it cannot say whether the price
          and the button overlap at 200 percent zoom. That check still belongs to eyes.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

function AccessibilityTreeFigure() {
  return (
    <Figure caption="One checkout expressed as a navigable accessibility tree and a visual card derived from the same semantic HTML.">
      <div className="grid gap-4 rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:p-5">
        <div className="rounded-xl border border-zinc-950/10 bg-zinc-950 p-4 text-zinc-100 dark:border-white/10">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">accessibility tree</p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 sm:text-sm">
{`main
├─ heading "Checkout" (level 1)
├─ region "Order summary"
│  ├─ heading "Order summary" (level 2)
│  └─ list
│     └─ listitem "Design system audit $48"
└─ form "Payment details"
   ├─ heading "Payment details" (level 2)
   ├─ textbox "Card number"
   ├─ button "Pay $48"
   └─ status`}
          </pre>
        </div>

        <div
          aria-hidden="true"
          className="rounded-xl border border-zinc-950/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950"
        >
          <p className="text-2xl font-semibold tracking-tight">Checkout</p>
          <div className="mt-5 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
            <p className="text-sm font-medium">Order summary</p>
            <div className="mt-2 flex justify-between gap-4 text-sm">
              <span>Design system audit</span>
              <strong>$48</strong>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-medium">Payment details</p>
            <p className="mt-3 text-xs text-zinc-500">Card number</p>
            <div className="mt-1 h-10 rounded-lg border border-zinc-950/15 dark:border-white/15" />
            <div className="mt-4 rounded-lg bg-zinc-950 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-zinc-950">
              Pay $48
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}
