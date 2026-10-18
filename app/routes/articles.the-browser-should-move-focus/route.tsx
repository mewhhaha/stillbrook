import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, CodeTabs, H2, Prose } from "../../components";

export const article = {
  title: "The browser should move focus",
  description:
    "Chrome 150 turns roving tabindex into a focusgroup primitive, putting arrow-key movement, tab-stop memory, and writing-mode rules where application code has been impersonating the browser.",
  published: "2026-08-08T06:50:00Z",
  author: "Mira Voss",
  tags: ["web", "software"],
  image: {
    src: "/images/articles/the-browser-should-move-focus-journal.webp",
    alt: "A hand moves a brass knob on a row of wooden shutters linked by a rail and gears.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const currentTabs = `
  const focusTab = (index: number) => {
    const next = (index + labels.length) % labels.length;
    setActive(next);
    document.getElementById(\`${"${id}"}-tab-${"${next}"}\`)?.focus();
  };

  <button
    role="tab"
    tabIndex={index === active ? 0 : -1}
    onKeyDown={(event) => {
      if (event.key === "ArrowRight") focusTab(index + 1);
      if (event.key === "ArrowLeft") focusTab(index - 1);
    }}
  />
`;

const focusgroupTabs = `
  <div focusgroup="tablist" aria-label="Alternatives">
    {labels.map((label, index) => (
      <button
        aria-selected={index === active}
        aria-controls={\`panel-${"${index}"}\`}
        onFocus={() => setActive(index)}
      >
        {label}
      </button>
    ))}
  </div>
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          This site has a tab component whose visible job is tiny: switch between two code samples. The
          interesting part lives underneath. It keeps one button in the page&apos;s tab order, listens for left and
          right arrows, wraps at both ends, changes the selected panel, and pushes DOM focus onto the next button.
          None of that has anything to do with code samples.
        </p>
        <p>
          The <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/">ARIA Authoring Practices tabs pattern</a>{" "}
          asks for exactly this shape because a tablist should be one stop in sequential keyboard navigation while
          arrow keys move inside it. For years, the answer has been roving <code>tabindex</code>: authors keep one
          child at <code>0</code>, put the rest at <code>-1</code>, and write the movement logic themselves. Chrome
          150 shipped <code>focusgroup</code>, a proposed HTML primitive that finally makes the browser volunteer for
          that part of the job.
        </p>

        <CodeTabs labels={["This site today", "The proposed primitive"]}>
          <CodeBlock lang="tsx" title="code-tabs.tsx" code={currentTabs} highlight="2-5,9-14" />
          <CodeBlock lang="tsx" title="focusgroup sketch" code={focusgroupTabs} highlight="1,5-7" />
        </CodeTabs>

        <p>
          There is a small joke in rendering that comparison with the component being criticized. Click the tabs
          above and the current JavaScript still does the movement. The proposed version only sketches the part{" "}
          <code>focusgroup</code> can own; selection and panel visibility remain application state.
        </p>

        <H2>The state machine was generic all along</H2>
        <p>
          W3C&apos;s <a href="https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/">keyboard-interface guidance</a>{" "}
          describes roving <code>tabindex</code> as a general focus-management strategy for composite controls.
          Toolbars, tablists, listboxes, and trees all end up solving the same plumbing problem before they can get
          to their own behavior. One child must be reachable by Tab. Directional input moves focus within the group.
          Re-entering the group should often return to the item that had focus before.
        </p>
        <p>
          The current <a href="https://open-ui.org/components/scoped-focusgroup.explainer/">Open UI focusgroup proposal</a>{" "}
          takes that common machinery seriously. A focusgroup supplies directional navigation, a guaranteed tab
          stop, last-focused memory, optional wrapping, and logical-axis control. It also accounts for hidden or
          disabled descendants and can follow the page&apos;s writing direction rather than assuming that right arrow
          always means “next.” That last detail is where hand-written handlers start to look faintly ridiculous.
        </p>
        <p>
          Look again at this site&apos;s handler. It maps <code>ArrowRight</code> to <code>index + 1</code> and{" "}
          <code>ArrowLeft</code> to <code>index - 1</code>. Fine for the current horizontal, left-to-right presentation.
          Change the writing mode or direction and the component still believes the keyboard was manufactured for
          one layout. Why should every tab implementation separately rediscover which physical key advances along a
          logical inline axis?
        </p>

        <H2>Movement is only half the widget</H2>
        <p>
          This proposal gets more interesting because it stops before taking over the domain state. Open UI is
          explicit that focusgroup handles focus navigation rather than selection. A formatting toolbar still owns
          whether Bold is pressed. A tab component still decides which panel is visible and updates{" "}
          <code>aria-selected</code>. The browser can move the cursor through the control while your component decides
          what focusing or activating an item means.
        </p>
        <p>
          That boundary fits the existing APG advice. Tabs may activate automatically when focus arrives if their
          panel can appear without noticeable delay, while slower interfaces can wait for Space or Enter. A browser
          primitive cannot know whether moving onto “Logs” should start an expensive fetch. The application can.
          Focusgroup removes the generic movement code without pretending that all composite widgets share one
          selection model.
        </p>
        <p>
          I like that restraint. The platform can sometimes own a whole native control. Here it only owns the boring
          substrate, and that narrower job is useful because trying to infer every tab, menu, tree, and toolbar action
          would make <code>focusgroup</code> mysterious exactly where products differ.
        </p>

        <H2>One engine is still one engine</H2>
        <p>
          <a href="https://developer.chrome.com/release-notes/150">Chrome 150</a> made focusgroup stable on June 30.
          Mozilla&apos;s <a href="https://github.com/mozilla/standards-positions/issues/1348">standards-position issue</a>{" "}
          is closed with a positive position, which is encouraging. WebKit&apos;s{" "}
          <a href="https://github.com/WebKit/standards-positions/issues/171">position issue</a> is still open and
          carries a device-independence concern: a web primitive framed around arrow keys can accidentally bake one
          hardware model into an interaction system used by keyboards, remotes, game controllers, assistive
          technology, and devices nobody in this discussion has on their desk.
        </p>
        <Callout variant="caution" title="Do not delete the fallback yet">
          <p>
            The Open UI explainer was still being revised on July 28, and Safari has not shipped the attribute.
            Firefox has expressed support for the direction but does not currently provide the Chrome 150 behavior.
            I cannot tell from WebKit&apos;s open issue when or whether Safari will implement it, so production
            components that need the pattern across engines still need their existing focus management or a carefully
            tested fallback.
          </p>
        </Callout>
        <p>
          That concern improves the proposal rather than weakening the case for it. The browser is the layer that
          actually knows the input modality, writing mode, sequential focus order, visibility state, and platform
          conventions. Application JavaScript sees an <code>event.key</code> string and starts guessing. If the web
          wants directional focus to work beyond the familiar desktop keyboard, moving the mechanism downward is the
          sensible direction.
        </p>
        <p>
          For now, <a href="https://github.com/mewhhaha/stillbrook/blob/main/app/components/code-tabs.tsx">
            <code>app/components/code-tabs.tsx</code>
          </a>{" "}
          still contains the modulo arithmetic, the changing <code>tabIndex</code>, and the two{" "}
          <code>event.key</code> checks. Chrome 150 can make most of those lines redundant. The other engines are why
          those lines are still in the file.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
