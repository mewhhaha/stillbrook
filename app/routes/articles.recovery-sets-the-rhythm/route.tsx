import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Recovery sets the rhythm",
  description:
    "Recovery mechanics teach players when to press, retreat, or reset, so health and ammo systems have to reinforce the tempo a combat game claims to want.",
  published: "2026-08-07T12:39:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Metronome_1.jpg",
    alt: "A wooden mechanical metronome sits beside the body of an acoustic guitar.",
    credit: {
      author: "Gordon Joly",
      license: "CC BY-SA 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Metronome_1.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const recoverySystems = [
  {
    name: "DOOM",
    values: [
      "Harvest enemies through finishers and the chainsaw",
      "Move toward danger when health or ammunition runs low",
      "Resources return during combat instead of after a passive wait",
    ],
  },
  {
    name: "Bloodborne",
    values: [
      "Strike back during the short Regain window",
      "Counterattack before the recoverable health drains away",
      "Only the recent portion of lost health can be reclaimed",
    ],
  },
  {
    name: "Elden Ring",
    values: [
      "Rest at a Site of Grace",
      "End the current push and reset at a landmark",
      "HP, FP, status, and flasks refill while most defeated enemies return",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          You can give the player a shotgun, a double jump, and a soundtrack begging them to move, then teach them
          to crouch behind a crate whenever health runs low. The pitch says aggression, but the recovery rule pays
          out for hiding, and players find the payment schedule within a few fights.
        </p>
        <p>
          Recovery mechanics set the tempo because they decide what happens right after a mistake. Health and ammo
          come back somewhere, and wherever that somewhere is — a corpse, a corner, a menu — the player heads there
          the moment they get hurt. If your combat has a preferred rhythm, the recovery rule had better be pulling
          in the same direction.
        </p>
        <p>
          <a href="/articles/give-the-enemy-one-job">Give the enemy one job</a> put behavioral pressure in the enemy
          roster. The player&apos;s resource model applies pressure from the other side. An enemy can tell you where to
          stand, while the way you recover decides what you do after the enemy lands a hit.
        </p>

        <H2>The medkit can point forward</H2>
        <p>
          At GDC 2018, id Software&apos;s Kurt Loudy and Jake Campbell described{" "}
          <a href="https://www.gdcvault.com/play/1024940/Embracing-Push-Forward-Combat-in">
            “push forward combat” in <em>DOOM</em>
          </a>{" "}
          as a deliberate rejection of genre habits including regenerating health, reload, and cover. Their summary
          puts the burden on the player to take what they need from adversaries. That is a wonderfully aggressive
          place to put the supply cabinet.
        </p>
        <p>
          <em>DOOM Eternal</em> makes the division explicit in Bethesda&apos;s{" "}
          <a href="https://slayersclub.bethesda.net/en-ZA/article/doom-eternal-demon-slaying-101">
            official combat guide
          </a>: Glory Kills return health, the chainsaw returns ammunition, and setting enemies on fire produces armor.
          Low resources create another reason to engage with the combat loop instead of suspending it. The emergency
          action still looks like playing <em>DOOM</em>.
        </p>
        <p>
          <em>Bloodborne</em> bends the same idea around damage rather than pickups. Sony&apos;s 2014{" "}
          <a href="https://blog.playstation.com/2014/08/13/bloodborne-on-ps4-new-combat-details/">
            explanation of the Regain System
          </a>{" "}
          says a player can recover recently lost health by striking back within a short window, with the recoverable
          amount shrinking while they hesitate. That timer is rude, and I mean that as praise. Taking a hit creates a brief reason
          to move closer at exactly the moment older action-RPG habits might tell you to back away and heal.
        </p>

        <Compare
          attributes={["Recovery trigger", "Behavior it rewards", "Scope of the reset"]}
          entities={recoverySystems}
          caption="Three recovery systems that steer the player toward different immediate actions after spending or losing resources."
        />

        <H2>A reset can point backward</H2>
        <p>
          Aggression is only one useful rhythm. Bandai Namco&apos;s official{" "}
          <a href="https://en.bandainamcoent.eu/elden-ring/news/elden-ring-starter-guide-tips-know-playing-the-game">
            <em>Elden Ring</em> starter guide
          </a>{" "}
          says resting at a Site of Grace restores HP and FP, clears status ailments, refills flasks, and revives most
          defeated enemies. Recovery sits at a landmark, and using it redraws the nearby world for another push.
        </p>
        <p>
          The guide states the behavior, not the design rationale, so I am inferring the pacing intent from the reset
          it documents. The consequence is concrete anyway: resting closes one stretch of attrition and starts another.
          A game built around expeditions can make that boundary valuable because damage and flask use survive several
          ordinary encounters before the player chooses to cash out at safety.
        </p>
        <p>
          Design reviews spend enormous time on damage, enemy health, spawn counts, and animation windows. Recovery
          often arrives as boilerplate: wait a few seconds, pick up a kit, press a flask. The low-health player meets
          that rule before they meet your spreadsheet, and it tells them what kind of risk the economy can afford.
        </p>
        <p>
          Suppose melee combat wants the player moving toward enemies, but passive healing starts only after they
          disengage. Every hard hit creates a small argument between the fantasy and the arithmetic. Then why are you
          paying the player to hide? You can make the enemies as vicious as you like and the two instructions
          still disagree.
        </p>
        <p>
          <a href="/articles/in-defense-of-long-hallways">In defense of long hallways</a> already argued that quiet
          time can belong to the fight. Resource scarcity can give that quiet time a sharper boundary. If a trek is
          about reaching the next landmark with one flask left, automatic refills during every fight would erase the
          route&apos;s accumulated cost.
        </p>
        <p>
          I cannot give a universal split between recovery inside combat and recovery between encounters. Survival
          horror and attritional tactics may need scarcity to stay attached to the player for much longer, while an
          arcade shooter may want the resource economy to disappear back into the next trigger pull.
        </p>
        <p>
          A low-health Slayer runs toward a staggered demon because the demon is the medkit. In Yharnam, the yellow
          recoverable slice is already shrinking while the hunter decides whether to swing again.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
