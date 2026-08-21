import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Defense should buy something",
  description:
    "A successful block, parry, dodge, or dash should change the next moment by buying time, space, position, posture damage, or initiative instead of only postponing the same pressure.",
  published: "2026-08-14T12:37:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/28/Jacques_Callot%2C_Duel_with_Swords_and_Daggers%2C_c._1617%2C_NGA_36565.jpg",
    alt: "Jacques Callot's small etching shows two duelists meeting crossed blades, each holding a sword and dagger as they lean into the exchange.",
    credit: {
      author: "Jacques Callot",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Jacques_Callot,_Duel_with_Swords_and_Daggers,_c._1617,_NGA_36565.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const defenseRows = [
  {
    name: "Guard",
    values: [
      "Low timing demand; may cost structure, stamina, chip damage, or position",
      "Safety and information while the enemy finishes its sequence",
      "The player survives but never gets closer to acting",
    ],
  },
  {
    name: "Parry or deflect",
    values: [
      "Precise timing and a read on the incoming attack",
      "Initiative, posture damage, stun, or a direct counter window",
      "The risky input feels like a stricter version of block",
    ],
  },
  {
    name: "Dodge or avoid",
    values: [
      "Timing plus a direction or body-position choice",
      "Space, angle, balance recovery, or access to the enemy's recovery",
      "The player exits danger and immediately has to flee again",
    ],
  },
  {
    name: "Dash-through",
    values: [
      "Movement timing while tracking several threats at once",
      "Continued motion and offense through a projectile pattern",
      "Evasion interrupts the game instead of preserving its flow",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Block the whole string. Six attacks land on the guard, the health bar stays put, and the enemy returns to
          neutral. Then it starts the string again. The defense worked in the narrowest possible sense: nothing hurt you.
          After a few repetitions, though, the question becomes what the successful read was supposed to change.
        </p>
        <p>
          <a href="/articles/the-attack-starts-before-the-hit">The attack starts before the hit</a> argued that a threat
          has to reveal its decision before the player needs to answer it. That is only half of the exchange. Once the
          player gives the right answer, the game has to decide what that answer buys.
        </p>
        <p>
          It does not always need to buy a free attack. It can buy time, distance, a better angle, posture damage, a
          resource swing, or simply the ability to keep doing what the player was doing. The useful test is whether the
          state after good defense differs from the state before it.
        </p>

        <H2>Not taking damage is the floor</H2>
        <p>
          Fighting games make this question easy to measure because both characters recover on a clock. Capcom's official{" "}
          <em>Street Fighter V</em>{" "}
          <a href="https://game.capcom.com/cfn/sfv/column/131611?lang=en">seminar on advantage and disadvantage</a>{" "}
          defines advantage as the gap where one character can move while the other still cannot. A punish is an attack
          that lands while the original attacker is still stuck in that disadvantage.
        </p>
        <p>
          The numbers are genre-specific, but the idea travels well. Defense is partly about deciding who owns the next
          useful moment. If blocking a dangerous move leaves the attacker recovering for longer, the defender can move,
          reposition, or attack. If the move is safe, the reward may only be that the pressure ended without damage. Both
          are valid, but they produce very different rhythms.
        </p>
        <p>
          This is why a defensive mechanic cannot be judged only by its invulnerability window or damage reduction. The
          aftermath matters just as much. A generous dodge that always returns the player to a losing position can feel
          more exhausting than a stricter parry that clearly hands them the next beat.
        </p>

        <Compare
          attributes={["What it costs", "What success can buy", "Failure when the payoff is missing"]}
          entities={defenseRows}
          caption="Different defensive actions can pay out in different currencies. They do not all need a punish window, but success should usually alter the next decision."
        />

        <H2>Sifu makes the payment visible</H2>
        <p>
          Sloclap describes <em>Sifu</em>'s defensive options in terms of what they create rather than only what they stop.
          In its official{" "}
          <a href="https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/">combat-system overview</a>,
          normal blocking fills the player's Structure gauge. Dodges create space. A correctly timed parry deflects the
          blow, unbalances the opponent, and opens a counterattack or throw. Avoiding a strong hit can recover balance and
          lead directly back into offense.
        </p>
        <p>
          Those defenses therefore sit on different points of a risk-and-payoff curve. Guarding is dependable but cannot
          be the permanent answer because Structure eventually breaks. Parrying asks for more timing precision and pays
          by disturbing the opponent. Avoiding changes position and can recover the defender's own balance. The buttons are
          not interchangeable shields with different animations.
        </p>
        <p>
          Sloclap's own boss advice makes the cadence explicit: observe patterns, look for the opportunity near the end of
          an attack cycle, then counter immediately after a successful avoid or parry. The defense is satisfying because
          the enemy's sequence has an exit. Learning the pattern eventually changes the player from someone weathering it
          into someone waiting for the handoff.
        </p>

        <H2>Sekiro lets defense advance the win condition</H2>
        <p>
          <em>Sekiro: Shadows Die Twice</em> goes further. Activision's official{" "}
          <a href="https://support.activision.com/sekiro/articles/sekiro-shadows-die-twice-game-mechanics">
            mechanics guide
          </a>{" "}
          explains that a deflect both prevents the incoming hit and damages the enemy's Posture. A successful deflect can
          also create a Counter-slash opportunity, and breaking Posture exposes the enemy to a Deathblow.
        </p>
        <p>
          That changes the meaning of defense. Waiting safely is not separate from winning; good defense is one of the ways
          the player moves the fight toward its finish. The result is the familiar sword-clash rhythm where attacking and
          deflecting can alternate without feeling like offense has stopped. Both sides are still contesting the same
          resource.
        </p>
        <p>
          The important part is not that every action game should copy Posture. It is that the game has made the reward for
          reading an attack concrete. A deflect is not merely a smaller health loss. It leaves the opponent in a measurably
          worse state and may open the next action immediately.
        </p>

        <H2>Some defenses buy motion instead of a turn</H2>
        <p>
          A bullet-hell shooter would become strange if every successful dodge stunned the room and presented a polite
          counter window. Housemarque's official{" "}
          <a href="https://blog.playstation.com/2021/04/28/returnal-survival-guide-housemarques-gameplay-tips-for-atropos/">
            <em>Returnal</em> survival guide
          </a>{" "}
          tells players to keep moving, use hip fire for awareness, and dash through most enemy projectiles without taking
          damage. The dash pays out by preserving movement through the pattern.
        </p>
        <p>
          That is still a state change. The player has crossed the dangerous line, kept a route open, and often maintained
          fire while the projectile field continues behind them. The reward is continuity rather than turn ownership.
          This fits a game where several threats remain active at once and attention, not a one-on-one exchange, is the
          scarce resource.
        </p>
        <p>
          The counterexample is useful because “defense should buy something” can otherwise turn into another rule that
          flattens genres. Sometimes survival is the reward. Sometimes the whole point is to stay inside pressure while
          finding a path through it. The question is whether the defensive action supports that intended rhythm or just
          inserts a pause before the same problem resumes unchanged.
        </p>

        <H2>Check the frame after success</H2>
        <p>
          When a defense feels dull, I would stop tuning the input window for a minute and inspect the state immediately
          afterward. Is the enemy still committed? Did spacing change? Did either side spend or gain a resource? Can the
          player act sooner, reach a weak point, recover balance, escape the corner, or continue attacking? If every answer
          is no, the mechanic may be asking for skill without giving that skill a consequence.
        </p>
        <p>
          The opposite failure exists too. If every dodge guarantees a huge punish, attacks stop carrying much threat once
          their tells are learned. Some moves should be safe. Some blocks should leave the defender under pressure. A long
          boss string can ask for several correct responses before the opening appears. The payoff only needs to be clear
          enough that the player can understand what another successful defense is moving them toward.
        </p>
        <p>
          The Callot duel in the header freezes two blades at contact. The useful part of a parry is not that steel touched
          steel. It is where the blades, bodies, and initiative can go next. A defensive mechanic deserves the same review:
          after the hit did not happen, what changed?
        </p>
      </Prose>
    </ArticleLayout>
  );
}
