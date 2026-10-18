import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, DataTable, DiffReview, H2, Prose } from "../../components";

export const article = {
  title: "Advice after the warning",
  description:
    "Accessibility guidance becomes useful when reviewers separate requirements from design judgment and leave developers with a next action instead of a vague veto.",
  published: "2026-07-11T20:45:00Z",
  author: "Mira Voss",
  tags: ["web", "craft"],
  image: {
    src: "/images/articles/advice-after-the-warning-journal.webp",
    alt: "Two hands review a wooden task board with blank cards, triangular navigation buttons, and a red button.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const reviewLines = [
  { type: "ctx", text: "return (" },
  {
    type: "add",
    text: "  <SortableBoard columns={columns} onMove={moveCard} />",
  },
  { type: "ctx", text: ");" },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          Last Tuesday I reviewed a sortable task board and left the comment below. I had spotted a real
          problem: the new interaction assumed a pointer, while the cards exposed no other way to move.
          Then I typed a question mark and handed the problem back.
        </p>
        <p>
          Every word was defensible. The author still had to guess whether I wanted arrow keys, buttons,
          announcements, a different widget, or the whole feature removed. My concern arrived in the
          review; my help did not.
        </p>
        <DiffReview
          file="board.tsx"
          lines={reviewLines}
          comments={[
            {
              line: 2,
              author: "Reviewer",
              text: "Accessibility? Drag and drop can be difficult for screen reader users and keyboard users.",
            },
          ]}
          caption="The warning identifies risk and leaves the implementation question untouched."
        />
        <p>
          Fine. What is the author supposed to do with that? I cannot measure how much vague advice comes
          from fear of giving the wrong answer, but I recognize the feeling because I had it while writing
          this comment. Accessibility covers standards, browser behavior, assistive technology, disability,
          language, and individual preference. A concrete recommendation can be checked against any of them
          and found wrong, which is exactly why the question mark felt safer.
        </p>
        <p>
          So reviewers retreat to warnings. Teams hear that accessibility matters, receive little help
          choosing an implementation, and infer two safe options: build the familiar thing exactly as it has
          been built before, or find an expert who can bless every decision. That bargain protects the advice
          giver and leaves the person doing the work alone with the hard part.
        </p>

        <H2>The spec has more than one voice</H2>
        <p>
          People often describe accessibility as subjective because they mix several kinds of claim into one
          pile. The <a href="https://www.w3.org/TR/WCAG22/">Web Content Accessibility Guidelines 2.2</a> does
          the opposite. Its principles and guidelines are broad; the success criteria are written as testable
          requirements for conformance; techniques and common failures remain informative because context
          changes which implementation fits.
        </p>
        <p>
          That layering gives a reviewer somewhere firm to stand. <a href="https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html">WCAG&apos;s keyboard criterion</a> says that functionality must be operable through a keyboard interface, apart from tasks whose result depends on a path drawn by the user. The same guidance explicitly allows pointer input alongside the keyboard path. Nobody has to flatten a drag board into a list of plain links to satisfy it.
        </p>
        <p>
          Dragging has its own requirement. <a href="https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html">WCAG 2.5.7</a> asks authors to provide a single-pointer alternative that does not require dragging, unless dragging is essential. Its examples keep the interesting interface and add controls: move-up and move-down buttons for a sortable list, a menu for moving a task between columns, or arrow buttons on a kanban card.
        </p>
        <p>
          Custom widgets carry another concrete contract. The <a href="https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/">ARIA Authoring Practices Guide</a> calls a role a promise: adding <code>role=&quot;button&quot;</code> tells assistive technology what the element is, while the author still has to provide the keyboard behavior a native button gets from the browser.
        </p>
        <p>
          Those are actionable statements. Other questions stay contextual. Should moving a card announce its
          new position after every key press? Does selection follow focus in this composite widget, or would
          that trigger slow network work and make navigation miserable? The APG&apos;s <a href="https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/">keyboard guidance</a> says that selection following focus can help or harm depending on how quickly the interface responds. Reviewers have to mark which part they know and which part still needs evidence.
        </p>

        <H2>Label the kind of advice</H2>
        <p>
          I now try to name what sort of claim I am making before I write the comment. Four labels cover most
          of the conversations I see, and they change what the author should do next.
        </p>
        <DataTable
          head={["Kind", "Example", "What the review asks for"]}
          rows={[
            [
              "Requirement",
              "Every board action has a keyboard path",
              "Block the change until the contract is met",
            ],
            [
              "Pattern",
              "Arrow keys move among options in a composite widget",
              "Use the convention or explain why this interface differs",
            ],
            [
              "Compatibility risk",
              "A live-region update may be repeated by one browser and screen reader pairing",
              "Test the combinations the product supports",
            ],
            [
              "Usability hypothesis",
              "Announcing column and position after each move may help orientation",
              "Prototype it with users and record what happened",
            ],
          ]}
          caption="A reviewer can be uncertain without making every sentence equally uncertain."
        />
        <p>
          The labels prevent a preference from dressing up as law. They also stop a clear requirement from
          dissolving into &ldquo;consider accessibility.&rdquo; An author who hears <em>requirement</em> knows
          the merge is blocked. Name a compatibility risk instead and the response is a test plan, while a
          hypothesis gets a prototype rather than a citation duel.
        </p>
        <p>
          I went back to the task-board thread after lunch and replaced my question with this:
        </p>
        <blockquote>
          <p>
            Keep dragging. Please add Move left and Move right controls that work by click and keyboard, then
            preserve focus on the card after it moves. WCAG 2.5.7 covers the non-drag pointer path and 2.1.1
            covers keyboard operation. I am less certain about the announcement: try column name plus position
            with the screen readers we support, because repeating the full card may be noisy.
          </p>
        </blockquote>
        <p>
          The revised comment is longer because it separates the parts that my question mark had collapsed.
        </p>
        <Compare
          attributes={["Risk", "Authority", "Next action", "Uncertainty"]}
          entities={[
            {
              name: "The warning",
              values: [
                "Drag and drop may exclude keyboard and screen-reader users",
                "An unattributed accessibility concern",
                "The author has to invent one",
                "Hidden behind a question mark",
              ],
            },
            {
              name: "The revised review",
              values: [
                "Keyboard operation and a non-drag pointer path are missing",
                "WCAG 2.1.1 and 2.5.7, plus reviewer judgment",
                "Add move controls, preserve focus, and test the announcement",
                "The announcement wording remains a testable question",
              ],
            },
          ]}
          caption="The useful review exposes which claims are requirements, which are judgment, and what the author can try next."
        />
        <p>
          It could still be wrong at the edges. The author can now see which uncertainty belongs to which
          part of the feature and has a patch to attempt before the next review.
        </p>

        <H2>Judgment still deserves a sentence</H2>
        <p>
          Some accessibility choices resist a universal answer because meaning depends on context. Alternative
          text is the familiar example. An image of a flooded street may be evidence in a news report,
          atmosphere on a travel page, or redundant beside a caption that already names the location and
          damage. The surrounding page gives the same image a different job in each case.
        </p>
        <p>
          W3C&apos;s <a href="https://www.w3.org/WAI/test-evaluate/preliminary/">Easy Checks</a> separates the easy
          machine question from the harder human one. A tool can report that an image lacks an <code>alt</code>{" "}
          attribute. Deciding whether the supplied text communicates the image&apos;s purpose takes context, and
          the guidance says appropriate alt text is not an exact science.
        </p>
        <p>
          &ldquo;It depends&rdquo; can begin useful advice, provided the next sentence says what it depends on.
          Propose the wording and name the user task it supports; then explain which detail you left out and
          why. A reviewer does not need universal authority to say, &ldquo;On this product page, the color is
          part of the purchase decision, so include it in the description.&rdquo;
        </p>
        <p>
          User research helps with questions the criteria cannot settle, though it does not turn one
          participant into the representative of every disabled person. W3C&apos;s guidance on <a href="https://www.w3.org/WAI/test-evaluate/involving-users/">involving users in accessibility evaluation</a> recommends bringing disabled users into development early, then stating the scope of what was evaluated. A small session can reveal a barrier, but it will not certify the entire interface for everyone.
        </p>

        <H2>Make expertise a service</H2>
        <p>
          Accessibility does require specialist knowledge. So do security, databases, localization, and
          distributed systems; teams still let ordinary developers change code in those areas because they
          build review paths, defaults, tests, and escalation points. Requiring personal mastery before anyone
          tries a new interaction guarantees that most teams will reuse whatever component happens to be
          nearby, accessible or otherwise.
        </p>
        <p>
          W3C&apos;s guidance on <a href="https://www.w3.org/WAI/test-evaluate/combined-expertise/">combined expertise</a> expects a group to cover web technology, evaluation tools, disability barriers, assistive technology, and standards because one evaluator rarely carries all of it. That model gives specialists better work. They maintain patterns, teach reviewers what evidence means, join risky design work early, and take the cases whose consequences justify deeper testing.
        </p>
        <p>
          A team can give every novel component a small baseline contract before escalation enters the
          conversation:
        </p>
        <ul>
          <li>Every action remains reachable and operable without the primary pointer gesture.</li>
          <li>Name, role, state, and value are available to assistive technology.</li>
          <li>Focus has a deliberate location before, during, and after the interaction.</li>
          <li>The team records which browser and assistive-technology combinations it actually tested.</li>
        </ul>
        <p>
          Passing that baseline makes the discussion smaller without proving that the design works well. The
          specialist can spend time on orientation, cognitive load, speech verbosity, and unfamiliar gesture
          models instead of discovering that the only clickable object is a <code>div</code> with no key
          handler.
        </p>
        <p>
          Some ideas will still fail when disabled users try them. Others will need a second interface rather
          than a clever adaptation of the first. I know of no process that removes that risk while preserving
          experimentation, though a team can expose its assumptions early and repair what the testing reveals.
        </p>

        <H2>Leave a next action</H2>
        <p>
          A helpful accessibility review says what may break for whom, how confident the reviewer is, which
          requirement or convention applies, and what change would make the next test worth running. Those four
          pieces take longer to write than a question mark, and they spare the author from
          reverse-engineering what the reviewer was afraid of.
        </p>
        <p>
          At 4:18 I reopened the task-board thread one last time. The author had added two small move buttons,
          and keyboard focus stayed on the card as it crossed into the next column. I pressed the right-arrow
          control, listened to the screen reader announce the new position twice, and left a comment about the
          duplicate speech. This time the cursor was already sitting after a sentence someone could act on.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
