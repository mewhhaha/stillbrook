import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  DataTable,
  FeedbackLoop,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "In defense of long hallways",
  description:
    "Quiet traversal, recovery rooms, and measured repetition give players time to predict, recover, and notice what the next burst of action will cost.",
  published: "2026-07-18T13:20:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/in-defense-of-long-hallways.jpg",
    alt: "The painted Long Corridor at Beijing's Summer Palace recedes through repeating columns and roof beams toward a distant pavilion.",
    credit: {
      author: "Gary Todd",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Summer_Palace_Long_Corridor_(9864869886).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const pacingLoop = [
  {
    title: "Signal",
    detail: "A sealed door, distant sound, missing companion, or depleted resource leaves a question unresolved.",
  },
  {
    title: "Traverse",
    detail: "Low-risk movement gives the player time to predict, recover, inspect, and choose how ready to be.",
  },
  {
    title: "Peak",
    detail: "The encounter spends the anticipation and gives the player's preparation a target.",
  },
  {
    title: "Aftermath",
    detail: "Damage, loot, silence, or a changed route makes the peak's cost visible before the next question appears.",
  },
] as const;

const pauseRows = [
  [
    "Suspense corridor",
    "Listen, predict, choose readiness",
    "Occlusion, a changing sound, a view of the destination",
    "Nothing could happen and nothing new can be inferred",
  ],
  [
    "Recovery room",
    "Reload, heal, compare inventory",
    "The previous fight's cost remains visible in resources or dialogue",
    "Resources reset automatically and the room says nothing",
  ],
  [
    "Repeated route or grind",
    "Practice, optimize, gather",
    "Skill, world state, knowledge, or expectation moves",
    "The same inputs produce the same result without a choice",
  ],
  [
    "Dialogue walk",
    "Absorb character and place while moving",
    "Optional details reward attention without blocking the route",
    "The player is trapped at an NPC's pace after the point has landed",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Delete the hallway and elevator, then teleport across the walk back through town. Great: every encounter
          now touches the next one, and the monster arrives before the player has time to imagine it. Why would
          every door open directly into another arena?
        </p>
        <p>
          <a href="/articles/combos-and-conversations">Combos and conversations</a> needed pacing so its responses
          could land, and <a href="/articles/make-the-game-answer">the practical follow-up</a> queued a radio line
          until the player reached somewhere quiet. The assumption underneath them both is that suspense is work the
          player performs while the game withholds resolution.
        </p>

        <H2>The rain quote is one step removed</H2>
        <p>
          The line I went looking for was attributed to Akira Kurosawa: “If I don&apos;t let you watch the rain fall
          on this peaceful village, how will you know what violence is?” The wording I could verify appears in a{" "}
          <a href="https://www.youtube.com/watch?v=4JtUPBkYQOY">January 2026 Variety conversation</a>, where
          Brennan Lee Mulligan presents it as Kurosawa&apos;s explanation of the pause before the final battle in{" "}
          <em>Seven Samurai</em>. I found no primary Kurosawa source for the sentence.
        </p>
        <p>
          The scene and the pacing argument survive the shaky attribution. A Criterion essay on{" "}
          <a href="https://www.criterion.com/current/posts/442-the-hours-and-times-kurosawa-and-the-art-of-epic-storytelling">
            the film&apos;s use of time
          </a>{" "}
          describes how its length lets the village, defenders, and agricultural year accumulate meaning before
          the bandits attack. In a documented interview,{" "}
          <a href="https://www.rogerebert.com/interviews/drawing-on-spirited-world">
            Hayao Miyazaki tells Roger Ebert
          </a>
          {": “If you just have non-stop action with no breathing space at all, it's just busyness.”"}
        </p>

        <H2>The corridor carries a question</H2>
        <p>
          A useful hallway begins before the player enters it. The boss door is visible at the far end, something
          moves behind a window, or the music drops one instrument and leaves a pulse. Walking becomes active
          because the player spends those seconds predicting what the destination will demand.
        </p>
        <FeedbackLoop
          steps={pacingLoop}
          returnLabel="the aftermath plants the next unresolved question"
          caption="A pacing cycle where the quiet interval carries uncertainty and recovery between two peaks."
        />
        <p>
          The same stretch of geometry can do several jobs at once: let health and attention settle, establish
          distance, show off the environment, give the streaming system somewhere discreet to work. Loading is a
          real production reason for a corridor — but players clock a disguised progress bar faster than designers
          hope, so it had better not be the only thing happening in there.
        </p>
        <p>
          How long is too long? I can&apos;t give you a number of seconds. Movement speed, camera, threat, music,
          and how much control the player keeps all change the felt length, so the test that survives is whether
          the space keeps some question alive — or hands the player a different kind of useful attention.
        </p>

        <H2>Relax belongs to the fight</H2>
        <p>
          Valve built this into the <em>Left 4 Dead</em> AI Director. Michael Booth&apos;s official{" "}
          <a href="https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf">
            presentation on the game&apos;s AI systems
          </a>{" "}
          calls constant combat fatiguing and long inactivity boring, then describes a loop of build-up, sustained
          peak, fade, and a relax period before threats resume. The Director changes encounter frequency rather
          than quietly lowering the enemies&apos; strength.
        </p>
        <p>
          A handmade level can do the same work without an intensity model. After a fight, let the player reload
          while companions comment on the damage. Before the next one, show the destination through glass and make
          the route turn away from it. The hallway delays contact while keeping the encounter present in the
          player&apos;s head.
        </p>
        <DataTable
          head={["Pause", "Player's job", "What earns the time", "Cut it when"]}
          rows={pauseRows}
          caption="Four common pauses, the attention each asks from the player, and the condition that turns it into padding."
        />

        <H2>Grind needs a moving baseline</H2>
        <p>
          Repetition can hold the same low-intensity floor. A short mining route teaches the cave, makes the return
          trip legible, and lets one rare sound interrupt a routine the player has settled into. A few ordinary
          fights make the boss&apos;s rules feel exceptional. As long as something is still moving — skill, world
          state, what the player knows or expects — the minutes are buying something.
        </p>
        <p>
          When none of that moves anymore, cut it. The player knows the route, has solved the inputs, and is
          watching a number climb because the economy demands it; shorten the route, automate it, or let them
          choose when to compress it.
        </p>
        <p>
          Put a closed door at the end of your graybox hallway and one sound behind it that stops when the player
          stops. Walk the space once with the sound and once muted. If both versions feel identical, you built
          distance. If the silent pass loses the knot in the walk, keep the hallway and fix the carpet later.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
