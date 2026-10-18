import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "A waypoint is part of the level",
  description:
    "Navigation markers change what players have to read in the world, so guidance belongs in level design instead of arriving afterward as a neutral HUD layer.",
  published: "2026-08-10T12:40:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/a-waypoint-is-part-of-the-level-journal.webp",
    alt: "Wind-bent grass and a strip of cloth point along a path toward a distant gate.",
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
          Put a quest diamond over the door at the end of a street and the street can get away with murder. The arch
          can look like the other arches, the road can bend away from the entrance, and the skyline can point somewhere
          else. The diamond has already told you which pixels matter.
        </p>
        <p>
          Remove that marker and the same level inherits a different job. Now the doorway, road, light, motion, sound,
          or distant silhouette has to help the player form a route before they can follow one. A waypoint changes the
          level because it changes which information the level is responsible for carrying.
        </p>
        <p>
          <a href="/articles/camera-control-costs-a-thumb">Camera control costs a thumb</a> treated the view as part of
          the player&apos;s attention budget. Navigation UI spends from the same budget. You can ask the player to read the
          world, read the map, chase a floating icon, or hand the trip to an autopilot, and each choice leaves a different
          amount of attention for the place they are crossing.
        </p>

        <H2>Tsushima made the weather carry the instruction</H2>
        <p>
          Sucker Punch did something lovely with this problem in <em>Ghost of Tsushima</em>. In an official 2020{" "}
          <a href="https://blog.playstation.com/2020/05/29/ghost-of-tsushima-your-questions-answered/">
            question-and-answer post
          </a>, art director Jason Connell says wind and environmental movement were early art-direction goals. A couple
          of years into production, the team wanted to keep players looking at the world and tried using that wind to
          point toward destinations.
        </p>
        <p>
          Lead visual effects artist Matt Vainio&apos;s later{" "}
          <a href="https://blog.playstation.com/2021/01/12/how-stunning-visual-effects-bring-ghost-of-tsushima-to-life/">
            technical breakdown
          </a>{" "}
          shows how much machinery sat underneath the gesture. Trees, grass, cloth, ropes, smoke, sparks, leaves, and
          pollen all consume a shared wind direction. The navigation system could therefore recruit motion already
          distributed across the scene instead of placing a separate arrow above it.
        </p>
        <p>
          Vainio also mentions hand-placing a small number of elements to guide exploration. The level still had to
          communicate alongside the wind. Its designers gained another material they could arrange among the things the
          player was already looking at.
        </p>
        <p>
          I cannot tell from those public posts how much the system changed average map-open time or gaze behavior.
          Those numbers are not public. The design intent is explicit enough: Sucker Punch wanted guidance that kept
          attention in the world, then bent existing environmental technology toward that goal.
        </p>

        <H2>A destination can begin in the skyline</H2>
        <p>
          <em>The Legend of Zelda: Breath of the Wild</em> splits the work differently. Nintendo&apos;s official{" "}
          <a href="https://zelda.nintendo.com/features/">features page</a> tells players to climb towers and mountain
          peaks to search for destinations, then set their own path through the wilderness. The Sheikah Slate still
          gives Link a map, quest tracking, and a scope. The interface helps record intent after the landscape has given
          the player something worth choosing.
        </p>
        <p>
          That shifts work into the view from a hilltop. A shrine, tower, village, strange rock formation, or column of
          smoke can become a proposed destination before a quest log names it. If the terrain produces no readable
          candidates, “go anywhere” collapses into opening the map and picking a symbol anyway.
        </p>
        <p>
          The part that annoys me is the purity contest that sometimes follows. Marker removal exposes whatever
          navigation work the level never learned to do. A level built around explicit routing can become opaque when
          the UI disappears late in production, because nobody asked the roads and landmarks to carry that information
          while the world was being assembled.
        </p>

        <H2>Sometimes draw the route</H2>
        <p>
          Ubisoft&apos;s 2026{" "}
          <a href="https://www.ubisoft.com/en-gb/game/assassins-creed/news/1QoM4qTIi9ERlzDOrxeRgK/assassins-creed-black-flag-resynced-deep-dive-into-the-naval-gameplay">
            naval-design deep dive for <em>Assassin&apos;s Creed Black Flag Resynced</em>
          </a>{" "}
          gives the opposite case without apology. Lead naval designer Guilhem Marin describes Pathfinder, which lets
          the player pin a destination and highlights a route across the water while they keep steering the Jackdaw.
          Follow Sea goes further. It hands navigation over entirely and lets the ship follow the route to its destination.
        </p>
        <p>
          Good. An ocean crossing can serve as logistics once the player has chosen where to go. Pathfinder preserves
          steering while removing repeated heading checks, and autopilot can compress the part of the voyage the player
          has decided not to navigate. The game can spend that travel time on weather, shanties, distant ships, or the
          choice to interrupt the route.
        </p>
        <p>
          Explicit guidance earns its screen space when the route itself carries little uncertainty. The cost rises
          when the game also wants players studying storefronts, reading terrain, noticing a suspicious side road, or
          learning a district well enough to move through it from memory. The marker competes with those signals because
          it offers a cheaper answer to the same question.
        </p>

        <H2>The HUD changes what the graybox can hide</H2>
        <p>
          This is why navigation belongs in a level review before art polish. With the shipped guidance enabled, watch
          what the player actually needs from the geometry. Then hide optional aids and see which assumptions become
          visible: identical doorways, a road that points away from the objective, a landmark obscured from the usual
          approach, or stairs that disappear into the surrounding wall.
        </p>
        <p>
          There is no prize for making every game navigable with the HUD disabled. Some routes are logistics, some
          players need stronger guidance, some worlds are enormous, and sometimes the destination matters more than the
          trip. The useful question is which parts of navigation the environment has agreed to perform and which parts
          the interface performs on purpose.
        </p>
        <p>
          The plastic compass in the header has a needle and a numbered dial. It knows north from any room and nothing
          about doors. In <em>Ghost of Tsushima</em>, the direction indicator ended up in leaves, grass, cloth, and smoke
          that were already moving through the scene.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
