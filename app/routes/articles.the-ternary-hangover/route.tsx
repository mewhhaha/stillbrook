import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DiffReview, H2, Prose } from "../../components";

export const article = {
  title: "The ternary hangover",
  description:
    "AI writes nested ternaries without feeling their weight, leaving the reviewer to reconstruct control flow from punctuation.",
  published: "2026-07-11T16:47:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-ternary-hangover.jpg",
    alt: "A dense field of railway switches and crisscrossing tracks in front of Utrecht Centraal station, under a web of overhead wires.",
    credit: {
      author: "KlausMiniwolf",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:2014-10-02_13-02-44_RX100_4024_Utrecht-CS.JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const generatedConditional = `
  const badge =
    user == null
      ? "Sign in"
      : user.suspended
        ? "Suspended"
        : user.plan === "pro"
          ? user.trialEndsAt > now
            ? "Pro trial"
            : "Pro"
          : user.trialEndsAt > now
            ? "Trial"
            : "Free";
`;

const namedBranches = `
  function badgeFor(user: User | null, now: Date): Badge {
    if (!user) return "Sign in";
    if (user.suspended) return "Suspended";

    const trialActive = user.trialEndsAt > now;
    if (user.plan === "pro") {
      return trialActive ? "Pro trial" : "Pro";
    }

    return trialActive ? "Trial" : "Free";
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          The patch compiles, the tests are green, and the agent&apos;s summary says it simplified the
          conditional. Then you open the diff, and you spend the next thirty seconds counting question
          marks and matching each colon to the branch that owns it.
        </p>
        <CodeBlock
          lang="ts"
          title="Generated patch"
          highlight="4,6,8,10,13"
          code={generatedConditional}
        />
        <p>
          AI didn&apos;t invent the ternary; it removed the friction that used to keep the operator
          small. The machine types the puzzle in a second, and the decoding falls to whoever reviews
          the patch.
        </p>

        <H2>The author no longer pays</H2>
        <p>
          A flat ternary is fine. <code>disabled ? "muted" : "normal"</code> asks one boring question
          and returns one of two obvious values, which is exactly the three-part shape the{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator">
            JavaScript reference
          </a>{" "}
          describes. The reference also notes that the operator is right-associative, which is what
          makes chains like the one above legal in the first place.
        </p>
        <p>
          Writing a nested chain by hand makes you feel its weight: you have to remember which
          condition you&apos;re inside, where the false branch resumes, and whether the formatter has
          dragged the punctuation away from the thought it belongs to. That discomfort is what used to
          stop me after the first <code>?</code>. An agent never gets tired of colons — it can preserve
          the local expression, keep the diff small, satisfy the type checker, and hand you the whole
          decision tree as a string of question marks.
        </p>
        <p>
          None of this is a new complaint. The{" "}
          <a href="https://eslint.org/docs/latest/rules/no-nested-ternary">
            ESLint rule against nested ternaries
          </a>{" "}
          says plainly that nesting makes code harder to understand, and Prettier&apos;s{" "}
          <a href="https://prettier.io/blog/2023/11/13/curious-ternaries">
            history of ternary formatting
          </a>{" "}
          reads like a case file — years of experiments, a flat style that got proposed and then
          rejected, and steady pressure from users who wanted the branches legible. If a formatter
          needs a new visual grammar for one operator, the operator has already exceeded its useful
          range.
        </p>
        <DiffReview
          file="badge.ts"
          lines={[
            { type: "add", text: "const badge =" },
            { type: "add", text: '  user == null' },
            { type: "add", text: '    ? "Sign in"' },
            { type: "add", text: "    : user.suspended" },
            { type: "add", text: '      ? "Suspended"' },
            { type: "add", text: '      : user.plan === "pro"' },
            { type: "add", text: '        ? (user.trialEndsAt > now ? "Pro trial" : "Pro")' },
            { type: "add", text: '        : (user.trialEndsAt > now ? "Trial" : "Free");' },
          ]}
          comments={[
            { line: 2, author: "Reviewer", text: "Does the user exist?" },
            { line: 4, author: "Reviewer", text: "Is the account suspended?" },
            { line: 6, author: "Reviewer", text: "Is the plan Pro?" },
            { line: 7, author: "Reviewer", text: "Is the trial active?" },
            { line: 8, author: "Reviewer", text: "Which fallback applies?" },
          ]}
          caption="The patch adds one expression; the review has to ask five questions."
        />

        <H2>One ternary, one question</H2>
        <p>
          The replacement is longer because the program genuinely contains several decisions, and the
          compressed version was hiding all of them — along with their names — behind punctuation.
        </p>
        <CodeBlock lang="ts" title="Reviewed version" highlight="3,4,6,7,11" code={namedBranches} />
        <p>
          Now you can scan the exits, set a breakpoint on suspension, name the trial rule, add a case
          without rebalancing a tower of colons, and ask an agent to change one branch without inviting
          it to rewrite the whole expression. That&apos;s what the extra lines buy.
        </p>
        <p>
          Keep a ternary when both outcomes are short, unsurprising values and the condition carries
          no hidden policy. The moment a second question shows up, reach for an <code>if</code>, a{" "}
          <code>switch</code>, or a function with a name — and in JSX, extract the decision before the
          markup turns into a staircase.
        </p>
        <p>
          Code is cheap to write now, which is a reason to hold review to a higher standard, not a
          lower one. Let the model save keystrokes somewhere else; you&apos;re the one who&apos;ll be
          rereading this branch long after the chat window is gone.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
