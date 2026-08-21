import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, H2, MessageThread, Prose } from "../../components";

export const article = {
  title: "The mercy merge",
  description:
    "Pity merging substitutes sympathy for evidence, moving an exhausted pull request into main before its known defects have earned approval.",
  published: "2026-07-12T06:36:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/the-mercy-merge.jpg",
    alt: "Officials steady an exhausted Dorando Pietri as he crosses the finish line of the 1908 Olympic marathon in London.",
    credit: {
      author: "Unknown photographer",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Dorando_Pietri_1908b.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const closingComment = `
  Closing this pull request without merging.

  Blocker: membership changes can leave cached authorization active.
  Salvage: please reopen the parser tests and metrics as separate PRs;
           I will review both.
  Restart: a new cache PR needs an invalidation owner and a revoke-access test.
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          The authorization-cache pull request had been open for six weeks. Its author had rebased it
          repeatedly, answered dozens of comments, and added tests around everything except the branch I
          still distrusted: removing a member could leave their cached permission active. By the final review
          round, nobody was arguing that the defect had disappeared.
        </p>
        <p>
          The conversation had moved from the code to the ordeal. They had worked hard. The branch had become
          painful to maintain. Another redesign would feel cruel after all those comments. Why did the calendar
          get a vote? Pity merging begins when elapsed effort starts counting as evidence.
        </p>
        <p>
          I clicked approve late in the afternoon, and we merged with a promise to fix invalidation in a
          follow-up. Two days later, a removed project member could still open a report until the cache expired,
          so we reverted the whole change. A pull request is a proposal, not a timesheet. Review still has to
          answer whether this exact change improves the system.
        </p>

        <MessageThread
          messages={[
            {
              from: "Author",
              text: "Rebased again. I also folded the parser cleanup into this branch so we can finish it together.",
            },
            {
              from: "Reviewer",
              text: "The membership-removal path still has no cache invalidation owner.",
            },
            {
              from: "Maintainer",
              text: "This has been open for six weeks. Let’s merge and handle invalidation in a follow-up.",
            },
            {
              from: "Author",
              text: "Thank you. I can take that next.",
            },
          ]}
          caption="The invalidation defect remains open through the final review round, when the maintainer approves because the pull request is old."
        />

        <H2>The clock joins the review</H2>
        <p>
          A long pull request accumulates moral weight. Closing it can feel like deleting the author&apos;s work
          and admitting that several meetings produced no merge. A 2025 psychology paper calls a related
          pattern{" "}
          <a href="https://journals.sagepub.com/doi/10.1177/09567976251331053">
            doubling-back aversion
          </a>{": "}
          people avoid a more efficient route when taking it requires undoing visible progress and starting
          part of the journey again.
        </p>
        <p>
          I haven&apos;t measured how often that mechanism causes pity merges, and the name is mine. The fit is
          still uncomfortable. Splitting or redrafting an old pull request preserves much of the engineering,
          yet the review interface presents the decision as a retreat from a nearly full progress bar.
        </p>
        <p>
          Reviewers have sunk costs too. Every comment, pairing session, and defense of the chosen direction
          raises the emotional price of closing the work. Approval offers a clean story in which the effort led
          somewhere, while the codebase receives the unresolved question.
        </p>
        <p>
          Overdue reviews do benefit from intervention. Microsoft researchers built{" "}
          <a href="https://arxiv.org/abs/2011.12468">Nudge</a>, a system that identifies whether the author or
          reviewer is blocking progress and reminds that person to act. In a randomized trial, it reduced pull
          request resolution time by 60 percent. The intervention pushed the responsible person toward a real
          decision while leaving the acceptance standard alone.
        </p>

        <H2>Hope becomes a maintenance plan</H2>
        <p>
          Google&apos;s{" "}
          <a href="https://google.github.io/eng-practices/review/reviewer/standard.html">
            code review standard
          </a>{" "}
          asks for approval once a change definitely improves the overall health of the codebase, even when
          minor polish remains. The same page explicitly refuses to use that flexibility for changes that make
          code health worse outside an emergency. Its approval rule weighs design, progress, and code health
          without treating elapsed review time as evidence.
        </p>
        <p>
          Large, exhausted reviews make the distinction harder to see. Google&apos;s guide to{" "}
          <a href="https://google.github.io/eng-practices/review/developer/small-cls.html">
            small changes
          </a>{" "}
          warns that detailed comments get missed or dropped as authors and reviewers grow frustrated, and it
          gives reviewers discretion to reject a change solely because its size prevents a responsible review.
          At that point, another patch set can increase the diff without making the review understandable.
        </p>
        <p>
          Our cache pull request had collected parser tests, a metrics rename, and two unrelated cleanups while
          it waited. Those useful pieces made the defective cache feel harder to reject because closing the
          branch appeared to discard all of them together. We could have said this instead:
        </p>
        <CodeBlock lang="text" title="maintainer comment" code={closingComment} />
        <p>
          That comment gives the author a path forward and gives the reviewer a commitment to help. It also
          names the exact fact that blocks approval, so a future pull request starts with a smaller question
          instead of reopening the entire argument.
        </p>

        <H2>Give the person a clean exit</H2>
        <p>
          A humane review answers quickly, explains the blocker, and helps extract good commits while applying
          the same code-health criterion. When the blocker survives another review round, a maintainer can pair
          on the redesign, take responsibility for splitting mechanical changes, or write the closure comment
          before the thread turns into a waiting room.
        </p>
        <p>
          GitHub already has states for this. A pull request can be{" "}
          <a href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request">
            converted back to draft
          </a>{" "}
          while substantial feedback is addressed, which prevents merging until it becomes ready again. A
          maintainer may also{" "}
          <a href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/closing-a-pull-request">
            close the pull request without merging
          </a>{" "}
          when the proposed branch is no longer the right solution. The discussion and commits remain available,
          and the branch can stay until its useful pieces have been recovered.
        </p>
        <p>
          After the revert, I copied the parser tests into a small pull request and reviewed them separately.
          The cache was rewritten later with an explicit invalidation event. The original page still carries its
          green <em>Merged</em> badge, followed by the revert, and my approval sits four comments below the
          warning that described the bug.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
