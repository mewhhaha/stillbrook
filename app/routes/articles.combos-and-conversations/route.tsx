import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Compare,
  FlowSequence,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Combos and conversations",
  description:
    "A game feels coherent when actions combine into readable consequences, the world answers back, and clarity and pacing give both enough room to land.",
  published: "2026-07-18T09:34:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/combos-and-conversations.jpg",
    alt: "Charlie Parker and Red Rodney sit talking in a booth at the Downbeat club while Dizzy Gillespie's group plays in the mirror behind them.",
    credit: {
      author: "William P. Gottlieb",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Charlie_Parker,_Red_Rodney,_Dizzy_Gillespie,_Margie_Hyams,_and_Chuck_Wayne,_Downbeat,_New_York,_N.Y.,_ca._1947_(William_P._Gottlieb_06861).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const buttonCombo = [
  {
    title: "Press",
    detail: "The button compresses and captures the input instead of waiting silently.",
  },
  {
    title: "Acknowledge",
    detail: "A click, tone, or haptic pulse confirms that the action registered.",
  },
  {
    title: "Commit",
    detail: "The setting changes, the purchase completes, or the door begins to open.",
  },
  {
    title: "Echo",
    detail: "The label, nearby state, or later world response remembers what happened.",
  },
] as const;

const cccp = [
  {
    name: "Combos",
    values: [
      "What comes together?",
      "Combat chains, dialogue callbacks, narration, UI response",
      "Inputs feel isolated from their consequences",
    ],
  },
  {
    name: "Conversations",
    values: [
      "What answers back?",
      "Characters, environments, rules, music, remembered state",
      "The game reacts without revealing a world",
    ],
  },
  {
    name: "Clarity",
    values: [
      "Can the player trace cause and effect?",
      "Telegraphing, hierarchy, affordances, readable feedback",
      "Effects arrive, but their meaning is lost",
    ],
  },
  {
    name: "Pacing",
    values: [
      "When does each beat get room?",
      "Cadence, downtime, escalation, contrast",
      "Every system speaks at the same volume",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          In school, there was a guy who reduced every conversation about games to one word:
          “combos.” Combat was combos. Story was combos. Everything was combos, which sounded ridiculous
          because a word that covered the entire medium seemed to explain none of it.
        </p>
        <p>
          The annoying part is that the word kept surviving. A combo is any moment where separate actions
          or systems arrive as one felt consequence: a launcher feeding an aerial attack, a dialogue choice
          changing a later line, narration recognizing what you did, or a button press producing a visible
          state change. I needed three more words before the idea became useful: Conversations, Clarity, and
          Pacing. CCCP, because apparently the acronym wanted to cause trouble too.
        </p>

        <H2>Everything can combo</H2>
        <p>
          The{" "}
          <a href="https://aaai.org/papers/ws04-04-001-mda-a-formal-approach-to-game-design-and-game-research/">
            MDA framework
          </a>{" "}
          calls the middle layer “dynamics”: the behavior produced when rules meet player input. “Combo” is
          a messier, more useful word for the moments when several dynamics become one readable payoff. The
          sequence matters because each part changes how the next part feels.
        </p>
        <p>
          Fighting games make the structure obvious, but a menu button uses the same trick at miniature
          scale. One click can recruit animation, sound, application state, and a later acknowledgement. The
          interaction feels complete when those systems agree about what your action meant.
        </p>
        <FlowSequence
          steps={buttonCombo}
          caption="A small UI action becomes a combo when acknowledgement, commitment, and remembered state follow the press."
        />
        <p>
          Martin Jonasson and Petri Purho&apos;s{" "}
          <a href="https://www.gdcvault.com/play/1016789/Juice-It-or-Lose">
            “Juice It or Lose It”
          </a>{" "}
          demonstrates how particles, motion, and sound can turn minimal input into cascading response. Folmer
          Kelly&apos;s later{" "}
          <a href="https://gdcvault.com/play/1020861/Don-t-Juice-It-or">
            countertalk
          </a>{" "}
          points at the missing condition: effects that ignore context can weaken immersion. A stone that
          bounces like rubber may feel responsive and still make the world less believable.
        </p>

        <H2>The world has to answer</H2>
        <p>
          “Conversation” includes spoken dialogue, but the useful definition is wider. A room can answer by
          showing what happened there. A companion can remember a decision. Music can withdraw after a loss,
          and a rule can reveal that the faction you helped now controls the checkpoint.
        </p>
        <p>
          Matthias Worch and Harvey Smith&apos;s{" "}
          <a href="https://www.worch.com/2010/03/11/gdc-2010/">
            environmental-storytelling lecture
          </a>{" "}
          asks the player to pull information from spaces and infer the history behind them. That is a
          conversation because the game leaves room for interpretation instead of delivering lore as a receipt.
          The world offers evidence, and you decide how much attention to give it.
        </p>
        <p>
          A machine can applaud every input and still have no world behind the applause. At the other extreme,
          the player may tour a beautiful setting whose history never changes under their hands. The useful
          overlap appears when an action changes what the world says next, even if the answer is a locked cabinet,
          an avoided glance, or a room that has gone quiet.
        </p>

        <H2>Clarity and pacing keep the signal intact</H2>
        <p>
          A consequence only counts as a combo when the player can connect it to the action. Sid Meier&apos;s{" "}
          <a href="https://www.gdcvault.com/play/1015756/interesting">
            “Interesting Decisions” talk
          </a>{" "}
          puts information, feedback, and pacing beside the decision itself. Hide the cause, bury the important
          response under five louder effects, or delay the result without a trace, and the connection disappears.
        </p>
        <Compare
          attributes={["Question", "Where it lives", "Failure when missing"]}
          entities={cccp}
          caption="The four parts inspect different failures: connection, response, readability, and cadence."
        />
        <p>
          Pacing is what lets the other three breathe. A lore-heavy room placed during a chase has no listener.
          A combat crescendo repeated every thirty seconds stops being a crescendo, while a pause after a difficult
          choice gives animation, dialogue, and environment time to disagree with one another.
        </p>
        <p>
          I don&apos;t know whether CCCP survives contact with a full studio vocabulary, and the acronym will make
          some meetings worse on sight. It does catch lopsided scenes quickly: the juicy button that changes
          nothing, the beautiful room nobody can inspect, the meaningful consequence hidden inside visual noise,
          the conversation interrupted by another reward banner.
        </p>
        <p>
          The guy at school was wrong in a useful direction. Now, when a button compresses, clicks, updates a
          value, and changes what the game remembers, I hear “combo.” Then I wait to see whether the room,
          character, or silence answers. When nothing does, the game noticed my finger and missed the conversation.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
