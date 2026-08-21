import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  BarChart,
  Callout,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Raise another bar",
  description:
    "When one game-development discipline outruns the rest, another week of polish buys less than a small pass on the weakest player-facing channel.",
  published: "2026-07-18T10:30:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/raise-another-bar.jpg",
    alt: "In a sepia 1913 photograph, a high jumper scissors over a wooden crossbar at Kincaid Field while men in hats watch from below.",
    credit: {
      author: "Unknown photographer",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:1913_high_jump_-_DPLA_-_5c76b23b2a8928d00ad4cf9bebd5bd3e.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const prototypeBars = [
  { label: "combat systems", value: 5 },
  { label: "animation and readability", value: 2 },
  { label: "sound", value: 0 },
  { label: "UI", value: 1 },
  { label: "encounter content", value: 2 },
  { label: "pacing", value: 1 },
] as const;

const genreRows = [
  [
    "Action",
    "Movement, enemies, animation, impact audio, camera, HUD",
    "A clever enemy still reads as a capsule sliding toward the player",
  ],
  [
    "Visual novel",
    "Dialogue, portraits, backgrounds, music, choice memory, text rhythm",
    "A meaningful branch arrives with the same face, room, and cadence",
  ],
  [
    "Puzzle",
    "Rules, affordances, board states, feedback, reset, hints",
    "The correct state appears accidental because nothing marks the transition",
  ],
  [
    "Strategy",
    "Simulation, map hierarchy, alerts, animation speed, logs, AI telegraphing",
    "A deep model appears as unexplained numbers drifting across the map",
  ],
] as const;

const formatPass = (value: number) => `${value}/5 passes`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          You can spend another week on enemy AI and still ship the same red capsule sliding toward the
          player in silence. The code gives it flanking and retreat, yet from the chair it only changes
          direction twice because the rest of the game never translates the work.
        </p>
        <p>
          A game reaches the player through several channels at once, and every project holds those bars at
          different heights. Once one towers over the rest, another week spent raising it is hard to feel from
          the chair. A first pass on a neglected channel usually moves the whole experience farther than a sixth
          pass on the thing you already enjoy making.
        </p>
        <BarChart
          title="An illustrative action-game prototype with mature combat code and much weaker player-facing layers."
          data={prototypeBars}
          max={5}
          format={formatPass}
          caption="Subjective planning marks showing the gaps inside one prototype."
        />
        <p>
          These marks compare one project with itself. The combat code is already receiving fifth-pass attention,
          while sound has not received a first pass and the interface barely explains what the combat model is doing.
        </p>

        <H2>The tall bar gets expensive</H2>
        <p>
          Programming invites this trap because a source change stays visible to you even when the player
          can&apos;t perceive it. Another planner state feels substantial in the editor. From the chair, a landing
          sound or one readable warning marker exposes more of the system than the planner does.
        </p>
        <p>
          The player receives the mix. They never encounter your combat model, sprite sheet, soundtrack, or UI in
          isolation, so the return on one discipline depends on what the surrounding layers let it communicate.
        </p>
        <p>
          There is even lab evidence pointing this way. In{" "}
          <a href="https://www.nature.com/articles/35048669">a classic multisensory experiment</a>, one visual flash
          paired with two beeps was routinely perceived as two flashes — the ear overruled the eye. I won&apos;t
          pretend a lab stimulus transfers cleanly to a game, but it is a strange result to sit on while your audio
          folder is still empty.
        </p>
        <p>
          Joonas Turner&apos;s{" "}
          <a href="https://gdcvault.com/play/1022808/Oh-My-That-Sound-Made">
            talk on sound and game feel
          </a>{" "}
          works in that same gap. A short transient at impact gives an animation an event boundary, while silence
          asks the pixels to carry timing and material alone. It is absurd how often the cheap improvement lives
          in the file type you have been avoiding.
        </p>

        <H2>The mechanic has to cross the screen</H2>
        <p>
          A rich stealth model stays hidden when the guard shows no readable trace of it — no posture change, no
          patrol drift, no audio cue, nothing on the HUD. The programmer keeps deepening a system the player
          experiences as randomness.
        </p>
        <p>
          Your genre decides which bars deserve space in the project. A visual novel and an action game need different
          translations, even when both contain choices, state, and consequences.
        </p>
        <DataTable
          head={["Genre", "Likely bars", "What a low presentation bar hides"]}
          rows={genreRows}
          caption="Different genres expose their systems through different combinations of craft."
        />
        <p>
          Read the last column as the trap. A branch flag can be flawless and still arrive as another paragraph when
          presentation stays unchanged and later scenes forget it. A strategy simulation can model a whole campaign
          and still read as arbitrary arithmetic when the map and alerts expose only changing totals.
        </p>

        <H2>Switch disciplines before projects</H2>
        <p>
          After weeks on one bar, the remaining work becomes microscopic while lower bars still contain cheap wins
          the player can notice immediately. Before rewriting the jump curve again, try one landing sound or a
          two-frame dust ring. Before adding another dialogue branch, let an existing choice change one portrait and
          the rhythm of the next exchange.
        </p>
        <Callout variant="tip" title="Before another week on the same bar">
          <ul className="list-disc space-y-2 pl-5">
            <li>Which bar is highest because I enjoy working on it?</li>
            <li>What behavior currently exists only in code or source art?</li>
            <li>Which cheap signal from another medium would expose it?</li>
            <li>Does this genre need the bar I am raising?</li>
            <li>Could I lower the ambition of the tallest bar instead?</li>
          </ul>
        </Callout>
        <p>
          None of this asks you to become a composer, animator, writer, and interface specialist at once — a first
          pass is allowed to be crude. I can&apos;t tell you where the optimum sits for your game. But a one-hour
          audio pass is cheap to try, and easy to compare against another refactor the player can&apos;t see.
        </p>
        <p>
          The red capsule from the opening never needed another behavior; it needed a footstep, a skid, a
          head-turn toward where the player just was — one signal from another channel, so the flanking it already
          performs reads as flanking. That work was finished weeks ago. The player just hasn&apos;t heard about it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
