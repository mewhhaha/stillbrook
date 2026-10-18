import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, Divider, FeedbackLoop, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "“Make no mistakes” is not a method",
  description:
    "Telling people to make no mistakes hides the evidence a reliable system runs on; a process built to catch and repair a mistake gets closer to zero than the demand ever does.",
  published: "2026-07-11T16:54:37Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/no-mistakes-is-not-a-method-journal.webp",
    alt: "A cutting machine holds a metal workpiece while a hand hovers above its stop button.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          “Make no mistakes” sounds exacting. Ask what anyone should do differently and the sentence goes
          quiet.
        </p>
        <blockquote>
          <p>Make no mistakes.</p>
        </blockquote>
        <p>
          It names an outcome, hands every bit of uncertainty to whoever&apos;s listening, and says nothing
          about how anyone detects a problem or recovers from one. As an instruction, there&apos;s no work in
          it.
        </p>
        <p>
          It does change one thing, though: the first mistake now comes with a second decision. You can
          expose it and become the person who broke the rule, or you can smooth the surface and keep
          looking compliant. Owning up starts to feel like confession.
        </p>

        <H2>The clean report is the dangerous one</H2>
        <p>
          People stop producing the information you punish them for. Amy Edmondson&apos;s{" "}
          <a href="https://doi.org/10.2307/2666999">study of 51 work teams</a>{" "}
          found that psychological safety went together with learning behavior — asking for help,
          admitting uncertainty, talking about failure — which in turn was linked to team performance.
          Asking for help, it turns out, is part of how a team gets good.
        </p>
        <p>
          Aviation went ahead and built this into a channel. NASA&apos;s{" "}
          <a href="https://asrs.arc.nasa.gov/overview/confidentiality.html">
            Aviation Safety Reporting System
          </a>{" "}
          accepts voluntary reports from people who saw or took part in a safety incident, strips the
          identifying details, and protects the reports from ordinary enforcement use — the FAA can even
          waive penalties in qualifying cases where the violation was unintentional. The whole arrangement
          exists to get the evidence in hand before the same conditions produce something worse.
        </p>
        <p>
          A threatening rule will probably lower the number of mistakes reported to you. Whether the work
          improved is a different question, and the rule can&apos;t answer it. A mistake you can see is an
          event; a mistake that has to be hidden becomes infrastructure.
        </p>

        <H2>Stop the line before defending the number</H2>
        <p>
          Toyota doesn&apos;t wait for a finished car to reveal whether every earlier step behaved. Under{" "}
          <a href="https://global.toyota/en/company/vision-and-philosophy/production-system/">
            jidoka
          </a>
          , equipment stops automatically when it detects an abnormality, and an operator can stop the
          whole line when the work drifts from what they expect. The defect never moves downstream, and
          the stop opens a chance to keep it from happening again.
        </p>
        <p>
          A manager obsessed with uninterrupted output sees a stopped line and asks who slowed production.
          But the interruption is the quality system doing its job, and the better question is which
          condition got caught before three more stations added cost to it.
        </p>
        <p>
          “Make no mistakes” puts quality at the end of the process, where someone inspects the result and
          assigns fault. Jidoka puts it inside the process, next to the person and machine who can notice
          the first abnormal signal. A line run this way can look worse for a while, since its problems
          become visible — but the problems were there either way.
        </p>

        <Callout variant="caution" title="Zero still matters">
          <p>
            Some outcomes really do deserve a target of zero: exposed private data, an irreversible
            deletion, the wrong medication. Spend that target on interlocks, independent checks, staged
            changes, and a rollback you&apos;ve actually tested — not on a louder version of the same
            empty instruction.
          </p>
        </Callout>

        <H2>Turn error into a control signal</H2>
        <p>
          Software teams meet the same temptation through availability, where one hundred percent sounds
          like the only serious goal. Google&apos;s{" "}
          <a href="https://sre.google/sre-book/embracing-risk/">site reliability guidance</a>{" "}
          argues that extreme reliability can cost more than users get out of it and crowds out useful
          change, so teams set a service objective and make the remaining tolerance explicit as an error
          budget.
        </p>
        <p>
          An error budget sounds like permission to be careless. In Google&apos;s{" "}
          <a href="https://sre.google/workbook/error-budget-policy/">
            example error-budget policy
          </a>{" "}
          it works the other way around: failing too much changes what the team is allowed to do next.
        </p>
        <FeedbackLoop
          caption="The error-budget policy as a loop."
          returnLabel="the budget recovers"
          steps={[
            { title: "The service spends its budget" },
            { title: "Overspend freezes nonessential releases" },
            { title: "Work turns toward reliability" },
          ]}
        />
        <p>
          The response should also depend on what failed. A missing profile image and leaked private
          contacts both count as unsuccessful requests, and they are nowhere near the same problem. You
          have to decide which harms actually matter and build your detection and recovery around those; a
          single green percentage won&apos;t do that thinking for you.
        </p>
        <p>
          After an incident, Google&apos;s{" "}
          <a href="https://sre.google/sre-book/postmortem-culture/">
            postmortem guidance
          </a>{" "}
          looks for contributing conditions and preventive actions rather than a culprit. The more
          detailed{" "}
          <a href="https://sre.google/workbook/postmortem-culture/">workbook case study</a>{" "}
          rejects “train humans not to run unsafe commands” as a corrective action, on the grounds that
          changing the automated systems is more dependable than hoping the next operator never repeats
          the move. Hard to argue with — and I still catch myself writing “be more careful” into
          follow-ups anyway.
        </p>
        <p>
          Accountability doesn&apos;t go anywhere in all this. The operator still has to stop, disclose
          what happened, and repair it, and the organization has to make those actions survivable — then
          remove the trap that required heroics in the first place. Asking who touched the system last
          tells you much less than asking why one ordinary action could travel so far.
        </p>

        <Divider />

        <H2>Design the second action</H2>
        <p>
          Before the work begins, decide what happens when reality departs from the plan. The response needs
          an owned path from the first abnormal signal to a changed system.
        </p>
        <FlowSequence
          caption="A caught mistake becomes useful only when the response reaches a system change."
          steps={[
            { title: "Expose the deviation", detail: "Make the abnormal signal visible" },
            { title: "Stop and contain", detail: "Limit how far the harm can travel" },
            { title: "Preserve the evidence", detail: "Keep the conditions needed to explain it" },
            { title: "Repair the trap", detail: "Change what made repetition easy" },
          ]}
        />
        <p>
          The higher the consequence, the less any one person&apos;s perfect attention should stand between
          normal work and disaster. Protecting the reporting path and assigning the repair are part of the
          mechanism too. Without them, the sequence ends with a well-documented recurrence.
        </p>
        <p>
          The red emergency-stop button at the top of this page sits on a CNC control panel. Its designers
          gave an abnormal moment a dedicated action the operator can take, then built the machine to stop
          when they do.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
