import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Figure, H2, Prose } from "../../components";

export const article = {
  title: "The page before CSS",
  description:
    "A billing-page inventory becomes a usable hierarchy by grouping related facts, promoting the routine action, and separating destructive account changes before CSS adds polish.",
  published: "2026-07-14T08:15:00Z",
  author: "Mira Voss",
  tags: ["web", "craft"],
  image: {
    src: "/images/articles/the-page-before-css-journal.webp",
    alt: "A brass desk lamp lights a payment card, calendar, invoice tray, pause lever, and covered red cross beside a bird.",
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
          Lay a billing page&apos;s obligations on the table before any styling happens: show the Pro plan, name
          the saved card, state the next charge, hand over invoices, allow a pause, allow deletion. The template
          answer is six equal cards, and it looks tidy in a mockup. It is also a page with no opinion — deleting
          an account and downloading a receipt sit there at identical weight, as if the user were equally likely,
          and equally welcome, to do either.
        </p>
        <p>
          So before type, color, or border radius, the page needs an information argument. Plan and renewal date
          describe the subscription. Card and invoices belong to payment history, and pause and deletion change
          the account itself. One more fact sharpens everything: the saved card expires soon, which makes “Update
          card” the action this user probably came to perform.
        </p>

        <H2>Group, then rank</H2>
        <p>
          The figure below walks the same content through three passes: an inventory that records everything
          without pretending the order is settled, then the three groups, then a ranking — the current plan as
          the page&apos;s loudest fact, the dominant action handed to the expiring card, deletion dropped below a
          boundary line.
        </p>
        <BillingPassesFigure />
        <p>
          Notice what did not happen: nothing left the inventory. Invoices stayed near the card without competing
          against the update button. Pause is still one click, but it no longer borrows deletion&apos;s severity,
          and the renewal date sits with the plan it qualifies instead of floating as a disconnected metric.
        </p>
        <p>
          The part I like about settling this before CSS is that the grouping becomes falsifiable. If a user
          reads “Invoices” as part of account cancellation, the grouping failed, and no taste debate is required
          — just a fix. That is roughly what the W3C&apos;s{" "}
          <a href="https://www.w3.org/TR/coga-usable/">cognitive-accessibility guidance</a> asks a page to
          establish: clear purpose, familiar hierarchy, visible important actions, understandable boundaries. A
          component library cannot produce any of it from six settings records.
        </p>

        <H2>Hierarchy follows the likely task</H2>
        <p>
          “Update card” belongs inside the payment region, right next to the evidence that makes it necessary.
          Its whole labeled surface should be clickable, and WCAG 2.2&apos;s{" "}
          <a href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html">
            target-size criterion
          </a>{" "}
          puts a 24-by-24 CSS-pixel floor under most pointer targets. The invoices link can afford to be quiet,
          since downloading a receipt is optional and reversible.
        </p>
        <p>
          Deletion runs that profile in reverse: rare, destructive, deserving of an explanation and a recovery
          policy. Making its button the brightest object on the page would confuse severity with priority.
          Distance and a section boundary keep it findable without letting it win the first glance or sit beside
          a routine payment control.
        </p>
        <p>
          Only now does CSS get its turn, and it arrives with a job description instead of a blank canvas.
          Spacing preserves the three groups, type makes the plan and the payment problem scannable, and color
          may underline the expiring card as long as the words “expires soon” carry the fact on their own. At
          narrow widths, source order keeps subscription, payment, and account changes in that sequence.
        </p>
        <p>
          Is the hierarchy right? I can&apos;t promise that — it is a design hypothesis, not a usability result.
          A product where invoice retrieval dominates should promote that link instead, and an account with no
          payment problem should lose the warning treatment entirely. The grouping earns its keep by making such
          swaps local: one region changes, and the page&apos;s argument stands.
        </p>
        <p>
          In the final panel, “Visa ending 4242 · expires soon” sits directly above the black Update card button,
          and Delete account is a red text link at the bottom of Account changes, underneath all the routine
          work. The border radius can wait.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

function BillingPassesFigure() {
  return (
    <Figure caption="The same billing content passes through inventory, perceptual grouping, and task hierarchy before visual polish.">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">1 · inventory</p>
          <div className="mt-4 grid gap-2">
            {["Pro plan · $29", "Visa ending 4242", "Next charge · Aug 2", "Download invoice", "Pause plan", "Delete account"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-lg border border-zinc-950/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">2 · groups</p>
          <div className="mt-4 grid gap-4 text-sm">
            <div className="rounded-xl border border-zinc-950/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
              <p className="font-medium">Subscription</p>
              <p className="mt-2 text-zinc-500">Pro plan · $29</p>
              <p className="text-zinc-500">Next charge · Aug 2</p>
            </div>
            <div className="rounded-xl border border-zinc-950/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-950">
              <p className="font-medium">Payment and invoices</p>
              <p className="mt-2 text-zinc-500">Visa ending 4242</p>
              <p className="text-zinc-500">Download invoice</p>
            </div>
            <div className="border-t border-zinc-950/10 pt-3 dark:border-white/10">
              <p className="font-medium">Account changes</p>
              <p className="mt-2 text-zinc-500">Pause plan · Delete account</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-950/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-900">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">3 · hierarchy</p>
          <div className="mt-4 grid gap-4 text-sm">
            <div className="rounded-xl border border-zinc-950/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold">Pro plan</p>
                  <p className="mt-1 text-zinc-500">$29 · renews Aug 2</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800">active</span>
              </div>
            </div>
            <div className="rounded-xl border border-orange-500/30 bg-white p-4 dark:bg-zinc-950">
              <p className="font-medium">Payment method</p>
              <p className="mt-1 text-zinc-500">Visa ending 4242 · expires soon</p>
              <span className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-zinc-950 px-3 py-2 font-medium text-white dark:bg-white dark:text-zinc-950">
                Update card
              </span>
              <span className="ml-3 inline-block py-2 text-zinc-600 underline dark:text-zinc-300">Invoices</span>
            </div>
            <div className="border-t border-zinc-950/10 pt-4 dark:border-white/10">
              <p className="font-medium">Account changes</p>
              <span className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-zinc-950/15 px-3 py-2 dark:border-white/15">
                Pause plan
              </span>
              <span className="mt-2 block min-h-10 px-1 py-2 text-red-700 underline dark:text-red-400">
                Delete account
              </span>
            </div>
          </div>
        </section>
      </div>
    </Figure>
  );
}
