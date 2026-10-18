import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The menu owns the clock",
  description:
    "Weapon wheels, command menus, quick swaps, and live inventories change how much time the player has to choose, so selection UI belongs in combat pacing rather than outside it.",
  published: "2026-08-15T12:37:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-menu-owns-the-clock-journal.webp",
    alt: "A fighter selects a carved weapon wheel while a charging beast hangs in slowed time.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const selectorRows = [
  [
    "Near-pause command menu",
    "Nearly stops the world",
    "Compare abilities, resources, and targets",
    "Planning is meant to be part of the combat turn",
  ],
  [
    "Slow-motion wheel",
    "Reduces pressure while held",
    "Choose among several equipped tools",
    "Breadth matters more than menu-navigation speed",
  ],
  [
    "Quick swap or direct bind",
    "Keeps full combat speed",
    "Remember a small mapping and commit immediately",
    "Rapid chaining and practiced execution matter",
  ],
  [
    "Live inventory",
    "Keeps full combat speed and covers some view",
    "Plan before opening or accept exposure",
    "The menu is supposed to preserve tension",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Hold the weapon button while something large is charging at you. Six tools fan out across the screen and the
          world slows down. You have not left combat. You have changed its clock.
        </p>
        <p>
          Remove that slowdown and the same weapon roster asks for faster recognition and cleaner thumb movement. Replace
          the wheel with direct binds and an experienced player can skip the menu entirely. Freeze the world and the
          selection becomes a planning turn. The same icons can sit over a much different fight.
        </p>
        <p>
          <a href="/articles/camera-control-costs-a-thumb">Camera control costs a thumb</a> treated input and attention as
          resources rather than free controller furniture. <a href="/articles/defense-should-buy-something">Defense should
          buy something</a> treated time and initiative as part of a successful defensive action. A combat selector sits
          between those arguments. It decides how much attention choosing a tool costs and how much time the game grants
          while the player pays it.
        </p>

        <H2>The wheel has a time scale</H2>
        <p>
          Guerrilla exposes this more plainly than most games do. In the official <em>Horizon Forbidden West</em>{" "}
          <a href="https://blog.playstation.com/2022/02/10/accessibility-features-in-horizon-forbidden-west/">
            accessibility overview
          </a>, players can adjust how much the game slows while the Weapon Wheel is open. The same settings also offer a
          one-tap Quick Swap between weapons.
        </p>
        <p>
          Those two options solve different problems. The wheel preserves access to a broad loadout while buying time to
          inspect it. Quick Swap reduces the inspection step when the player already knows what they want. One changes
          the clock; the other changes the amount of interface work that has to happen before the next shot.
        </p>
        <p>
          Calling the slowdown an accessibility setting does not make it separate from combat design. It makes the design
          variable visible. A player who needs more time to parse the wheel can receive it without changing enemy health,
          weapon damage, or the number of machines in the arena. The difficulty adjustment lives in the selection window.
        </p>

        <DataTable
          head={["Selector", "What happens to time", "Player task", "Useful when"]}
          rows={selectorRows}
          caption="Four selection models can expose similar tactical breadth while asking for very different amounts of time pressure and input fluency."
        />

        <H2>DOOM lets practice erase the wheel</H2>
        <p>
          id Software takes the same problem and gives experienced play a fast lane. Bethesda's official look at the
          2016 <em>DOOM</em>{" "}
          <a href="https://bethesda.net/en-US/news/inside-doom%27s-brutally-fast-single-player-campaign">
            single-player campaign
          </a>{" "}
          shows a quick tap and flick switching weapons without opening the wheel at all. The article also describes a
          progression setup that makes weapon switching faster because maintaining speed is part of the intended style.
        </p>
        <p>
          The control split has survived because it solves a useful tension. A hold can expose the full selector while a
          press performs a quick switch. <em>DOOM Eternal</em> later added a configurable Weapon Wheel Open Delay so the
          player could tune the boundary between those two gestures. The current{" "}
          <a href="https://slayersclub.bethesda.net/en-ZA/article/doom-the-dark-ages-accessibility-guide">
            <em>DOOM: The Dark Ages</em> accessibility guide
          </a>{" "}
          still distinguishes hold-to-open from press-to-quick-swap, supports individual keyboard binds, and notes that
          opening the weapon wheel applies its own time scaling.
        </p>
        <p>
          That is not a neutral menu implementation. The beginner can stop hunting for a key while eight weapons are
          still unfamiliar. The practiced player can collapse selection into a remembered gesture and keep the combat at
          full speed. Mastery removes interface time instead of merely increasing damage output.
        </p>

        <H2>Sometimes the menu is the turn</H2>
        <p>
          <em>Final Fantasy VII Remake</em> goes the other direction. Square Enix's own rules for its{" "}
          <a href="https://www.square-enix-games.com/documents/final-fantasy-vii-remake-tacticalmodetuesday-contest">
            Tactical Mode promotion
          </a>{" "}
          describe the mode simply as combat where time slows down. In play, the command menu is where abilities, spells,
          and items are chosen after the player has earned ATB through the real-time layer.
        </p>
        <p>
          The slowdown protects deliberation because deliberation is one of the skills the game wants. You can keep
          attacking, positioning, blocking, and filling gauges in real time, then spend a moment comparing the expensive
          options without also being tested on how quickly your eyes can travel down a menu. The interface is not a break
          from the battle system. It is where one part of the battle system happens.
        </p>
        <p>
          A designer can still make those decisions urgent through resources, enemy states, expiring stagger windows, or
          the cost of waiting before opening the menu. The important distinction is that the game does not accidentally
          turn command navigation into another dexterity check just because the rest of the presentation is real-time.
        </p>

        <H2>Dead Space refuses the shelter</H2>
        <p>
          There are games where pausing would damage the point. In a contemporary{" "}
          <a href="https://www.gamedeveloper.com/design/a-new-vocabulary-for-development-chuck-beaver-and-i-dead-space-i-">
            interview about the first <em>Dead Space</em>
          </a>, creative director Chuck Beaver explained that the team deliberately kept the pause out of the inventory
          system. The player could still pause the game explicitly, but opening the inventory would not magically stop
          danger while Isaac rearranged equipment. The goal was to preserve apprehension and lethal pressure.
        </p>
        <p>
          That choice makes the inventory screen part of survival-horror positioning. Opening it beside a sealed door is
          different from opening it in a room where a Necromorph may still be moving. The holographic presentation gets
          most of the attention because it looks unusual, but the more important rule is temporal: the world keeps its
          claim on the next second.
        </p>
        <p>
          The original interview is still useful because it keeps the counterexample honest. Slowing time is not
          automatically considerate design, and real-time menus are not automatically hostile design. If the game wants
          preparation and vulnerability to matter, leaving the clock running can make the selection itself a risk. The
          mistake would be inheriting that behavior without deciding whether the risk belongs there.
        </p>

        <H2>Review the selector with the fight running</H2>
        <p>
          A weapon wheel is easy to review in a UI mockup because the labels are clean and nothing is trying to kill the
          cursor. I would test it again with the encounter at full speed. How long does a new player spend finding the
          right tool? What is visible behind the selector? Does the game slow, stop, or continue? Can practice remove some
          of that cost through quick swap or direct binds? When the menu closes, does the player know what changed while
          their attention was elsewhere?
        </p>
        <p>
          This is also a useful place for accessibility controls because the variable is unusually separable. A wheel can
          slow more without changing the weapon roster. A hold can become a toggle. A quick-swap input can bypass repeated
          navigation. The player can receive more decision time without asking every enemy in the game to wait longer
          before attacking.
        </p>
        <p>
          The stopwatch in the header has three buttons because timing is its whole job. A weapon wheel looks like it is
          about icons and slots, but it has a clock too. Decide who gets those seconds before polishing the radial menu.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
