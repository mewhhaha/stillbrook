import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BarChart, Callout, CodeBlock, Divider, H2, Prose } from "../../components";
import { TetrisIsland } from "./tetris-island";

export const article = {
  title: "Sixty kilobytes and a window",
  description:
    "Writing Tetris in Grain and wrapping it in Deno's new desktop command revives the Flash-era shape of a game: a tiny compiled artifact you can play in the page or download and run in a native window.",
  published: "2026-07-12T18:05:00Z",
  author: "Still Brook",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/sixty-kilobytes-and-a-window.jpg",
    alt: "An original Game Boy lying on a white surface with a Tetris cartridge propped up against it.",
    credit: {
      author: "Sammlung der Medien und Wissenschaft",
      license: "CC BY 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Game_Boy_and_Tetris.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const grainCore = `
provide let tick = () => {
  if (overVal == 0) {
    if (collides(pieceKind, pieceRot, pieceX, pieceY + 1)) {
      lockPiece()
    } else {
      pieceY += 1
    }
  }
}

provide let move = (dx: Number) => {
  if (overVal == 0 && !collides(pieceKind, pieceRot, pieceX + dx, pieceY)) {
    pieceX += dx
  }
}
`;

const abiShim = `
const { instance } = await WebAssembly.instantiate(bytes, {
  wasi_snapshot_preview1: { fd_write: () => 0 },
});
instance.exports._start();

// Grain's simple numbers are 31-bit ints tagged in the low bit.
const tag = (n) => (n << 1) | 1;
const untag = (v) => v >> 1;
const call = (name, ...args) =>
  untag(instance.exports[name](...args.map(tag)));
`;

const mainTs = `
const dir = import.meta.dirname!;
const html = await Deno.readFile(\`\${dir}/index.html\`);
const wasm = await Deno.readFile(\`\${dir}/tetris.wasm\`);

Deno.serve((req) => {
  const { pathname } = new URL(req.url);
  if (pathname === "/tetris.wasm") {
    return new Response(wasm, {
      headers: { "content-type": "application/wasm" },
    });
  }
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
`;

const sizeInKb = (value: number) =>
  value >= 1024 ? `${Math.round(value / 1024)} MB` : `${value} KB`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          The games I remember from school computer rooms were sixty-kilobyte files. Somebody found
          them, somebody passed them around, and they ran anywhere a browser with the Flash plugin
          existed, which in 2004 meant everywhere. When the plugin died we told ourselves the open
          web had won. The shape disappeared anyway: the small, self-contained, playable artifact
          that traveled as a file.
        </p>
        <p>
          <a href="/articles/grain-meets-you-halfway">Yesterday I wrote about Grain</a>, a small
          functional language that compiles to WebAssembly, and ended with the compiler as a
          deployment detail. This is the follow-up where I stop treating it as a detail. I wrote
          Tetris in Grain, wrapped it in Deno&apos;s three-week-old{" "}
          <a href="https://docs.deno.com/runtime/desktop/">
            <code>deno desktop</code>
          </a>{" "}
          command, and got the Flash shape back at both of its old sizes: a file you can embed in a
          page — it is playable at the end of this article — and a double-clickable thing with its
          own window.
        </p>

        <H2>Three hundred lines of falling blocks</H2>
        <p>
          The game logic is 300 lines of Grain and contains no interop, no annotations for the
          host, nothing that knows a browser exists. It is arrays, while loops, and arithmetic —
          the board is a flat array of 200 numbers, the seven pieces are tables of offsets, and the
          public surface is a handful of exported functions:
        </p>
        <CodeBlock lang="grain" title="tetris.gr" code={grainCore} />
        <p>
          I want to note, because it still surprises me, that this file compiled on the first try,
          and the headless test harness played a full stacked-out game before I had ever seen the
          board drawn. Grain&apos;s willingness to let you write a mutable, index-happy game loop
          without ceremony was the thesis of the last essay, and a 7-bag shuffle over a mutable
          array is where that thesis earns its keep.
        </p>
        <p>
          The interop is where I expected to spend a bad afternoon, because Grain values are not
          machine integers — everything is tagged so the runtime can tell a small number from a
          pointer. My first call from JavaScript panicked the module with an{" "}
          <code>unreachable</code>. The fix turns out to be two bit operations and one stubbed
          system call:
        </p>
        <CodeBlock lang="js" title="the entire foreign function interface" code={abiShim} />
        <p>
          That is the whole boundary. Shift in, shift out, ignore <code>fd_write</code> because
          nothing prints in production. I have written JSON serializers with more ceremony than
          this ABI, and I keep thinking about how unreasonable that is: a garbage-collected
          functional language hands me a <code>.wasm</code> file, and the glue fits on a napkin
          because both sides agreed on nothing more than 32-bit integers.
        </p>
        <p>
          The napkin does constrain the API. Everything crossing the boundary is a small integer,
          so the renderer asks for the board one <code>cell(x, y)</code> at a time — but Tetris
          state is nothing but small integers anyway.
        </p>

        <H2>The window is one function</H2>
        <p>
          <code>deno desktop</code> landed in{" "}
          <a href="https://deno.com/blog/v2.9">Deno 2.9</a> on June 25 and is marked experimental.
          Its entire programming model is: write a <code>Deno.serve()</code> handler, and the
          compiled binary opens a native webview pointed at it. My whole desktop layer is twenty
          lines:
        </p>
        <CodeBlock lang="ts" title="main.ts" code={mainTs} />
        <p>
          One <code>deno desktop --output grain-tetris main.ts</code> later I had a real window on
          my desk with falling tetrominoes in it. Then I looked at what the build had left on
          disk, and the sizes came out wonderfully lopsided:
        </p>
        <BarChart
          title="File sizes from one deno desktop build, from the 61 KB zipped game to the 86 MB webview runtime."
          data={[
            { label: "the whole game, zipped", value: 61 },
            { label: "tetris.wasm, release build", value: 141 },
            { label: "launcher binary", value: 301 },
            { label: "bundled runtime + webview", value: 88064 },
          ]}
          format={sizeInKb}
          caption="Everything one build of grain-tetris puts on disk, on a shared linear scale."
        />
        <p>
          That last bar is not a rendering bug. The shared library sitting next to the launcher —
          the bundled runtime and webview shim — really is 86 megabytes, more than double the
          &quot;roughly 40 MB&quot; the docs cite, and I checked the number three times before I
          believed it. The cartridge is tiny; the console it ships with is not.
        </p>
        <p>
          That ratio is the one honest difference from the thing I am nostalgic for. The Flash
          player was a one-megabyte download that every machine already had, so a game only ever
          cost you its own sixty kilobytes. <code>deno desktop</code> ships the player with every
          cartridge. I do not think that kills the shape — disks are patient, and the browser
          path costs nothing extra — but I notice nobody is going to email a friend an 86 MB
          Tetris, and in 2004 that was the entire distribution model.
        </p>

        <H2>Flash, but the good parts</H2>
        <p>
          Here is why this feels like Flash coming back rather than a party trick. The artifact is
          small and inert — a <code>.wasm</code> file can no more read your disk than a{" "}
          <code>.swf</code> could draw outside its rectangle, and this time the sandbox is in the
          spec instead of in Adobe&apos;s patch schedule. The runtime is anywhere: the exact same
          141 KB module is running in this article and inside the native window, byte for byte.
        </p>
        <p>
          And the language on top is whatever you like — Grain today; Rust, Zig, or OCaml if that
          is your house dialect — where Flash gave you ActionScript or nothing. As far as I can
          tell there is no technical reason every small game and demo of the next decade cannot
          ship this way. The missing piece is the passing-around itself, and I cannot compile
          that.
        </p>

        <Divider />

        <p>
          So here it is. The module below is the same <code>tetris.wasm</code> the desktop app
          embeds, fetched by this page and driven by the same two-bit-shift ABI. Click it, and the
          arrow keys stop scrolling and start steering.
        </p>

        <TetrisIsland />

        <p>
          My high score so far is 3,406, set while pretending to proofread this paragraph. Purists
          will notice the naive wall kicks within a minute, and the piece statistics panel Game Boy
          owners remember is missing because I ran out of Saturday.
        </p>

        <Callout>
          <p>
            Want the window version? Download{" "}
            <a href="/games/grain-tetris/grain-tetris.zip" download>
              grain-tetris.zip
            </a>{" "}
            (61 KB — Grain source, compiled wasm, page, and server included), unzip it, and with{" "}
            <a href="https://deno.com">Deno 2.9+</a> run <code>deno desktop main.ts</code>. No
            desktop mood? <code>deno run --allow-read --allow-net main.ts</code> serves it at{" "}
            <code>localhost:8000</code> like it is 2004 again.
          </p>
        </Callout>

        <p>
          The zip also carries <code>tetris.gr</code> itself, all 300 lines, kicks and shortcuts on
          display. If the last essay made you curious about Grain, the source is the better second
          read: it meets you halfway.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
