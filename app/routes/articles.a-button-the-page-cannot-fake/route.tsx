import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, H2, Prose } from "../../components";

export const article = {
  title: "A button the page cannot fake",
  description:
    "Chrome 151's <usermedia> element makes camera and microphone permission part of a browser-controlled control, not just another JavaScript call behind a page-owned button.",
  published: "2026-08-14T06:10:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/a-button-the-page-cannot-fake-journal.webp",
    alt: "A hand presses a brass button built into a webcam shutter while a false button lies aside.",
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
          A website can draw a button that says “Enable camera” and make it look exactly right. The browser still has
          to decide whether the click is followed by a permission prompt, whether a previous denial can be repaired,
          and whether the page eventually receives a stream. The thing the user clicked and the thing that actually
          controls access have traditionally been two different pieces of software pretending to be one control.
        </p>
        <p>
          Chrome 151, released on July 28, adds an interesting answer: the new <code>&lt;usermedia&gt;</code> element.
          The page places it where the camera control belongs, but the browser owns the sensitive part of the
          interaction. A physical click supplies a trusted signal of intent, the browser handles the permission flow,
          and the resulting <code>MediaStream</code> is exposed back to the application.
        </p>
        <p>
          That sounds like a small convenience API. I think the more useful part is the boundary it draws around a
          button the page is not allowed to fully impersonate.
        </p>

        <H2>The old button has two owners</H2>
        <p>
          With <code>navigator.mediaDevices.getUserMedia()</code>, the application owns the visible control and calls
          an imperative API when it decides the time is right. The browser owns the permission prompt. Those layers can
          line up perfectly, but the platform cannot infer very much from the page's pixels: a styled button is still
          arbitrary site content, and a script call can happen for reasons that are less obvious than the click that
          appears to precede it.
        </p>
        <p>
          The awkward case arrives after denial. Chrome's own documentation describes a “permission hole”: once a user
          has blocked camera or microphone access, a normal page-owned button often cannot repair that decision in
          context. The user has to find browser-specific settings, change the permission there, then return and try the
          page again. The application can explain those steps, but it cannot make its original button become the
          browser's permission control.
        </p>
        <p>
          <a href="https://developer.chrome.com/blog/usermedia-html-element">
            Chrome's <code>&lt;usermedia&gt;</code> introduction
          </a>{" "}
          reports that early capability-control trials improved this recovery path substantially in products from
          Cisco, Zoom, and Google Meet. I would treat those product numbers as evidence for this particular Chrome UI,
          not a universal law about permission design. The mechanism is easier to inspect than the percentages anyway.
        </p>

        <Compare
          attributes={["Trigger", "Permission UI", "After a denial", "What the app receives"]}
          entities={[
            {
              name: "Page button + getUserMedia()",
              values: [
                "Application code decides when to call the API",
                "Browser prompt appears separately from the page control",
                "Recovery may require browser settings",
                "A promise resolving to a MediaStream",
              ],
            },
            {
              name: "<usermedia>",
              values: [
                "Physical click on a browser-controlled capability element",
                "The control and prompt are one browser-managed flow",
                "The element can start an in-page recovery flow",
                "A MediaStream exposed by the element after consent",
              ],
            },
          ]}
          caption="The new element moves the permission-sensitive part of the control into the browser while leaving the resulting stream with the application."
        />

        <H2>The styling limits are the feature</H2>
        <p>
          The unusual part of <code>&lt;usermedia&gt;</code> is what CSS cannot do to it. Chrome requires readable
          contrast, full opacity, bounded sizing, and limited transforms. Negative margins and other tricks that could
          visually obscure the control are restricted. The underlying media-capture explainer calls complete UI
          customization a non-goal because the browser needs the element to remain a trustworthy representation of the
          capability state.
        </p>
        <p>
          That constraint makes sense only if the browser is contributing something the page cannot reproduce by
          drawing a convincing button. It is contributing provenance. When this particular control is visible and the
          user physically activates it, the browser knows the gesture reached browser-managed permission machinery
          rather than an arbitrary rectangle whose meaning exists only in application code.
        </p>
        <p>
          The same boundary continues after approval. The proposal describes capability elements as data mediators and
          action brokers: they obtain consent, perform the underlying media request, expose the resulting tracks, and
          keep a stateful control around the capability. The site still decides what to do with the stream. It just no
          longer has to fake ownership of the permission state on the way there.
        </p>

        <H2>It is deliberately smaller than getUserMedia</H2>
        <p>
          This is not a replacement for the existing API. The{" "}
          <a href="https://github.com/w3c/mediacapture-extensions/blob/main/media-capture-elements-explainer.md">
            W3C Media Capture Elements explainer
          </a>{" "}
          explicitly keeps <code>getUserMedia()</code> as the primary programmatic primitive. Capability elements are
          aimed at the common case where a visible user action is supposed to mean “let this site use this hardware.”
          Scripts still need the lower-level API for flows that do not fit that control.
        </p>
        <p>
          That narrowness is useful. Earlier work started from a generic <code>&lt;permission&gt;</code> element. The new
          direction uses capability-specific controls such as <code>&lt;usermedia&gt;</code>, with separate camera and
          microphone elements proposed behind it. A camera is not geolocation with a different icon: it produces a live
          stream, has tracks that can be enabled or stopped, and has its own recovery and device-selection behavior.
          Giving each capability a control lets the browser encode those differences instead of forcing one universal
          permission widget to know nothing about the thing it grants.
        </p>
        <p>
          There is also an important reason not to write this as a victory lap yet. The media-capture document is still
          an unofficial proposal, and <code>&lt;usermedia&gt;</code> is a Chrome 151 feature rather than a broadly shipped
          web primitive. Chrome's migration guidance therefore treats it as progressive enhancement: unsupported
          browsers render the child content, JavaScript can detect <code>HTMLUserMediaElement</code>, and the page can
          fall back to the old <code>getUserMedia()</code> path.
        </p>

        <H2>Some controls need an honest surface</H2>
        <p>
          Web applications usually benefit from owning their interface. Camera and microphone permission is a peculiar
          corner because the site cannot actually grant the thing its button appears to control. The browser owns that
          authority, remembers the user's previous decision, exposes hardware, and has to defend the prompt against
          misleading presentation.
        </p>
        <p>
          Putting a browser-controlled element in the page makes that split visible in the implementation. The site can
          choose where the control belongs and what happens after a stream arrives. The browser gets to insist that the
          control remain legible, tied to a real gesture, and capable of repairing its own permission state.
        </p>
        <p>
          The webcam in the header is an ordinary object sitting on a desk. A page can make a beautiful button for it,
          but the camera is still outside the DOM. <code>&lt;usermedia&gt;</code> gives the browser a small piece of the
          button back, which seems appropriate for the piece that decides whether the camera turns on.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
