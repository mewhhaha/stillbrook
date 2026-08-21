import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, LineChart, Prose } from "../../components";

export const article = {
  title: "Let the easy fight live",
  description:
    "Simple encounters give players room to recognize, practice, recover, and feel strong, so complexity works best as paced escalation rather than a quota every room must satisfy.",
  published: "2026-07-19T11:34:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/let-the-easy-fight-live.jpg",
    alt: "Thomas Eakins’s painting of a boxer resting on a stool between rounds while his corner tends to him and a crowd watches from the dark arena.",
    credit: {
      author: "Thomas Eakins",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Thomas_Eakins_-_Between_Rounds_(1890s).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const intensityLabels = ["entry", "recognize", "pressure", "peak", "recover", "twist", "finale"] as const;

const intensitySeries = [
  {
    name: "Paced sequence",
    values: [2, 3, 4, 8, 2, 5, 10],
  },
  {
    name: "Every room must be interesting",
    values: [6, 7, 8, 9, 8, 9, 10],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Put one ordinary combat room in a design review and somebody will ask for the twist. Add a balcony,
          an armored enemy, a floor hazard, a timer, and a secondary objective. Now the encounter has earned its
          salary, apparently. Do this to every room and the game begins to feel like a meeting where each person
          arrived with a new agenda item.
        </p>
        <p>
          A simple encounter is not unfinished design. It is the low note that lets the next complication register.
          Games need rooms where you recognize the situation, perform the skill you already learned, and win without
          being handed another system to keep in working memory.
        </p>

        <LineChart
          title="An illustrative encounter sequence where paced complexity creates larger changes in intensity than keeping every room near the ceiling."
          labels={intensityLabels}
          series={intensitySeries}
          yMax={10}
          format={(value) => `${value}/10`}
          caption="Illustrative planning curves, not player telemetry: the flatter sequence spends more complexity while producing less contrast."
        />
        <p>
          This follows <a href="/articles/in-defense-of-long-hallways">In defense of long hallways</a>, which gave
          quiet traversal a job between action peaks. The same pacing problem exists inside combat. Bullets can still
          be moving while the encounter gives the player a lower, clearer demand.
        </p>

        <H2>The review asks for another problem</H2>
        <p>
          “Never one problem” sounds like a useful rule because it catches rooms where the player repeats a solved
          input without reading anything new. Then the rule escapes its enclosure. Every pack needs mixed ranges,
          every traversal needs a threat, and every puzzle needs a second constraint before the first one has had
          time to become legible.
        </p>
        <p>
          Once a game has been judged shallow, its quieter encounters start serving as evidence for the verdict.
          Nisbett and Wilson&apos;s classic{" "}
          <a href="https://deepblue.lib.umich.edu/items/da93fb79-74ef-4ff0-a1fe-da088de2dc42">
            halo-effect experiment
          </a>{" "}
          found that a global impression altered how people rated individual traits they had enough information to
          assess separately. Their study concerns a lecturer rather than a combat arena, so I am borrowing the
          mechanism cautiously. The review pattern is familiar anyway: “simple game” becomes “simple encounter,”
          and the encounter&apos;s actual job disappears from the conversation.
        </p>

        <H2>Ordinary encounters teach the verb</H2>
        <p>
          Nintendo&apos;s designers describe building the fun, difficult courses first and then moving easier features
          toward the beginning when beginners could not use them. In the official{" "}
          <a href="https://iwataasks.nintendo.com/interviews/wii/nsmb/1/4/">
            New Super Mario Bros. Wii interview
          </a>, World 1-1 appears late in development and receives adjustment until the end because it has to teach
          the world without a person standing beside the player.
        </p>
        <p>
          That first Goomba poses one problem. Good. The player needs a clean reading of movement, collision, jump
          timing, and consequence before a later level combines those facts with moving platforms or a collapsing
          route. Complexity placed earlier would make the lesson harder to identify, while complexity placed later
          can ask whether the player understood it.
        </p>
        <p>
          Combat uses the same grammar. Three familiar enemies on open ground can confirm that a new weapon works,
          give the player a stretch of competence after a difficult fight, or establish the normal behavior that a
          special enemy will violate. For fuck&apos;s sake, the player is allowed to solve the thing they learned. Mastery
          needs a place to become visible before the game changes the exam paper again.
        </p>

        <H2>Valve lowers the frequency</H2>
        <p>
          Valve made this relationship executable in <em>Left 4 Dead</em>. Michael Booth&apos;s official{" "}
          <a href="https://cdn.fastly.steamstatic.com/apps/valve/2009/ai_systems_of_l4d_mike_booth.pdf">
            AI Director presentation
          </a>{" "}
          calls constant combat fatiguing and long inactivity boring, then uses build-up, a sustained peak, fade,
          and a relax period. During that relax state the Director maintains a minimal threat population for roughly
          half a minute before beginning another climb.
        </p>
        <p>
          The closing observation in that presentation is easy to miss: the Director adjusts frequency rather than
          amplitude. Enemy difficulty remains available. The game changes how often full pressure arrives. A review
          that demands another problem from every encounter reaches for amplitude because amplitude is visible in a
          room diagram, while frequency only appears when several rooms are played in order.
        </p>
        <p>
          Complexity behaves like suspense here. A blackout matters after you have learned what the lit room permits.
          Crossfire matters after a frontal fight establishes the safe-looking cover. If every encounter begins with
          flanking enemies, breakable floors, and a resource clock, the player may still succeed, but the later
          encounter has nowhere obvious to escalate except more simultaneous administration.
        </p>

        <H2>Spice still has to appear</H2>
        <p>
          Some games really are too flat. When the same enemies arrive in the same geometry and ask for the same
          answer, an additional problem can wake the system up. The mistake is promoting that repair into a minimum
          standard for every room instead of deciding where the new demand changes the rhythm.
        </p>
        <p>
          I cannot give you the correct ratio of plain fights to elaborate ones. Player skill, session length,
          control complexity, and genre move it around. I trust one test more than a slogan: remove the modifier from
          an encounter and ask what the simpler version contributes to the sequence. Keep it when the player gains
          recognition, recovery, confidence, or a baseline the next room intends to break.
        </p>
        <p>
          On the encounter sheet, room twelve says three soldiers on an open floor. Room thirteen adds the balcony,
          and room fourteen cuts the lights halfway through. Delete room twelve and the balcony becomes setup work.
          Keep it, and the first shot from above changes how the player reads the whole room.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
