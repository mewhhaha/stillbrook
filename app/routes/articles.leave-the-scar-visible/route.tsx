import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  CodeTabs,
  FlowSequence,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Leave the scar visible",
  description:
    "Workarounds need angry comments, ugly names, and explicit exit conditions so later maintainers recognize debt instead of inheriting it as design.",
  published: "2026-07-11T21:58:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/leave-the-scar-visible.jpg",
    alt: "A sixteenth-century Korean tea bowl whose cracks have been repaired with seams of gold lacquer that stay plainly visible.",
    credit: {
      author: "Daderot",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:Tea_bowl,_Korea,_Joseon_dynasty,_16th_century_AD,_Mishima-hakeme_type,_buncheong_ware,_stoneware_with_white_engobe_and_translucent,_greenish-gray_glaze,_gold_lacquer_-_Ethnological_Museum,_Berlin_-_DSC02061.JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const polishedWorkaround = `
  // Normalize provider status for cancelled subscriptions.
  function normalizeSubscription(raw: ProviderSubscription) {
    if (raw.status === "active" && raw.cancelledAt) {
      return { ...raw, status: "cancelled" };
    }
    return raw;
  }
`;

const angryWorkaround = `
  // HACK PAY-2187: provider can report "active" for 15 minutes
  // after cancellation, so trusting it can charge a customer twice.
  // Keep this quarantine local. Delete it when webhook revision 3
  // reaches every account and the PAY-2187 replay passes without it.
  function quarantinePay2187Status(raw: ProviderSubscription) {
    if (raw.status === "active" && raw.cancelledAt) {
      return { ...raw, status: "cancelled" };
    }
    return raw;
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          In a billing service I maintained, a provider sometimes returned <code>active</code> for a
          subscription it had already cancelled. The workaround was six lines. My first comment began{" "}
          <code>// provider is lying here</code>, named the duplicate-charge risk, and linked the incident
          that proved it.
        </p>
        <p>
          During review I softened the sentence to <code>// normalize provider status</code> because the
          original sounded unprofessional. I thought I had removed heat without removing information.
          Months later, a second caller reused the helper. Then a third.
        </p>
        <p>
          The name <code>normalizeSubscription</code> made the function look like policy, while the polite
          comment omitted the fifteen-minute inconsistency that justified it. When I reopened the old
          diff, the sentence I had deleted explained the system faster than the abstraction we kept. Why
          did we make the lie sound respectable? We had polished the turd by improving its name while
          leaving the duplicate-charge path exactly where it was.
        </p>
        <p>
          Angry programming is not permission to abuse people. It is permission to leave the violated
          assumption visible. Aim the anger at an impossible state, a broken vendor contract, a timer
          nobody can remove yet, or a schema the team regrets. You can stay perfectly civil in the review
          thread while the comment says the provider lies.
        </p>
        <p>Here is the same workaround after two kinds of cleanup. The branch never changes.</p>
        <CodeTabs labels={["Polished", "Angry"]}>
          <CodeBlock lang="ts" title="subscription.ts" highlight="1-2" code={polishedWorkaround} />
          <CodeBlock lang="ts" title="subscription.ts" highlight="1-5" code={angryWorkaround} />
        </CodeTabs>
        <p>
          The first version sounds reusable. Its professional tone changes how the reader classifies the
          code, even though it supplies no cause, customer risk, containment boundary, or removal event.
          The second version makes those facts difficult to miss. A future maintainer can object to the
          implementation without first excavating the incident from version control.
        </p>

        <H2>Professional wording can lie</H2>
        <p>
          Google&apos;s official{" "}
          <a href="https://google.github.io/eng-practices/review/reviewer/looking-for.html#comments">
            code review guidance
          </a>{" "}
          says comments earn their place when they explain why code exists and carry reasoning the code
          cannot express. A tidy paraphrase of the branch fails that test. Anyone can read the condition
          already. The part the code cannot express is the provider&apos;s failure and the damage it can
          cause.
        </p>
        <p>
          Once that context disappears, the patch changes category in the next reader&apos;s head. A local
          exception begins to look like a supported rule, and ordinary refactoring spreads it farther from
          the boundary that made it necessary.
        </p>
        <FlowSequence
          steps={[
            {
              title: "An impossible state appears",
              detail: "The provider reports active after cancellation.",
            },
            {
              title: "The workaround gets polished",
              detail: "A generic name and polite comment make it look intentional.",
            },
            {
              title: "Another caller adopts it",
              detail: "A second import treats the exception as ordinary policy.",
            },
            {
              title: "Tests defend the accident",
              detail: "Removing the old patch now breaks behavior built on top of it.",
            },
          ]}
          caption="The same six-line workaround changes category as its original alarm is removed."
        />
        <p>
          Researchers call these explicit admissions{" "}
          <a href="https://arxiv.org/abs/2202.02387">self-admitted technical debt</a>. One study examined
          23.6 million code comments along with commit messages, issue sections, and pull-request sections
          across 103 open-source projects. Developers record suboptimal choices in all four places, which
          means a polished code comment can sever the closest explanation while the real confession drifts
          into a ticket nobody opens.
        </p>
        <p>
          A separate study found{" "}
          <a href="https://arxiv.org/abs/2203.15979">
            3,520 duplicate and near-duplicate debt comments
          </a>{" "}
          across five Apache projects, and many same-root-cause groups lived outside regular code clones.
          I read that as a warning rather than proof of this exact spiral: debt language travels, and it can
          separate from the precise code that originally earned it.
        </p>

        <H2>Good codebases admit embarrassment</H2>
        <p>
          Mature projects already leave blunt warnings in source when politeness would erase useful facts.
          A Linux <code>hidraw</code>{" "}
          <a href="https://github.com/torvalds/linux/blob/59dee6d28756c629f3a0bb56266f80e36ef7c99c/samples/hidraw/hid-example.c#L20-L28">
            sample labels a compatibility block an “ugly hack”
          </a>{" "}
          for systems with stale userspace headers. The block also emits a compile-time warning telling
          distributors what to update. Its embarrassment points directly at the dependency and gives an
          operator somewhere to act.
        </p>
        <p>
          CPython keeps a different kind of honesty in its email generator. An{" "}
          <a href="https://github.com/python/cpython/blob/bbd1f2f9e0354f91c5d3c4eb3eb53657265dcc77/Lib/email/generator.py#L163-L167">
            <code>XXX</code> comment admits that logic and tests disagree
          </a>
          : an <code>else</code> seems necessary, yet the tests fail when it exists and pass when it does
          not. Rewriting that as “avoid duplicate newline” would invent a confident causal story the author
          did not have.
        </p>
        <p>
          Both comments look embarrassing on purpose, and both preserve a causal edge for the next
          investigation — stale headers in one case, behavior its own author could not explain in the
          other. Nobody reading them has to pretend the workaround arrived through deliberate architecture.
        </p>

        <H2>Anger needs an address</H2>
        <p>
          I haven&apos;t measured whether profanity makes a workaround disappear faster, and I doubt the swear
          word does useful work by itself. <code>// FIXME this garbage</code> gives no owner, cause, scope,
          or way out. The next person learns only that someone was upset.
        </p>
        <p>
          Google&apos;s{" "}
          <a href="https://google.github.io/styleguide/cppguide.html#TODO_Comments">
            guidance for TODO comments
          </a>{" "}
          asks for a bug reference or responsible person and, where possible, the event that will make the
          TODO removable. An angry comment can do better by carrying four coordinates:
        </p>
        <ul>
          <li>
            <strong>Broken assumption:</strong> webhook revision 2 reports active after cancellation.
          </li>
          <li>
            <strong>Consequence:</strong> billing may charge the same customer twice.
          </li>
          <li>
            <strong>Containment:</strong> only the provider adapter may rewrite this status.
          </li>
          <li>
            <strong>Exit:</strong> delete the branch after revision 3 ships and the replay passes.
          </li>
        </ul>
        <p>
          Once those facts exist, blunt language helps the reader classify the code. Keep the incident and
          removal condition beside the branch so the workaround remains visibly abnormal. Research on{" "}
          <a href="https://arxiv.org/abs/2009.13113">on-hold self-admitted debt</a>{" "}
          makes the exit condition operational: comments linked to external issues can be revisited when
          those issues close instead of waiting for somebody to remember the original compromise.
        </p>

        <H2>Make the code complain too</H2>
        <p>
          A comment can be ignored, so angry programming moves the alarm into structure. Keep the workaround
          in the provider adapter, call it <code>quarantinePay2187Status</code>, increment a metric whenever
          it fires, and give the regression test the incident number. Exporting a generic{" "}
          <code>normalizeSubscription</code> helper would invite unrelated callers to depend on an accident.
        </p>
        <p>
          The metric tells you whether the external failure still occurs. The import boundary keeps the
          patch from becoming a utility, while the test records the customer outcome rather than blessing
          every incidental line. If someone later proposes a shared normalizer, the ugly function name
          forces the review to reopen PAY-2187 before the exception spreads.
        </p>
        <p>
          This is also why formatting cannot redeem the wrong abstraction. The Linux kernel&apos;s{" "}
          <a href="https://docs.kernel.org/process/coding-style.html#commenting">commenting guidance</a>{" "}
          explicitly allows warnings about clever or ugly code and cautions that source-formatting tools do
          not fix bad programming. The patch underneath still has to be small and tested. What stays loud
          is the comment sitting on top of it.
        </p>
        <p>
          After webhook revision 3 reaches every account, the next developer opens{" "}
          <code>subscription.ts</code>. The metric beside <code>quarantinePay2187Status</code> has read zero
          for a week, and the linked incident is closed. They delete twelve ugly lines, run the replay, and
          the test still passes.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
