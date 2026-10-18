import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "The attack starts before the hit",
  description:
    "Startup, contact, and recovery form one readable action; animation, sound, and effects should tell the player what is coming before damage asks for an answer.",
  published: "2026-08-13T12:40:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-attack-starts-before-the-hit-journal.webp",
    alt: "A mouse rides a wooden clockwork boat with its sprung bow raised above a rocky stream.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const attackSequence = [
  {
    title: "Announce",
    detail: "Pose, motion, sound, or VFX identifies the attack family before it can hurt the player.",
  },
  {
    title: "Commit",
    detail: "The startup motion narrows what the attacker can still do and gives the player a response window.",
  },
  {
    title: "Contact",
    detail: "The hitbox, projectile, or hazard becomes dangerous and cashes in the earlier warning.",
  },
  {
    title: "Recover",
    detail: "Follow-through leaves an opening, returns the attacker toward neutral, or makes the cost of the action visible.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Take an enemy overhead swing that feels fair and shave a little time off the front. The damage is unchanged,
          the hitbox is unchanged, and the animation may still look better because it feels snappier. From the player's
          chair, though, you removed part of the interface. The missing frames were where the attack said what it was.
        </p>
        <p>
          <a href="/articles/give-the-enemy-one-job">Give the enemy one job</a> treated an enemy's role as something the
          player should be able to read. <a href="/articles/keep-the-threat-where-you-left-it">Keep the threat where you
          left it</a> followed that readability outside the camera. The same problem exists in time. A threat can be
          perfectly visible and still become unreadable if its meaning arrives after the player needed to choose a
          response.
        </p>
        <p>
          An attack is not the instant where damage happens. It starts earlier and ends later, and those quieter parts
          are doing gameplay work.
        </p>

        <H2>The hitbox is the middle of the move</H2>
        <p>
          Capcom's official <em>Street Fighter V</em>{" "}
          <a href="https://game.capcom.com/cfn/sfv/column/131432?lang=en">seminar on attack composition</a> splits an
          attack into startup, active frames, and recovery. Startup is the time before the attack can hit. Active frames
          are when its hitbox is live. Recovery is the period after that where the attacker cannot act normally yet.
          Fighting games name these pieces because a few frames can change which action wins, but the structure exists in
          a monster swing or a shooter melee attack too.
        </p>
        <p>
          The useful part is that only one of those phases deals damage. Startup gives the opponent something to notice.
          Recovery gives them something to earn. If a move is dangerous immediately and then snaps straight back to
          safety, most of the decision has been compressed into the contact frame.
        </p>

        <FlowSequence
          steps={attackSequence}
          caption="A readable attack spends time before contact establishing intent, then leaves enough aftermath for the player to understand what the commitment cost."
        />

        <p>
          Capcom describes almost the same thing from the other side of the screen in its interview with the animation
          team for{" "}
          <a href="https://news.capcomusa.com/2023/04/07/animating-the-monsters-of-sunbreak/">
            <em>Monster Hunter Rise: Sunbreak</em>
          </a>
          . Monster animations begin from a gameplay design document, then temporary animations are tested and adjusted
          alongside game design and VFX. The animator interviewed says familiarity with a monster means recognizing most
          attacks from their startup animation and knowing when the monster will be open to a counterattack.
        </p>
        <p>
          That workflow matters. The tell is not polish applied after the attack has already been balanced. The motion is
          part of how the balance becomes playable.
        </p>

        <H2>The tell can carry the rule</H2>
        <p>
          Guerrilla describes enemy animation in <em>Horizon Forbidden West</em> in similarly practical terms. Its{" "}
          <a href="https://blog.playstation.com/2021/12/06/horizon-forbidden-west-outsmart-your-enemies/">
            combat breakdown
          </a>{" "}
          says classes and machines communicate their gameplay function through actions, posture, motion, and readable
          silhouettes. The team adjusts timing to create windows to strike, block, or run. Audio does parallel work:
          melee sounds build toward impact while ranged weapons have charge-up or projectile cues that can pull attention
          toward the most immediate threat.
        </p>
        <p>
          A tell becomes especially important when similar attacks demand different answers. Santa Monica Studio's{" "}
          <a href="https://blog.playstation.com/2019/02/01/how-santa-monica-studio-created-god-of-wars-greatest-challenge/">
            account of the Valkyries in <em>God of War</em>
          </a>{" "}
          describes two ranged attacks that deliberately punish opposite defensive habits. One begins with the Valkyrie's
          arms held horizontally and is best blocked. The other begins with her arms raised vertically and must be dodged.
          The pose is not an animation flourish around the rule. It is where the rule becomes available to the player.
        </p>
        <p>
          This suggests a better review question than “is the tell obvious enough?” Ask whether the tell distinguishes the
          decisions that actually differ. Two attacks can share color, size, and dramatic energy if the same response beats
          both. If one must be blocked and the other dodged, hiding that branch until the weapon is already moving at full
          speed asks for memorization of a failure rather than recognition of a choice.
        </p>

        <H2>Noise can still have a beginning</H2>
        <p>
          <em>Returnal</em> is useful because it has no interest in keeping the screen quiet. Housemarque's article on{" "}
          <a href="https://blog.playstation.com/2021/04/14/creating-returnals-otherworldly-enemies-vfx-driven-tentacle-tech-and-deep-sea-inspirations/">
            creating its enemies
          </a>{" "}
          describes bright emissive tentacles that telegraph incoming attacks and an “energy signature” carried from
          enemies into their projectiles. In a later VFX breakdown, the team says tentacle behavior could be forced into a
          particular motion while an enemy prepared an attack, with timings iterated together with designers.
        </p>
        <p>
          The screen can therefore contain hundreds of projectiles without every attack becoming anonymous. Visual noise
          and readable timing are not opposites. The important thing is that the player can learn when an object changes
          from scenery or motion into a commitment they need to answer. In a crowded game that transition may be a glow,
          a sound, a pose, a trail, or several of them at once.
        </p>
        <p>
          This also connects back to off-screen combat. A directional arrow can tell you where an attack is coming from;
          a charge sound can tell you when it is becoming dangerous. Position and timing are separate questions, and a
          good encounter often needs both answered before the impact frame.
        </p>

        <H2>Fast is not the same as hidden</H2>
        <p>
          None of this requires every enemy to wind up like a stage actor. Capcom's frame-data lesson is explicit that
          shorter startup is generally stronger. Fast attacks are useful. They make spacing matter, punish slow decisions,
          and give a roster different tempos. A game can also ask players to predict rather than react once they understand
          the surrounding rules.
        </p>
        <p>
          The problem begins when speed erases the information that makes the decision intelligible. If two attacks need
          different defenses, the distinguishing cue has to arrive before that defensive choice is effectively locked in.
          If an attack has tiny startup, its range, context, sound, posture, or previous state may need to carry more of the
          warning. If the player avoids it correctly, recovery can make the read matter by providing an opening instead of
          immediately starting another equally ambiguous attack.
        </p>
        <p>
          I would review one troublesome attack frame by frame and mark four moments: when the player can first identify
          the attack family, when the attacker becomes committed, when contact becomes dangerous, and when the attacker is
          free again. Then play it at speed and listen with the picture hidden. If the important branch only becomes clear
          after the response had to begin, make the startup say more or make the possible answers less different.
        </p>
        <p>
          The clockwork ship in the header stores its motion before it moves. A game attack does not need to show its
          machinery, but the player should be able to see some sign of the stored action before it is released. The hit is
          the loud part. The design started a few frames earlier.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
