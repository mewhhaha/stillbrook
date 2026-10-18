import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, DiffReview, H2, Prose } from "../../components";

export const article = {
  title: "The textarea can measure itself",
  description:
    "Firefox 152 closes the last major-browser gap for CSS field-sizing, so ordinary textarea autosize handlers can give layout back to the browser.",
  published: "2026-08-06T06:50:00Z",
  author: "Mira Voss",
  tags: ["web", "software"],
  image: {
    src: "/images/articles/the-textarea-can-measure-itself-journal.webp",
    alt: "A brass pen mechanism feeds out a long illustrated paper sheet beside a folded ruler and miniature workshops.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const boundedField = `
  .composer {
    inline-size: 100%;
    field-sizing: content;
    min-block-size: 3lh;
    max-block-size: 12lh;
    overflow-y: auto;
    resize: vertical;
  }
`;

const fieldNotes = [
  {
    line: 2,
    note: "A fixed inline size lets wrapping decide how many lines the field needs.",
  },
  {
    line: 3,
    note: "The browser derives the intrinsic block size from the current contents instead of the default textarea size.",
  },
  {
    line: 4,
    note: "An empty composer keeps enough room to look and behave like an input rather than a caret in a border.",
  },
  {
    line: 5,
    note: "After twelve line boxes, a long draft stops growing and begins to scroll.",
  },
  {
    line: 7,
    note: "The user keeps the native vertical resize handle when the automatic answer is uncomfortable.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Open an auto-growing composer and there is a good chance its input handler performs a tiny
          ritual: erase the textarea&apos;s inline height, read <code>scrollHeight</code>, then write the
          answer back in pixels. Every keystroke asks JavaScript to make layout report a fact that CSS
          ought to know already.
        </p>
        <p>
          <a href="https://www.firefox.com/en-US/firefox/152.0/releasenotes/">Firefox 152</a>, released
          June 16, added <code>field-sizing</code>. That closes the last major-engine gap after Chrome
          and Safari. The useful consequence is almost comically small: a common hook can become one
          declaration.
        </p>
        <DiffReview
          file="composer.ts"
          lines={[
            { type: "del", text: 'const field = document.querySelector("textarea")!;' },
            { type: "del", text: "const resize = () => {" },
            { type: "del", text: '  field.style.height = "0";' },
            { type: "del", text: '  field.style.height = `${field.scrollHeight}px`;' },
            { type: "del", text: "};" },
            { type: "del", text: 'field.addEventListener("input", resize);' },
            { type: "del", text: "resize();" },
            { type: "add", text: "textarea {" },
            { type: "add", text: "  field-sizing: content;" },
            { type: "add", text: "}" },
          ]}
          comments={[
            {
              line: 3,
              author: "Review",
              text: "Clear the previous answer so the field can shrink as well as grow.",
            },
            {
              line: 4,
              author: "Review",
              text: "Read layout after changing style, then copy the measured pixels back into style.",
            },
            {
              line: 6,
              author: "Review",
              text: "Input is one trigger. Resets, programmatic values, fonts, and width changes need their own path.",
            },
            {
              line: 9,
              author: "Review",
              text: "Let intrinsic sizing respond whenever layout or content changes.",
            },
          ]}
          caption="The deleted handler mutates height, reads the resulting layout, and stores the measurement as another inline height."
        />

        <H2>The hook was chasing layout</H2>
        <p>
          The old pattern is old enough to have its own fossil record. A 2017
          <a href="https://github.com/w3c/csswg-drafts/issues/1771"> CSS Working Group issue</a>{" "}
          calls JavaScript autosizing tricky because scrollbars disturb the calculation, and one comment
          supplies the familiar workaround: assign <code>inherit</code>, read <code>scrollHeight</code>,
          append <code>px</code>. The group resolved that November to add content sizing for textareas.
        </p>
        <p>
          A robust hook has to notice more than typing. Change the field&apos;s width and the same sentence
          wraps onto new lines. Load a different font, restore a form, replace the value from application
          state, alter padding, or let placeholder text use larger metrics, and the required height moves
          without an <code>input</code> event. Why was the application measuring its own box after every
          letter?
        </p>
        <p>
          The current
          <a href="https://drafts.csswg.org/css-forms/#field-sizing-property"> CSS Forms specification</a>{" "}
          gives the browser the rule directly: <code>fixed</code> keeps the host language&apos;s default preferred
          size, and <code>content</code> makes the user agent derive intrinsic size from whatever is in the box.
          The text wraps, the field grows. Nothing is left for application code to keep synchronized.
        </p>

        <H2>Content still needs fences</H2>
        <p>
          Pure content sizing can turn an empty field into a tiny target and a long draft into the whole
          viewport. Chrome&apos;s
          <a href="https://developer.chrome.com/docs/css-ui/css-field-sizing"> implementation guide</a>{" "}
          warns about both ends, so the useful rule includes boundaries rather than pretending one property
          finished the component:
        </p>
        <AnnotatedCode
          lang="css"
          title="composer.css"
          code={boundedField}
          notes={fieldNotes}
          caption="Content chooses the height between a three-line floor and a twelve-line ceiling. Overflow and manual resizing remain available."
        />
        <p>
          Those limits keep the floor in CSS, where the sizing policy now lives. The specification says{" "}
          <code>content</code> ignores the textarea&apos;s default preferred size, so an explicit minimum
          preserves the initial shape. At the other end, the maximum gives the control a scroll boundary
          instead of letting one pasted log rearrange the page.
        </p>
        <p>
          I have not audited how many production editor hooks can disappear immediately. Older browser
          floors, animation requirements, mirrored overlays, and rich-text behavior will keep some of
          them alive. For an ordinary textarea, unsupported browsers ignore the declaration and retain
          their fixed default size. A legacy autosize requirement can keep its script behind a feature
          check rather than making every browser pay for it.
        </p>

        <H2>The awkward cases belong lower down</H2>
        <p>
          Safari&apos;s{" "}
          <a href="https://webkit.org/blog/17640/webkit-features-for-safari-26-2/">26.2 release notes</a>{" "}
          announce <code>field-sizing: content</code> and, farther down the same page, record a fix for
          larger placeholder text failing to expand a field&apos;s height. I can think of no better argument
          for handing the calculation to the browser. Placeholder metrics are now a WebKit bug with a
          shared fix, rather than another edge case for every application hook to discover on its own.
        </p>
        <p>
          Chrome shipped the property in version 123, Safari followed in December 2025, and Firefox
          completed the set this June. The engines will still disagree at the edges, and the property is
          young enough that testing real fonts, zoom, writing modes, and maximum sizes matters. At least
          those tests now exercise layout itself rather than a private imitation wired to one event.
        </p>
        <p>
          The 2017 CSSWG issue still contains the workaround in a comment: set a height, read{" "}
          <code>scrollHeight</code>, append pixels. A few screens below it, the meeting bot records the
          decision to add textarea sizing. The linked specification now defines <code>field-sizing:
          content</code>, and in a current composer those two JavaScript lines are the part of the diff
          that disappears.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
