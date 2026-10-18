import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Make the code a little uwu",
  description:
    "AI reviewers can find real bugs and still need a better second question. Build the adversarial pass into the skill, then leave some room for cute, slightly embarrassing taste.",
  published: "2026-10-18T00:17:00Z",
  author: "Still Brook",
  tags: ["software", "ai"],
  image: {
    src: "/images/articles/make-the-code-a-little-uwu-journal.webp",
    alt: "A tabby kitten with a terracotta ribbon inspects a brass gear through a magnifying lens beside a watchmaker's bench.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const reviewSkill = `
  ---
  name: review-change
  description: Review a proposed code change for actionable defects.
  ---
  Read the requested behavior, diff, and repository instructions.
  Trace changed assumptions through callers and relevant tests.
  Make a second, adversarial pass:
  find a concrete input, event order, or failure that breaks the change.
  Try to disprove each candidate finding using the surrounding code.
  Run a focused reproduction when the environment permits it.
  Report the location, trigger, consequence, and supporting evidence.
  Distinguish introduced defects from pre-existing issues.
  Deduplicate findings. Separate taste suggestions from defects.
  State what was not checked. No findings is a valid result.
`;

const tastePrompt = `
  Make the code quality a little uwu.
  Small, direct, easy to hold in my head.
  Look for an abstraction we can delete or a state we can stop tracking.
  Keep the behavior and the useful names.
  Show the smallest worthwhile change and how to check it.
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="7 min read">
      <Prose>
        <p>
          The part of AI code review that bothers me is how often the useful second pass begins
          with two words: be adversarial. The first review can look reasonable. Then I ask the
          agent to push against the implementation, and it starts finding assumptions it had
          previously walked past.
        </p>
        <p>
          I take that as a workflow problem. If that is the question I keep asking, it belongs
          in the review skill. Remembering to be more demanding after every pleasant first
          answer is a silly job to keep for myself.
        </p>

        <H2>The vendors have noticed the review problem too</H2>
        <p>
          OpenAI&apos;s December 2025 article,{" "}
          <a href="https://alignment.openai.com/scaling-code-verification/">
            A Practical Approach to Verifying Code at Scale
          </a>, describes a reviewer trained for that job, with repository access and code
          execution. Its priorities include keeping false alarms low enough that developers
          continue reading the comments. The post reports that 52.7% of reviewer comments led
          authors to change code. That measures a response to comments; it does not tell us
          what fraction of all bugs the reviewer found.
        </p>
        <p>
          Anthropic&apos;s March 2026{" "}
          <a href="https://claude.com/resources/articles/code-review">Code Review announcement</a>{" "}
          describes agents finding potential bugs, verifying them, and ranking what remains.
          It reports an internal rise from 16% to 54% of pull requests receiving substantive
          review comments. The article supplies no sample size or enough methodology to turn
          that into a general estimate of review accuracy.
        </p>
        <p>
          Those are different measurements, so I would not put them in a vendor leaderboard.
          They do make review worth taking seriously. The useful common idea is that producing
          a suspicion and establishing a defect are separate pieces of work.
        </p>
        <p>
          Tool access also matters. Anthropic&apos;s current{" "}
          <a href="https://code.claude.com/docs/en/code-review">managed-review documentation</a>{" "}
          says its reviews do not build or run the code. A local review skill with an executable
          checkout can attempt a reproduction. The product name alone tells me less than knowing
          what the reviewer actually inspected and checked.
        </p>

        <H2>Give the adversary something to do</H2>
        <p>
          A request to be harsher can produce more objections. I want a better search instead.
          Ask for the input that violates an assumption, the event order that exposes stale
          state, or the failure path that leaves a resource alive. Then make the reviewer try
          to defeat its own finding.
        </p>
        <p>
          Suppose a cache key drops a configuration field. A useful review traces two calls
          with different configurations to the same key and shows why their results can differ.
          It should also check whether an earlier layer already separates those calls. That
          last check can turn an alarming comment into a discarded hypothesis, which is a
          perfectly good outcome.
        </p>
        <FlowSequence
          steps={[
            { title: "Understand", detail: "Recover the intended behavior and its constraints." },
            { title: "Challenge", detail: "Construct a concrete way the change could fail." },
            { title: "Verify", detail: "Check the surrounding code and try a reproduction." },
            { title: "Report", detail: "Keep distinct findings supported by evidence." },
          ]}
          caption="A proposed review procedure. A candidate can disappear during verification; the process does not require a quota of bugs."
        />
        <p>
          A fresh reviewer can help change perspective. Give it the diff, the task, and the
          relevant repository context. Let it form its own explanation before handing it the
          author&apos;s reassuring summary. I would use that separation to loosen the influence
          of the author&apos;s explanation. Two agents can still overlook the same thing.
        </p>

        <H2>Put the procedure in the skill</H2>
        <p>
          I would keep the main skill short enough to read. OpenAI&apos;s{" "}
          <a href="https://learn.chatgpt.com/docs/build-skills">skill documentation</a>{" "}
          explains that the name and description help select a skill, while the full instructions
          load when it is used. A clear trigger matters as much as an impressive checklist
          hidden underneath it.
        </p>
        <CodeBlock lang="text" title="A small review SKILL.md to adapt" code={reviewSkill} />
        <p>
          The repository can supply the details this template lacks: important invariants, the
          command for a focused test, and examples of defects worth reporting. An ownership
          rule needs its actual lifetime boundary. A compatibility rule needs the supported
          versions. A wall of instructions to consider every possible concern gives the reviewer
          much less direction.
        </p>
        <p>
          I would evaluate the skill on old changes with known bugs and on clean changes that
          resemble them. Keep the model, tools, and budget comparable. Count confirmed defects,
          false alarms, time spent verifying comments, and bugs discovered after the review.
          Anthropic&apos;s{" "}
          <a href="https://code.claude.com/docs/en/skills#evaluate-and-iterate-on-a-skill">
            skill guidance
          </a>{" "}
          also recommends fresh-session comparisons with the skill available and disabled.
          The skill needs to improve the work, including when it should stay out of the way.
        </p>
        <p>
          My answer to how much you should care is: enough to make a useful review routine and
          measure its value. Spend more attention on changes to ownership, persistence, and
          cross-module assumptions. Keep the budget small for a small, easily checked edit.
          An empty report means the reviewer found nothing it could substantiate within that
          pass. The tests and the engineering judgment still have work to do.
        </p>

        <H2>Then there is the uwu factor</H2>
        <p>
          My less respectable prompting observation is that <em>uwu</em>, placed near the words{" "}
          <em>code quality</em>, works mysteriously well. I mean that as an observation about my
          own prompts and taste. I do not have a controlled result showing that the word improves
          code or finds more bugs.
        </p>
        <p>
          Still, I like what it asks for. Small. Approachable. A little embarrassing to make grand
          claims about. When I ask for elegant code, I sometimes get an architecture that wants
          me to admire it. A cute solution can be a plain loop that fits on the screen and knows
          when to stop.
        </p>
        <p>
          My guess is that an odd word can loosen the usual associations around a request.
          The practical move is to attach it to concrete preferences so the result has
          something to answer to.
        </p>
        <CodeBlock lang="text" title="An optional taste pass after checking behavior" code={tastePrompt} />
        <p>
          A taste pass should earn its diff. Show the state that disappears, the call chain that
          becomes shorter, or the name that makes the operation clear. Preserve the useful test
          and check the behavior again after changing the implementation. Adding baby talk to
          comments is unlikely to help any of this.
        </p>
        <p>
          I would keep these questions distinct in the output: what can break, and what could
          become easier to understand? The first needs a failure case. The second needs a
          convincing before and after. Calling both of them critical findings would make the
          review harder to trust.
        </p>
        <p>
          Maybe code should be allowed to be cute and a little cringe. A small function with
          obvious data flow can survive that indignity. I still want the adversarial reviewer
          to check whether it works.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
