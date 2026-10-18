import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, FeedbackLoop, H2, Prose } from "../../components";

export const article = {
  title: "Let me stay in the loop",
  description:
    "Creative AI tools need to make a small change visible while the idea is still fresh. Long autonomous runs solve a different part of the job.",
  published: "2026-10-18T00:15:00Z",
  author: "Still Brook",
  tags: ["software", "ai", "design"],
  image: {
    src: "/images/articles/let-me-stay-in-the-loop-journal.webp",
    alt: "A hand turns a brass drawing machine's knob while its pencil sketches a leaf, beside an olive sprig.",
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
          Make the heading a little smaller. Now the image feels too heavy. Move it down. Actually,
          the earlier spacing was better; keep that, but use this crop. This is a perfectly normal
          way to design something. Most of the decisions become available only after seeing the
          previous change.
        </p>
        <p>
          For this kind of work, the improvement I want most from AI is speed. Enough speed that I
          can keep looking, adjusting, and finding out what I mean. I want to stay with the thing
          I am making instead of repeatedly handing it off and waiting to get it back.
        </p>

        <H2>The long-running job became the ambition</H2>
        <p>
          The version of AI progress I keep hearing about is a system that can work for longer on
          its own. Give it a bigger assignment. Let it plan, research, implement, check, and return
          when it has something finished. I understand the appeal. A migration with clear acceptance
          criteria is a good thing to get out of my afternoon.
        </p>
        <p>
          Creative work often starts with weaker criteria. I know a scene feels flat. I do not yet
          know whether the problem is the camera, the lighting, or where the character stands.
          Writing a longer prompt can describe the uncertainty in greater detail without resolving
          it. Trying one camera angle might resolve it immediately.
        </p>
        <p>
          A long run makes a commitment to a direction. While the system continues down that path,
          the person who could recognize the wrong turn is waiting. The work can be competent and
          still arrive too late to participate in the thought that started it.
        </p>

        <H2>Seeing is part of deciding</H2>
        <p>
          Bret Victor&apos;s 2012 talk{" "}
          <a href="https://worrydream.com/InventingOnPrinciple/">Inventing on Principle</a>{" "}
          makes a case for an immediate connection between a creator and their work. His later essay{" "}
          <a href="https://worrydream.com/LearnableProgramming/">Learnable Programming</a>{" "}
          goes further: an immediate update is only a beginning. The environment needs to reveal
          something useful enough to react to.
        </p>
        <p>
          That is the standard I want to apply to AI tools. A stream of tokens can arrive quickly
          while the page, image, or animation remains unavailable. A progress message can reassure
          me that work is happening without giving me anything I can judge. The useful moment is
          when I can see the consequence of the change.
        </p>
        <FeedbackLoop
          steps={[
            { title: "See a draft", detail: "Enough of the actual work to judge." },
            { title: "Notice something", detail: "A detail suggests the next move." },
            { title: "Make a small change", detail: "Keep the rest stable." },
          ]}
          returnLabel="The changed draft gives you something new to see"
          caption="The next instruction comes from inspecting the result of the previous one."
        />
        <p>
          When that cycle is short, a vague preference can turn into a precise decision through
          several cheap experiments. When every experiment is expensive, I start negotiating with
          the result. Maybe that spacing is fine. Maybe I can live with the awkward sentence.
          Waiting changes which improvements seem worth asking for.
        </p>

        <H2>A faster tool needs a smaller unit of work</H2>
        <p>
          Some of this requires faster models. Some of it requires asking the model to do less.
          A crop change should preserve the picture. A sentence edit should preserve the surrounding
          argument. The system should remember the artifact and the decisions already made, so a
          small adjustment can remain small all the way through execution.
        </p>
        <p>
          I also want controls that do not need a conversation. Drag the object. Scrub the timing.
          Undo the last change. Let the model help find a direction, then expose the parts I can
          adjust directly. It is peculiar to put a capable assistant inside a tool and make the
          whole tool wait for the assistant to move one slider.
        </p>
        <p>
          Rough previews can help when they preserve what I am trying to judge. A low-resolution
          image may be enough to choose a composition. A layout preview needs the real line breaks.
          An animation preview needs the timing. Cheap feedback is useful only if it answers the
          current question; a misleading preview spends the next iteration correcting the wrong thing.
        </p>

        <H2>Time the correction</H2>
        <p>
          I would evaluate a creative assistant with a short sequence of revisions to the same
          artifact. Include an undo, a change of direction, and an interruption. A polished first
          result is useful evidence, but most of the working relationship happens after that result.
        </p>
        <DataTable
          head={["Measure", "What it tells me"]}
          rows={[
            ["Time to a usable preview", "When I can make the next decision."],
            ["Time from correction to visible change", "Whether I can keep thinking about the same detail."],
            ["Unrequested changes per edit", "How much of the artifact I must inspect again."],
            ["Time to stop or undo", "How cheaply I can abandon a bad direction."],
          ]}
          caption="A proposed evaluation for creative tools; these are measurements to collect, not reported benchmark results."
        />
        <p>
          The longer jobs still have a place. Render the final frames, run the full checks, export
          the variants. Let that work continue in the background while the foreground stays
          responsive. A tool can have patience for expensive work and still respect the small
          correction I am making right now.
        </p>
        <p>
          I want more of the ambition around AI to go here. Show me something soon enough that I
          still remember why I asked. Let me touch it, change my mind, and try again. There are
          plenty of tasks I would happily delegate for an hour. When I am making something, I
          would like to remain present for the making.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
