import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Give the enemy one job",
  description:
    "Readable enemy roles let encounter designers build complexity through composition instead of packing every possible pressure into every unit.",
  published: "2026-08-06T12:39:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/give-the-enemy-one-job-journal.webp",
    alt: "Three animal fighters carry distinct weapons beside an overarmed figure.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const infectedRows = [
  [
    "Hunter",
    "Punish stragglers and lone-wolf play",
    "A fast pounce that fully incapacitates one survivor",
    "Close distance and rescue the isolated player",
  ],
  [
    "Smoker",
    "Pull apart a tightly coordinated team",
    "A long-range tongue attack from another position",
    "Break the line and recover the dragged teammate",
  ],
  [
    "Boomer",
    "Break the habit of shooting everything immediately",
    "Vomit and an explosive body that call a mob onto the victim",
    "Check the target, hold fire, then prepare for the horde",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          The new enemy can raise a shield, blink behind cover, throw a grenade, summon a drone, and enrage below
          half health. In the graybox that looks generous: five behaviors for one model, five reasons for the player
          to keep paying attention. Put it in a crowded room and the generosity collapses into one loud humanoid with
          no stable meaning.
        </p>
        <p>
          You should be able to answer one question before polishing the animation: what job does this enemy perform
          in the encounter? Give it one dominant pressure, then let geometry and the rest of the roster complicate
          the answer. The complexity comes back later, when simple pieces start overlapping.
        </p>
        <p>
          <a href="/articles/let-the-easy-fight-live">Let the easy fight live</a> argued that ordinary encounters
          preserve contrast across a sequence. The same economy applies inside combat. A room can ask several
          questions when each enemy gives the player a clean first read.
        </p>

        <H2>Put the problem in the roster</H2>
        <p>
          Valve&apos;s presentation on{" "}
          <a href="https://cdn.fastly.steamstatic.com/apps/valve/2009/GDC2009_ReplayableCooperativeGameDesign_Left4Dead.pdf">
            replayable cooperative design in <em>Left 4 Dead</em>
          </a>{" "}
          is unusually blunt about the Special Infected: each special ability exists to address a specific gameplay
          issue. The slides name the purpose before they describe the attack, which is a lovely order for a design
          document because the verb has to justify its place.
        </p>
        <DataTable
          head={["Enemy", "Purpose in the team", "How the role appears", "What the survivors must do"]}
          rows={infectedRows}
          caption="Three Special Infected from Valve's design slides, organized by the player behavior each one pressures."
        />
        <p>
          These enemies still need navigation, target selection, timing, vulnerability, and enough variation to avoid
          becoming wind-up toys. Their dominant jobs stay narrow. The Hunter punishes separation, the Smoker creates
          separation, and the Boomer makes a familiar shooting rule dangerous for a moment.
        </p>
        <p>
          Now the encounter designer has combinations. A Boomer can mark one survivor while a Smoker pulls the nearest
          rescuer out of position, giving a Hunter an opening without handing it either mechanic. Why give the grenade
          to the teleporter too?
        </p>

        <H2>The silhouette carries the contract</H2>
        <p>
          A purpose line hidden in a spreadsheet does nothing for the player. Valve&apos;s earlier{" "}
          <a href="https://cdn.fastly.steamstatic.com/apps/valve/2008/GameFest08_ArtInSource.pdf">
            art-direction presentation for <em>Team Fortress 2</em>
          </a>{" "}
          describes a read hierarchy: identify the team, identify the class, then identify the selected weapon. Class
          recognition leans on distinctive silhouettes and body proportions, while the weapon sits in the area of
          highest visual contrast.
        </p>
        <p>
          The hierarchy lets the player use the art as combat information. When an enemy&apos;s outline, movement, sound,
          and attack windup all point toward the same job, you can read the threat while moving and spend attention on
          the room around it. When those channels disagree, the player waits for the attack to begin and learns the
          unit by getting hit.
        </p>
        <p>
          Character artists should still add personality, secondary motions, damage states, and the small asymmetries
          that keep a roster from looking like road signs. I cannot give a universal limit for how much detail the
          first read can carry; camera distance, animation speed, genre, and input demands move it around. The useful
          test is whether a player can name the pressure before reciting the move list.
        </p>

        <H2>Readable enemies make harder rooms</H2>
        <p>
          Subset Games describes <em>Into the Breach</em> with a promise that sounds almost reckless: on the game&apos;s{" "}
          <a href="https://www.subsetgames.com/itb.html">official page</a>, all enemy attacks are telegraphed. The
          player can inspect the coming damage before committing a move. That information does not drain the game of
          difficulty because the board combines displacement, terrain, civilian buildings, attack order, and several
          enemy roles into one turn.
        </p>
        <p>
          Real-time combat has no room for a full turn queue, yet reliable roles can spend less of the player&apos;s
          attention on identifying what a unit might do. More of that bandwidth remains available for position,
          priority, resource use, and the ugly interaction between two individually familiar threats.
        </p>
        <p>
          Bosses get more room to carry a paragraph. A dedicated arena, camera framing, music, repeated attempts, and
          phase breaks can support a broader move set because the player has time to study one subject. Ordinary units
          rarely receive that attention. They enter beside effects, objectives, allies, and other enemies, then ask to
          be understood before the next half-second closes.
        </p>
        <p>
          Valve&apos;s Hunter slide puts one line above the pounce: “Purpose: Outrun and kill stragglers and lone wolf
          players.” The attack sits underneath as the implementation. That order is worth keeping in the graybox file,
          especially when the next enemy pitch arrives with six verbs and nowhere to stand.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
