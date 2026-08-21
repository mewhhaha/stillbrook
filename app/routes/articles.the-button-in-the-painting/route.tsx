import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, H2, Prose } from "../../components";
import { PlasmaIsland } from "./plasma-island";
import { DomCanvasIsland } from "./dom-canvas-island";

export const article = {
  title: "The button in the painting",
  description:
    "WebGPU reached baseline in January and Chrome is now trialing HTML-in-canvas, so this walkthrough writes a first WGSL shader and then draws a live, clickable DOM element into the same kind of canvas.",
  published: "2026-07-12T20:30:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-button-in-the-painting.jpg",
    alt: "A seventeenth-century trompe-l'oeil painting of combs, scissors, letters, and books tucked behind red leather straps on a dark board.",
    credit: {
      author: "Samuel van Hoogstraten",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Tromp-l%27oeil_Still-Life_1664_Hoogstraeten.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const setupCode = `
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

const ctx = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();
ctx.configure({ device, format, alphaMode: "premultiplied" });
`;

const wgslCode = `
struct Uniforms { time: f32, width: f32, height: f32, pad: f32 };
@group(0) @binding(0) var<uniform> u: Uniforms;

@fragment
fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = pos.xy / vec2f(u.width, u.height);
  let p = vec2f(uv.x * (u.width / u.height), uv.y) * 6.0;
  var v = sin(p.x + u.time);
  v += sin(0.5 * (p.y + u.time));
  v += sin(0.4 * (p.x + p.y + u.time));
  v += sin(length(p - vec2f(3.0, 1.5)) + u.time * 1.2);
  let col = 0.5 + 0.5 * cos(6.2832 * (vec3f(v * 0.25) + vec3f(0.0, 0.33, 0.67)));
  return vec4f(col, 1.0);
}
`;

const drawElementCode = `
<canvas id="c" width="640" height="360" layoutsubtree>
  <div id="card">
    <p>A real, live DOM node.</p>
    <button id="b">clicked <span>0</span> times</button>
  </div>
</canvas>
`;

const paintLoopCode = `
const paint = (ms) => {
  ctx.clearRect(0, 0, 640, 360);
  ctx.save();
  ctx.translate(320, 180);
  ctx.rotate(Math.sin(ms / 900) * 0.15);
  ctx.translate(-126, -60);
  const transform = ctx.drawElementImage(card, 0, 0);
  card.style.transform = transform.toString();
  ctx.restore();
  requestAnimationFrame(paint);
};
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="7 min read">
      <Prose>
        <p>
          In January, WebGPU became{" "}
          <a href="https://web.dev/blog/webgpu-supported-major-browsers">Baseline</a>: Chrome,
          Edge, Firefox, and Safari 26 all ship it, on by default. I have been writing shaders in
          other people&apos;s engines for years while treating the raw API as a Chrome hobby, and
          that excuse expired this winter.
        </p>
        <p>
          So this weekend I ran the two experiments this post walks through. The first writes a
          WGSL shader against the bare API. The second tries the thing Chrome announced at I/O in
          May — an origin trial that lets real DOM elements ride into a canvas and stay alive
          there.
        </p>
        <p>
          That second experiment is where the title comes from. By the end there is a button that
          exists only as paint, swaying inside a canvas, and clicking the paint increments its
          counter.
        </p>

        <H2>Ninety lines to the first pixel</H2>
        <p>
          WebGPU&apos;s reputation is boilerplate, and the reputation is earned in volume but not
          in kind. The setup is a straight line with no mystery in it — ask for an adapter, ask it
          for a device, point the canvas at both:
        </p>
        <CodeBlock lang="ts" title="setup, minus error handling" code={setupCode} />
        <p>
          After that you compile a shader module, build a pipeline, and draw. My whole island —
          setup, render loop, pause button, visibility handling — is about ninety lines. None of
          them are the WebGL ritual of enums and global state, because the API hands you devices,
          pipelines, and encoders as plain objects.
        </p>
        <p>
          Two habits carried over from graphics work anyway. A fullscreen &quot;quad&quot; is
          really one triangle with three oversized corners, and uniform structs pad to 16-byte
          alignment — which is why my three floats travel with a <code>pad</code> they never use.
        </p>
        <p>
          The shader itself is the fun part, and WGSL reads like Rust that lost interest in
          ownership. Mine is four sine waves pushed through{" "}
          <a href="https://iquilezles.org/articles/palettes/">Íñigo Quílez&apos;s cosine palette
          trick</a>, with the clock as the only input:
        </p>
        <CodeBlock lang="wgsl" title="plasma.wgsl" code={wgslCode} />
        <p>And here is that exact shader, compiled by whatever GPU you brought:</p>
        <PlasmaIsland />
        <p>
          One honest asterisk on &quot;runs everywhere&quot;: your CI probably is not baseline.
          Getting this shader to render in headless Chromium for this article&apos;s tests took
          four command-line flags ending in SwiftShader, a software GPU. A reader gets the real
          hardware for free, and a build server still has to be talked into pretending it has
          any.
        </p>

        <H2>The document climbs into the frame</H2>
        <p>
          Canvas UIs have always paid a tax. The moment your interface becomes pixels, everything
          the browser was quietly doing for your elements becomes your job, and the ledger is
          longer than it looks:
        </p>
        <Compare
          attributes={["Hit testing", "Focus and text selection", "What a screen reader finds", "Your job each frame"]}
          entities={[
            {
              name: "UI as pixels",
              values: [
                "Yours — rectangle math against mouse coordinates",
                "Rebuilt by hand, rarely completely",
                "Nothing",
                "Everything, because the pixels are the interface",
              ],
            },
            {
              name: "Canvas with layoutsubtree",
              values: [
                "The browser's, computed from real layout",
                "Native — the element never left the tree",
                "The DOM node it expected",
                <>
                  One <code>drawElementImage</code> call to project it
                </>,
              ],
            },
          ]}
          caption="What a painted interface owes, and what the origin trial hands back."
        />
        <p>
          The{" "}
          <a href="https://developer.chrome.com/blog/html-in-canvas-origin-trial">
            HTML-in-canvas origin trial
          </a>{" "}
          (Chrome 148 to 150, or the <code>canvas-draw-element</code> flag) is the right-hand
          column. Children of a canvas marked <code>layoutsubtree</code> get layout and hit
          testing like ordinary elements — they are simply invisible until you draw them:
        </p>
        <CodeBlock lang="html" title="the markup" code={drawElementCode} />
        <p>
          Then <code>drawElementImage</code> paints the element&apos;s live rendering wherever the
          canvas transform points, and returns the matrix that keeps the real element aligned with
          its painted pixels. Apply it, and clicks keep landing:
        </p>
        <CodeBlock lang="js" title="the paint loop" code={paintLoopCode} />
        <p>Which produces this — live if your browser carries the flag, recorded if not:</p>
        <DomCanvasIsland />
        <p>
          Two things surprised me, in both directions. My first call threw{" "}
          <code>No cached paint record for element</code>: an element has to be painted once
          before it can be sampled, which is what the new <code>paint</code> event on the canvas
          is for. The demo above handles it by retrying until the record exists.
        </p>
        <p>
          The other surprise ran the opposite way. Before I had drawn anything at all, with the
          card fully invisible, my test harness clicked the button and the counter moved — layout
          and hit testing arrive with the attribute, not with the drawing. An invisible button
          that works is a strange object, though I can see the logic of it.
        </p>
        <p>
          The same trick extends past 2D. <code>texElementImage2D</code> uploads an element as a
          WebGL texture, and <code>copyElementImageToTexture</code> does it for WebGPU — meaning
          the plasma shader above could, in a flagged Chrome, warp a live form the way it warps
          sine waves. Cross-origin iframes are banned outright, which is the right paranoia:
          &quot;draw any rendered pixel into a readable buffer&quot; is a phishing kit if it works
          on content you do not own.
        </p>

        <H2>One surface, finally</H2>
        <p>
          What I keep turning over is that these two APIs point at the same seam from opposite
          sides. WebGPU made the browser&apos;s fastest drawing surface a standard citizen, and
          HTML-in-canvas lets the document onto that surface without giving up being a document.
        </p>
        <p>
          The accessibility story is the part I did not expect from a graphics API. The button in
          my demo stays in the tree, and my test harness finds it by ARIA role and clicks it —
          though I have not put an actual screen reader on it, so treat that half as promising
          rather than proven.
        </p>
        <p>
          The usual caveat applies with extra force: this is an origin trial, the API already shed
          one name on the way here (early drafts called it <code>placeElement</code>), and it may
          ship changed or absent. I am not building on it; I am enjoying it.
        </p>
        <p>
          Hoogstraten painted his letter rack so well that visitors reached for the comb, and that
          gap — between paint you want to touch and paint that answers — has been the whole
          difference between an image and an interface. In one flagged browser on my desk, for one
          swaying button, the gap is closed. My counter reads 14, and I put every one of those
          clicks on the paint.
        </p>

        <Callout>
          <p>
            The shader island runs in any baseline browser. The card demo needs Chrome 149 or
            later with <code>chrome://flags/#canvas-draw-element</code> enabled — everyone else
            gets a recording of it, taken in the browser this article was tested in.
          </p>
        </Callout>
      </Prose>
    </ArticleLayout>
  );
}
