import { articleMeta, type ArticleMeta } from "../../article";
import {
  AnnotatedCode,
  ArticleLayout,
  Callout,
  CodeBlock,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Make the game answer",
  description:
    "A small indie scene can feel connected when one action produces immediate feedback, persistent state, a later world response, and enough quiet for the player to notice.",
  published: "2026-07-18T10:04:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/make-the-game-answer.jpg",
    alt: "A Newton's cradle photographed in black and white with both end balls swung outward mid-exchange.",
    credit: {
      author: "Sheila Sund",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Newton%27s_Cradle_(15221366308).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const powerRestored = `
  function restore_power(world: World) {
    if (world.facts.has("power_restored")) return;
    world.facts.add("power_restored");
    world.feedback.play("breaker_clack", { flash: 0.08, shake: 1 });
    world.rooms.workshop.lights = "on";
    world.echoes.enqueue("radio_returns");
    world.dialogue.unlock("mechanic_noticed_lights");
  }
`;

const workshopDescription = `
  function describe_workshop(world: World): string {
    if (!world.facts.has("power_restored")) {
      return "The radio dial is dark. The shutters will not move.";
    }
    if (!world.facts.has("mechanic_spoke")) {
      return "The radio is warm. Someone has tuned it since you left.";
    }
    return "The workshop hums behind the raised shutters.";
  }
`;

const echoQueue = `
  function play_next_echo(game: Game) {
    const echo = game.echoes.peek();
    if (!echo) return;
    if (game.combat.active || game.ui.blocks_dialogue) return;
    if (!game.player.is_in_safe_space()) return;

    game.echoes.shift();
    echo.play();
  }
`;

const reviewRows = [
  [
    "Combos",
    "Pair acknowledgment with a state change.",
    "What differs ten seconds after the input?",
    "Flip one fact and update one nearby object.",
  ],
  [
    "Conversations",
    "Spend a meaningful fact in another channel later.",
    "Who or what can answer this action?",
    "Add one alternate line, prop state, or ambient cue.",
  ],
  [
    "Clarity",
    "Choose one primary signal for each cause.",
    "Could a tester explain why the change happened?",
    "Quiet competing effects and mirror essential audio visually.",
  ],
  [
    "Pacing",
    "Queue nonurgent responses until the player can receive them.",
    "Is the game asking for attention during another demanding verb?",
    "Wait for a safe space, a menu close, or the end of combat.",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          <a href="/articles/combos-and-conversations">The CCCP essay</a> gave me four words. The useful
          follow-up is one cheap room: a fuse box, a dead radio, a locked workshop shutter, and a mechanic
          waiting outside. If restoring power only flips the objective flag, the interaction is finished in
          code and strangely absent from the game.
        </p>
        <p>
          You do not need a dialogue engine or a cinematic camera to fix it. Let the same event reach a few
          places at different times, then protect the important response from the noise your other systems are
          eager to make.
        </p>

        <H2>One action, several listeners</H2>
        <p>
          Start with one named fact. The fuse box acknowledges the input immediately, changes the room, and
          leaves two responses for later. Direct calls are fine here. An event bus is optional architecture
          rather than part of the design rule.
        </p>
        <AnnotatedCode
          lang="ts"
          title="workshop.ts"
          code={powerRestored}
          notes={[
            { line: 2, note: "The completed action cannot replay its full reward stack on every button press." },
            { line: 3, note: "A persistent fact gives later systems something stable to read." },
            { line: 4, note: "The player gets an immediate local acknowledgment before any delayed response." },
            { line: 6, note: "The radio is queued, so pacing can choose when it speaks." },
            { line: 7, note: "Dialogue receives the same event without duplicating the fuse-box logic." },
          ]}
          caption="One interaction commits state now and creates two opportunities for the world to answer later."
        />
        <p>
          The rule of thumb is small: a meaningful action gets one immediate acknowledgment and one
          persistent consequence. Ask what still differs ten seconds later. When the answer is only a particle
          emitter, you paid for feedback and left the world untouched.
        </p>
        <Callout variant="tip" title="Keep ordinary actions ordinary">
          <p>
            Walking, scrolling, and repeated attacks often need clean feedback rather than four layers of
            response. Save the full treatment for discoveries, state changes, risky choices, and UI actions that
            commit something the player will care about later.
          </p>
        </Callout>
        <p>
          <a href="https://www.gdcvault.com/play/1016789/Juice-It-or-Lose">“Juice It or Lose It”</a>{" "}
          shows how much motion, sound, and particles can add to a bare interaction. The useful constraint comes
          from asking whether each effect confirms the same event. A wobbling stone that sounds like metal has
          plenty of response and no agreement.
        </p>

        <H2>Spend the fact somewhere else</H2>
        <p>
          Conversation starts when another part of the game reads <code>power_restored</code>. You can afford
          this in a tiny game because the echo does not need a branching narrative tree. One changed description
          already tells the player that the room remembers.
        </p>
        <CodeBlock lang="ts" title="workshop-description.ts" highlight="2-9" code={workshopDescription} />
        <p>
          Keep the fact named after what happened, not after the reward you currently plan to attach. The radio,
          mechanic, shutter, and save file can all understand <code>power_restored</code>; a flag named{" "}
          <code>play_mechanic_line_04</code> welds the world to one implementation and becomes embarrassing the
          moment you cut that line.
        </p>
        <p>
          <a href="https://www.worch.com/2010/03/11/gdc-2010/">
            Worch and Smith&apos;s environmental-storytelling work
          </a>{" "}
          treats spaces as evidence the player can pull meaning from. A practical indie version is one fact spent
          once outside the original interaction: an NPC notices the lights, the radio picks up a station, or the
          workshop description changes. Which object in your scene is currently waiting for permission to become
          specific?
        </p>

        <H2>Protect the response</H2>
        <p>
          Pacing does not require an AI director. A three-line guard can stop the radio from speaking over combat,
          a modal screen, or a room where the player cannot safely listen.
        </p>
        <CodeBlock lang="ts" title="world-echoes.ts" highlight="2-5,7-8" code={echoQueue} />
        <p>
          This queue also improves clarity because the delayed line arrives without a reward banner and three
          enemies competing for the same second. Essential information still needs more than sound; the{" "}
          <a href="https://gameaccessibilityguidelines.com/basic/">Game Accessibility Guidelines</a>{" "}
          recommend keeping critical meaning out of audio alone, so the restored radio can light its dial or add
          a readable transcript entry.
        </p>
        <DataTable
          head={["Pass", "Rule of thumb", "Question", "Small patch"]}
          rows={reviewRows}
          caption="A compact review pass for one interaction, with changes that do not require another subsystem."
        />
        <p>
          Add the radio line last, then trigger the fuse while the objective banner is open. If the subtitle sits
          underneath the banner, keep the screenshot in the issue. It is more useful than another round of “the
          scene feels flat.”
        </p>
      </Prose>
    </ArticleLayout>
  );
}
