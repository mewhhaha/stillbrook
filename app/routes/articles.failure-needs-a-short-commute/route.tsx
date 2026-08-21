import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Failure needs a short commute",
  description:
    "When a game expects repeated failure, retry boundaries should return players to the skill they are learning unless the wider reset changes enough to make the next attempt new.",
  published: "2026-08-08T12:39:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/PressureSensitiveStartingBlocks.jpg",
    alt: "Pressure-sensitive starting blocks line several lanes on a blue athletics track.",
    credit: {
      author: "Andrew Hecker",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:PressureSensitiveStartingBlocks.jpg",
    },
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
          Kill the player on the last jump of a room, then respawn them before the easy corridor, ladder, door
          animation, and empty landing they already solved. On attempt twelve, all of that material is familiar while
          the jump the player is trying to learn waits at the far end for another thirty seconds of admin.
        </p>
        <p>
          When failure is expected, the retry boundary belongs near the unanswered part of the problem. A wider reset
          can work when it changes the next attempt enough to justify the trip, but replaying solved setup turns
          difficulty into waiting. <a href="/articles/recovery-sets-the-rhythm">Recovery sets the rhythm</a> looked at
          what the player does after taking damage. Death asks the same design question at a larger scale: what should
          they have to do again?
        </p>

        <H2>Keep the mistake in frame</H2>
        <p>
          Maddy Thorson&apos;s <a href="https://www.mattmakesgames.com/articles/celeste_and_forgiveness/index.html">
            “Celeste &amp; Forgiveness”
          </a>{" "}
          lays out the tiny favors hiding inside a notoriously difficult platformer: coyote time, input buffering,
          corner correction, and several wider-than-they-look action windows. Those allowances keep a demanding jump
          focused on the movement the level asks you to learn instead of every tiny timing error around it.
        </p>
        <p>
          The official <a href="https://www.celestegame.com/changelog.html">changelog</a> is gloriously fussy about
          the other end of that loop. Version 1.2 added Quick Restart and fixed cases that could force a restart from
          the previous checkpoint. The same release corrected missing spawn points that sent Madeline to the wrong
          place after death when a room had been entered from an unexpected direction. Dull patch notes, until you
          imagine making the same failed jump after each one.
        </p>
        <p>
          Some of those spawn corrections are plainly correctness bugs, and the changelog leaves their design motive
          unstated. The practical effect is still worth staring at: fewer unrelated actions sit between the failed
          attempt and the next try. The designer gets more repetitions of the actual skill before attention cools off.
        </p>

        <H2>The commute becomes part of the test</H2>
        <p>
          A long runback changes what a difficult encounter measures. The player has to preserve concentration through
          material they already mastered and may need to conserve healing on trivial enemies along the way. Sometimes
          that pressure belongs there. An attritional game can make the approach part of the encounter because arriving
          depleted is one of the questions being asked.
        </p>
        <p>
          A fixed corridor with no meaningful resource cost has a weaker defense. The player demonstrated the route
          before reaching the failure point, so repeating it supplies almost no new information to either side. This
          is the irritating cousin of the mistake in <a href="/articles/let-the-easy-fight-live">Let the easy fight live</a>:
          repetition can establish rhythm, while compulsory repetition after every death can flatten that rhythm into
          a toll booth.
        </p>

        <H2>A wide reset can earn itself</H2>
        <p>
          <em>Hades</em> deliberately throws the player much farther back, and Supergiant&apos;s official{" "}
          <a href="https://www.supergiantgames.com/blog/hades-faq/">FAQ</a> gives the reset plenty to carry. A run is
          expected to end in death, the next escape attempt is randomized, god combinations change, and new story
          events can appear between attempts. Characters remember what happened. Even God Mode increases damage
          resistance after deaths, so failure can alter the conditions of the next run.
        </p>
        <p>
          The House of Hades, the next build, and the next sequence of chambers can all be different after a loss.
          Shortening that loop to the last room would amputate systems that depend on death reaching back into the rest
          of the game. I would not use the same excuse for a hallway whose only update is that its enemies have
          respawned in the same spots.
        </p>
        <p>
          Buried in <em>Celeste</em>&apos;s changelog is the wonderfully unglamorous version of the whole problem: a missing
          player spawn point could make death return Madeline to the wrong place after she entered a room from an
          unexpected direction. The player died in one room, and the game answered from somewhere else.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
