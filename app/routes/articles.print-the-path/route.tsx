import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Print the path",
  description:
    "Temporary print statements solve many bugs because they capture a rerunnable chronology with less setup than an interactive debugger.",
  published: "2026-07-11T22:50:00Z",
  author: "Still Brook",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/print-the-path-journal.webp",
    alt: "Two wind-up workers carry dark spheres along a dotted path past a gate and a printing machine.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const raceOutput = `
  settle invoice=8 worker=4121 phase=loaded state=pending
  settle invoice=8 worker=4197 phase=loaded state=pending
  settle invoice=8 worker=4121 phase=charged
  settle invoice=8 worker=4197 phase=charged
`;

const transitionProbe = `
  probe("loaded", invoice, { state: invoice.state });

  if (invoice.state === "pending") {
    await charge(invoice);
    probe("charged", invoice);
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Near midnight, I was attached to the right Node worker and paused inside the right function. The
          invoice was pending, the call stack looked ordinary, and stepping over <code>charge</code> produced
          one successful save. I had reproduced nothing.
        </p>
        <p>
          Why was I single-stepping one worker to understand a race between two? The fact I needed was the
          order of events across processes, and pausing shows one process at one moment. I removed the
          breakpoint, added four temporary prints carrying an invoice id and a process id, then ran the
          stress test again. The terminal finally showed the shape of the bug:
        </p>
        <CodeBlock lang="text" title="stderr" highlight="1-4" code={raceOutput} />
        <p>
          Two workers loaded the same pending record before either one saved the result. The frame from worker
          4121 looked reasonable because it omitted worker 4197, whose two lines supplied the dangerous
          interleaving.
        </p>

        <H2>A print is a narrow question</H2>
        <p>
          Print debugging works best when the line asks one question you can answer on the next run. Did this
          branch execute for invoice 8? Which worker entered first? A dump of every local variable makes those
          answers harder to see.
        </p>
        <p>
          Raw <code>console.log(&quot;here&quot;)</code> calls lose their meaning as soon as the output
          scrolls, so I write a disposable helper that prints one JSON line with a stable probe name, the id
          of the work, and the pid of the runtime that emitted it. The call sites then describe transitions
          rather than locations:
        </p>
        <CodeBlock lang="ts" title="settle.ts" highlight="1,5" code={transitionProbe} />
        <p>
          &ldquo;Loaded&rdquo; and &ldquo;charged&rdquo; survive refactoring better than &ldquo;line 84&rdquo; or
          &ldquo;after second await.&rdquo; More importantly, the two events can be compared across workers and
          across repeated runs.
        </p>

        <H2>The debugger keeps one excellent frame</H2>
        <p>
          A breakpoint preserves one rich moment, while temporary prints preserve a cheap sequence across
          many moments. When the missing fact is order, the small trace usually reaches it faster.
        </p>
        <Compare
          attributes={["Captures", "Setup", "Schedule cost"]}
          entities={[
            {
              name: "Temporary prints",
              values: [
                "Order — one line per event, comparable across processes and reruns",
                "Thirty seconds to place a probe, then one rerun",
                "Every line does I/O and allocates strings",
              ],
            },
            {
              name: "Breakpoint",
              values: [
                "Depth — the whole stack and object graph at one stop",
                "Attach to the right process, maybe a child you forgot existed",
                "Each pause joins the schedule you are studying",
              ],
            },
            {
              name: "rr recording",
              values: [
                "Both — the full history, plus state you did not think to record",
                "Record one failing execution, Linux only",
                "Replay is deterministic, so the interleaving holds still",
              ],
            },
          ]}
          caption="Left to right, the capture grows richer and the setup grows heavier."
        />
        <p>
          Debugger authors have built this distinction into their tools. The <a href="https://sourceware.org/gdb/current/onlinedocs/gdb.html/Tracepoints.html">GDB manual on tracepoints</a> begins with programs whose real-time behavior can change when a debugger interrupts them, so a tracepoint records selected expressions while the target keeps running and lets you read the collected history after.
        </p>
        <p>
          Pausing is especially awkward around timers, UI events, subprocesses, and lock contention, and
          printing perturbs the same schedule. I once put a log inside a tight retry loop, watched the flaky
          test turn green, and spent another hour congratulating the fix before removing the line brought
          the failure straight back.
        </p>

        <H2>Escalate when the question gets richer</H2>
        <p>
          The debugger becomes the faster instrument once you know where to stop and need depth rather than
          chronology. A conditional breakpoint can catch the rare input without filling a terminal, and a
          watchpoint can answer who wrote a field when adding prints to every possible writer would be absurd.
        </p>
        <p>
          Intermittent native failures deserve an even stronger tool: <a href="https://rr-project.org/">rr</a>,
          which adds reverse execution through GDB on top of the recording.
        </p>
        <p>
          I have not measured how often printing wins the first round, and memory corruption in C++ is a
          different sport from a TypeScript worker race. In ordinary application code, though, the setup cost
          matters, and a probe can disprove a theory while the debugger is still being aimed.
        </p>
        <p>
          After fixing the double charge with an atomic claim, I deleted the four <code>settle</code> probes
          and reran the stress test without them. It passed locally, then failed once on the slower CI worker
          because its timeout was too tight. I added one print back, this time around the clock.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
