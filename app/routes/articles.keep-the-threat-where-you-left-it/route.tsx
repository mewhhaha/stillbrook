import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Keep the threat where you left it",
  description:
    "When enemies leave the frame, predictable positioning and layered cues preserve the player's mental map; a warning arrow cannot repair a threat that moves in ways the camera hides.",
  published: "2026-08-12T12:38:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/keep-the-threat-where-you-left-it-journal.webp",
    alt: "A traveler carries a bronze mirror reflecting soldiers on the path behind him.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const offscreenSequence = [
  {
    title: "See",
    detail: "The player notices an enemy, its direction, and roughly how far away it is.",
  },
  {
    title: "Turn",
    detail: "The camera leaves the enemy behind, but the player's last observation remains useful memory.",
  },
  {
    title: "Preserve",
    detail: "Movement rules keep the unseen enemy in a place the player could reasonably predict from what they saw.",
  },
  {
    title: "Signal",
    detail: "Audio, indicators, dialogue, or another channel reports a meaningful change such as an incoming attack.",
  },
  {
    title: "Reacquire",
    detail: "When the player looks back, the enemy's new position makes sense as a continuation of the old one.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Turn the camera away from an enemy and the game asks the player to remember a place that is no longer on the
          screen. The swordsman was behind and a little left. The archer was farther back by the pillar. For the next few
          seconds those positions exist mostly in the player's head, which means the simulation can either preserve that
          memory or make it quietly false.
        </p>
        <p>
          <a href="/articles/camera-control-costs-a-thumb">Camera control costs a thumb</a> argued that framing is player
          work. <a href="/articles/lock-on-schedules-the-crowd">Lock-on schedules the crowd</a> followed the problem into
          target selection and enemy aggression. There is another piece sitting just outside both articles: what an enemy
          is allowed to do while the camera cannot see it.
        </p>
        <p>
          An off-screen warning is useful, but it arrives late in the chain. Before the arrow, bark, or vibration can mean
          anything, the game needs a stable answer to a simpler question: where did that enemy go?
        </p>

        <H2>God of War stopped moving the blind spot</H2>
        <p>
          Santa Monica Studio's 2019 GDC presentation on{" "}
          <a href="https://media.gdcvault.com/gdc2019/presentations/Sheth_Mihir_EvolvingCombat.pdf">
            evolving combat for <em>God of War</em>
          </a>{" "}
          describes this problem in unusually concrete terms. The closer camera made groups hard to read, so the team
          first tried arranging aggressive enemies in a crescent in front of Kratos. That kept active threats visible,
          but it created a strange side effect: an enemy behind Kratos that became aggressive would walk toward the front
          of the formation, sometimes moving straight into his back while trying to get on screen.
        </p>
        <p>
          The presentation says players struggled to maintain a mental map of the fight. The eventual fix was not merely
          a brighter indicator. Santa Monica changed the positioning rules so an enemy that went off screen generally
          stayed off screen until the player looked toward it again, and off-screen enemies were kept in roughly the same
          world-space quadrant relative to Kratos. If you last saw someone behind-left, turning right did not give that
          enemy permission to drift somewhere entirely different just because the AI found a better attack slot.
        </p>
        <p>
          That is a wonderfully artificial rule in service of a more believable fight. Real opponents do not promise to
          preserve your mental map. Game enemies already know the camera exists, though, and this system used that
          knowledge to keep unseen movement continuous with what the player had actually observed. The team reports that
          the resulting predictability helped players take more risks and stay offensive in playtests.
        </p>

        <FlowSequence
          steps={offscreenSequence}
          caption="An off-screen threat stays legible when the game preserves the player's last observation before asking another channel to report what changed."
        />

        <H2>The arrow comes after the positioning</H2>
        <p>
          Santa Monica still needed UI. The same presentation walks through several experiments for off-screen enemies.
          Flashing the edge of the screen was read as damage feedback, so the team eventually used arrows around Kratos:
          red for incoming attacks, quieter white arrows for nearby idle enemies, and a different treatment for ranged
          threats. The interesting sentence comes immediately after that work. The designers say the cleaner positioning
          system made those indicators more stable, predictable, and easier to process.
        </p>
        <p>
          This reverses a common production order. It is tempting to let AI move however it wants, notice that players
          get hit from behind, and ask UI for a directional warning. The warning can report a bad state accurately and
          still fail to make the state understandable. If an icon jumps from left to right because the enemy crossed the
          player's blind spot at full speed, the HUD has become a live debugger for movement the player never witnessed.
        </p>
        <p>
          <em>Returnal</em> takes a different deal because threats from every direction are part of its bullet-hell
          identity. In Housemarque's{" "}
          <a href="https://blog.playstation.com/2021/04/29/returnal-survival-guide-housemarques-gameplay-tips-for-atropos/">
            official survival guide
          </a>
          , game director Harry Krueger calls attention the player's most valuable resource during combat and explicitly
          tells players to combine an off-screen threat indicator, a glance at the minimap, and audio cues for incoming
          attacks. The game does not pretend the camera can hold the whole arena. It gives the player several cheap ways
          to sample what the frame omits.
        </p>
        <p>
          The useful distinction is not HUD versus no HUD. It is whether each channel describes a threat model the player
          can keep in their head. A wide bullet-hell arena can justify a busier warning layer. A close melee game may get
          more value from constraining unseen movement first and letting the indicator stay quiet until something changes.
        </p>

        <H2>Accessibility can change the threat itself</H2>
        <p>
          Naughty Dog's{" "}
          <a href="https://blog.playstation.com/2020/06/09/the-last-of-us-part-ii-accessibility-features-detailed/">
            accessibility documentation for <em>The Last of Us Part II</em>
          </a>{" "}
          makes the boundary especially clear. It offers awareness indicators that can persist during combat and point
          toward high-threat enemies, directional subtitle arrows for off-screen speakers, combat audio cues, and
          auto-targeting that can acquire an enemy even when the target is off screen. Those are all ways to return
          information the camera or another sensory channel may hide.
        </p>
        <p>
          It also includes an option called "Enemies Don't Flank." That setting does not explain an off-screen threat more
          clearly; it changes whether enemies intentionally create one behind the player. This matters because some
          visibility problems are not interface problems. If the challenge depends on information a player cannot
          reliably access, the fair adjustment may be to alter the behavior that generates the hidden information.
        </p>
        <p>
          Ubisoft describes the same principle from another direction in its discussion of accessibility work on{" "}
          <a href="https://montreal.ubisoft.com/en/accessibilitys-quest-to-welcome-more-players-from-origins-to-the-future/">
            <em>Prince of Persia: The Lost Crown</em>
          </a>
          . Its combat attacks use color, lighting, shapes, and sound cues so the timing is available through more than
          one pathway. The stated goal is not to remove the intended challenge, but to stop a player's disability from
          becoming an extra challenge layered on top of it.
        </p>
        <p>
          I would test an encounter by choosing one ordinary enemy, looking at it, then deliberately turning away. Move
          for a few seconds and look back. Is the enemy somewhere that follows from the last thing you saw? If it attacked
          while hidden, did at least one available channel tell you what changed? If the answer depends on a minimap,
          mute the minimap. If it depends on sound, mute the sound. The point is not that every game must duplicate every
          cue, but that the blind spot should be designed as deliberately as the part of the arena inside the frame.
        </p>
        <p>
          Horror can break this contract on purpose. A competitive game can make incomplete information part of the
          skill test. An enemy that disappears behind a column may be frightening precisely because you cannot be sure
          where it went. That uncertainty still works better when it belongs to the fiction and the rules instead of
          arriving because an AI steering behavior took a shortcut through space the camera happened not to show.
        </p>
        <p>
          The rear-view mirror in the header does not make the cars behind you harmless. It gives them a place. Turn your
          eyes back to the road and you still carry a rough map of what was there. Off-screen combat needs the same small
          courtesy before it asks the player to react to something they cannot currently see.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
