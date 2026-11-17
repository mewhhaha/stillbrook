import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, H2, MemoryBoxes, Prose } from "../../components";

export const article = {
  title: "What happens when you cancel a photo import?",
  description: "One open file, a tray of half-made thumbnails, and two names for the same pixels. Three things programming languages can now help us keep straight.",
  published: "2026-11-17T19:30:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/cancel-the-photo-import-journal.webp",
    alt: "Three photographs of a diving kingfisher hang above a developing tray.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          You pick the wrong folder. The photo app starts making thumbnails of six hundred pictures of a bird.
          You hit Cancel, pick the right folder, and a kingfisher pops up among the wedding guests.
          The first import has managed to outlive its own Cancel button.
        </p>
        <p>
          This is one direction in programming I’m excited about. More of the promises we used to leave in
          comments can go in the code itself. Take that import apart and you can see it happening in three
          languages. JavaScript can close the file for you. Python can account for the whole flock of jobs.
          Swift can catch two parts of the app trying to edit the same bird.
        </p>

        <H2>How long do we need the file?</H2>
        <p>
          Say the importer reads a photo into memory and hands the bytes to a decoder. At that point the app
          has everything it needs from the SD card. Here’s the whole file-reading function in Node.js.
        </p>
        <CodeBlock lang="js" title="Read one photo from disk" code={`
          import { open } from "node:fs/promises";

          async function readPhoto(path) {
            await using file = await open(path, "r");
            return await file.readFile();
          }
        `} />
        <p>
          There are two awaits on the line that opens the file. The one on the right waits for the file to open.
          The one in <code>await using</code> tells JavaScript to wait for it to close on the way out.
          By the time the caller gets the bytes, the handle is closed. Add an early return next month for an
          unsupported photo format and the file still gets closed. Node made{" "}
          <a href="https://nodejs.org/api/fs.html#filehandlesymbolasyncdispose">file handle disposal stable in 24.2</a>.
        </p>
        <p>
          Now pull the card halfway through a read. Suppose the read fails and closing the file throws a second
          error. Which one should the caller see? A plain <code>finally</code> that throws would hide the read
          error. JavaScript’s disposal machinery builds a <code>SuppressedError</code> that keeps both. If the
          block opened several resources, it still tries to dispose of the rest, most recently acquired first.
          That’s a surprising amount of error handling to get out of one line.
          {" "}<a href="https://tc39.es/proposal-explicit-resource-management/#sec-disposeresources">TC39’s disposal algorithm</a>.
        </p>

        <H2>What does the Cancel button wait for?</H2>
        <p>
          Closing a file does nothing to the thumbnails already under way. Imagine a Python version of the
          importer that fetches a handful of photos from a network camera. We can give each fetch its own task
          and put them all in one <code>asyncio.TaskGroup</code>. Python 3.15 added a particularly nice method
          for our button. The UI can call <code>jobs.cancel()</code> on the event loop that runs this import.
        </p>
        <CodeBlock lang="python" title="One group per click on Import" code={`
          async def import_batch(jobs, photos):
              async with jobs:
                  for photo in photos:
                      jobs.create_task(fetch_preview(photo))
        `} />
        <p>
          Here <code>jobs</code> is a fresh task group shared with the button. When the user cancels,
          the group asks each unfinished task to stop. A fetch suspended at an <code>await</code> can receive
          that request, release its connection in a <code>finally</code> block, and finish. Only after the last
          child finishes can execution pass the end of <code>async with</code>. That gives the UI a sensible
          moment to reuse the thumbnail tray. A child spinning in a long loop can still make the user wait.
        </p>
        <p>
          The fiddly case is when two things go wrong at once. A fetch fails, so the group starts
          cancelling its siblings. Meanwhile the app is quitting and cancels the import from outside.
          The group uses cancellation internally to wake its parent. If it swallows the outside request along
          with its own wake-up, the app can miss the instruction to quit. Python 3.13 improved how groups
          keep track of those overlapping requests. <a href="https://docs.python.org/3.15/library/asyncio-task.html#task-groups">Python’s task group documentation</a>.
        </p>

        <H2>Who gets to change the pixels?</H2>
        <p>
          One photo makes it through. In a Swift app, the decoder fills a mutable image buffer, then passes
          it to an actor that owns the preview tray. An actor lets one piece of code at a time touch its
          isolated state. That buys us very little if the decoder kept a spare reference and uses it to draw
          a watermark while the tray is reading the pixels.
        </p>
        <MemoryBoxes
          title="Two references point to the same mutable pixel buffer."
          boxes={[
            { id: "decoder", label: "Decoder", fields: [{ name: "spare", pointsTo: "pixels" }] },
            { id: "tray", label: "Preview tray", fields: [{ name: "image", pointsTo: "pixels" }] },
            { id: "pixels", label: "Pixel buffer", fields: [{ name: "first pixel", value: "olive" }] },
          ]}
          caption="Writing through the decoder’s spare reference would change the very pixels the tray is about to display."
        />
        <p>
          Swift 6 gives the tray a way to ask for a handoff. Its method can take
          {" "}<code>_ image: sending PixelBuffer</code>. With a fresh instance of this mutable class,
          the decoder can fill the buffer, pass it in, and go on to the next photo. You just handed over a
          twelve-megapixel bird without copying it. If the decoder later writes through <code>spare</code>,
          Swift can flag the handoff at compile time.
          {" "}<a href="https://github.com/swiftlang/swift-evolution/blob/main/proposals/0430-transferring-parameters-and-results.md">Swift’s sending proposal</a>.
        </p>
        <p>
          Finding the spare is the hard part. It might live inside another object, or get assigned only in the
          branch that adds watermarks. Swift’s compiler groups together values that might reach the same mutable
          storage and tracks those groups through branches. Sometimes it has to assume two values are connected
          even when the programmer knows they’re separate. That’s the price of checking the handoff before a
          single photo has loaded. <a href="https://github.com/swiftlang/swift-evolution/blob/main/proposals/0414-region-based-isolation.md">Swift’s region analysis</a>.
        </p>
        <p>
          I’d still keep a test for that stray kingfisher. A thumbnail might already be sitting in the UI’s
          event queue when Cancel lands. Even a perfectly behaved download can leave one last bird in the queue.
          Give each import a number. When a thumbnail arrives
          for import 17 and the wedding is import 18, drop the bird.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
