import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, BarChart, FlowSequence, H2, MemoryBoxes, Prose } from "../../components";
import { RunwayMonitor } from "./runway-monitor";

export const article = {
  title: "The runway won’t wait for frame seven",
  description: "A couture show has two customers for each camera frame. The archive wants every stitch. The backstage monitor wants whatever just happened. Jai and Goose put a very different price on that handoff.",
  published: "2026-11-17T21:45:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/the-runway-wont-wait-journal.webp",
    alt: "A model in a pleated red coat turns on top of a film camera.",
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
          Halfway down the runway, the model turns. For an instant you can see the green silk inside her red coat.
          The photographer wants that instant on disk. Backstage, the dresser is watching the monitor to see when the
          model turns back. A beautiful picture delivered late is a perfectly good photograph and a lousy cue.
        </p>
        <p>
          Suppose we’re building the camera rig. We can give recording and preview their own workers. The interesting
          decision comes a few milliseconds later, when the camera hands us a new picture and both workers are busy.
          Here’s the same turn played through two possible monitors. Move the clock and watch the coat.
        </p>
        <RunwayMonitor />
        <p>
          At 75 ms the left screen shows frame three, exposed 55 ms ago. The right shows frame six, just 25 ms old.
          Both workers finished exactly three jobs. The right one got closer to live by throwing away pictures it
          hadn’t started. That’s a decision I’d happily let the monitor make. Imagine finding out afterward that the
          same decision applied to the photographer’s negatives.
        </p>

        <H2>In Jai, hand over the address</H2>
        <p>
          Ivo Balbaert’s little Jai thread-group example has an appealingly direct answer to “where does the result
          go?” The caller makes an array of work records and queues a pointer to each one. A worker writes the
          answer into the record. The caller collects completed pointers and reads the answers in place. The example enables work stealing. An idle thread can take a waiting job, so the caller collects
          completed records without having to predict which thread will finish each one. <a href="https://github.com/Ivo-Balbaert/The_Way_to_Jai/blob/19cb4b7acb0de2798c769f9ad73313a4d15f4056/examples/31/31.4_thread_group_response.jai">Balbaert’s Jai example</a>.
        </p>
        <MemoryBoxes
          title="In the proposed camera rig, recorder and preview jobs point to the same captured exposure."
          boxes={[
            { id: "writer", label: "Recorder job", fields: [{ name: "source", pointsTo: "slot" }] },
            { id: "monitor", label: "Preview job", fields: [{ name: "source", pointsTo: "slot" }] },
            { id: "slot", label: "Capture slot 2", fields: [{ name: "exposure", value: "7" }] },
          ]}
          caption="Two jobs can read exposure seven from one slot. The camera must wait for both readers before writing another exposure there."
        />
        <p>
          I’d use that trick for our big images. Put the pixels in a fixed pool, give each reader its own job record,
          and let them read the same bytes. Queuing an address is cheap. Knowing when you can reuse that address is
          where you earn it. Say the recorder finishes first and releases slot two. If the camera fills it while
          the preview worker is halfway down the image, you can get the shoulders of one look and the hem of the next.
        </p>
        <p>
          I’d put one coordinator in charge of recycling slots. It records which readers still hold each exposure.
          Replacing a <em>waiting</em> preview returns its claim immediately. Replacing one already being read has
          to wait for the worker’s completion. Give every completion a slot number and an exposure number, so a
          duplicate receipt for seven can’t release seventeen. Those are rules for our rig. The thread group reports which jobs finished. The coordinator knows which exposure each one held.
        </p>

        <H2>Goose will send the whole swatch</H2>
        <p>
          Wouter van Oortmerssen’s Goose compiles a worker and its callees as a separate program with its own data
          stacks. A typed queue carries a copy of a value. In the author’s Mandelbrot renderer, a finished row
          travels as a row number followed by the actual pixels. The receiver can put it in the right place even if
          the workers finish out of order. A pointer back into a worker’s scratch space couldn’t make that trip.
          {" "}<a href="https://github.com/aardappel/goose/blob/a138602d4661537c9fd31e166ccdc23883fa6286/samples/23_mandelbrot_threads.goose">Goose’s threaded renderer</a>.
        </p>
        <BarChart title="A full-size RGBA frame contains sixteen times as many bytes as the preview."
          max={42} data={[{ label: "3840 × 2160", value: 31.640625 }, { label: "960 × 540", value: 1.9775390625 }]}
          format={(n) => n.toFixed(2) + " MiB"}
          caption="Pixel payload per exposure at four bytes per pixel. Both sizes assume tightly packed rows." />
        <p>
          Once the queue has copied the bytes, the preview worker can take as long as it likes without holding
          up that capture slot. At the larger size, one
          copy per exposure at 100 exposures a second means 3.32 GB of pixel payload per second, before the receiver
          takes its copy. That makes me want the preview scaler close to capture. Send the small image across.
          I’d measure the scaler on the capture path first. If shrinking a picture takes longer than the gap between exposures,
          the camera needs a scaler of its own or a separate worker with room to buffer the burst.
        </p>
        <p>
          There’s a catch in the obvious next line of code. Goose lets me limit the preview queue to one message.
          I tried filling it with frame seven, then offering frame eight before anyone could pick up seven.
          Which one do you think the monitor gets?
        </p>
        <AnnotatedCode lang="text" title="A one-slot Goose queue"
          code={`struct Preview { frame: i32 }

fn main() {
    qlimit<Preview>(1);
    let first = qput(Preview { 7 });
    let second = qput(Preview { 8 });
    print(first, " ", second, " ", qget<Preview>().frame);
}`}
          notes={[{ line: 4, note: "The limit applies to messages of type Preview." },
            { line: 6, note: "Eight arrives while seven still occupies the slot." }]}
          caption="The native executable printed “true false 7” using Goose runtime 4d3da949e563." />
        <p>
          Seven wins. A full queue refuses the incoming value and the producer can keep going. Ignore that boolean
          and you’ve built a monitor that quietly drops its freshest picture. The type matters too. Two cameras
          using the same message type feed the same queue. Putting a camera ID in the message identifies the sender
          once you’ve received it. It doesn’t route it to a particular screen.
          {" "}<a href="https://github.com/aardappel/goose/blob/a138602d4661537c9fd31e166ccdc23883fa6286/docs/goose_spec.md#112-concurrency">Goose’s queue rules</a>.
        </p>

        <H2>Let the screen ask for a picture</H2>
        <p>
          I’d turn the conversation around. Let capture keep a single pending preview, which it can replace whenever
          a newer frame arrives. The preview worker asks for one when it’s ready. Now only the owner changes the
          pending picture. Nobody has to reach into another thread’s queue and yank out a frame it might have
          started reading.
        </p>
        <FlowSequence steps={[
          { title: "Camera", detail: "Stores frame 5, then replaces it with 6." },
          { title: "Worker", detail: "Finishes its previous render and asks for another." },
          { title: "Camera", detail: "Replies with 6 and clears the pending slot." },
        ]} caption="One possible exchange when the worker becomes free at 50 ms. Each request admits one preview." />
        <p>
          If the request arrives early, capture remembers it and answers on the next exposure. On shutdown it
          owes that waiting worker an end message. Meanwhile the recorder gets every original on its own path.
          A disk stall can still exhaust the capture pool. Eight empty slots at one exposure every 10 ms buy
          about 80 ms to recover. After that we have to slow capture, find more storage, or tell the photographer
          that recording has a gap.
        </p>
        <p>
          That’s the test I’d run at rehearsal. Stall the disk, turn the coat, and check the originals by exposure
          number. Then slow just the monitor and look at the silk again. I want to be able to drop three previews
          on purpose and still hand the photographer the one frame everybody came for.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
