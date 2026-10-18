import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Lock-on schedules the crowd",
  description:
    "Target lock changes movement, framing, and how aggressively untargeted enemies can behave, so encounter design has to decide what the lock means before tuning the crowd.",
  published: "2026-08-11T12:38:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "/images/articles/lock-on-schedules-the-crowd-journal.webp",
    alt: "A brass sighting ring frames one of two dueling fencers while others wait nearby.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const lockRows = [
  [
    "Ocarina of Time",
    "Explicit Z-target on one opponent",
    "Movement orbits that opponent and the camera aligns to the relationship",
    "Other enemies can wait until the current duel releases them",
  ],
  [
    "Sifu",
    "Dynamic lock with quick target swapping",
    "The player can redirect attacks across a group without parking on one foe",
    "Enemy aggression is tuned around feeling surrounded without becoming overwhelming",
  ],
  [
    "God of War (2018)",
    "Optional lock-on camera",
    "Useful with one enemy or a small group",
    "Santa Monica recommends trying it off when large crowds make camera control harder",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Press lock-on during a group fight and a surprising amount of the room changes jobs. The camera starts
          preserving one relationship, movement may begin orbiting a body, attacks inherit a preferred target, and
          every enemy outside that relationship becomes someone the game still has to keep legible. The marker over a
          head looks tiny.
        </p>
        <p>
          <a href="/articles/camera-control-costs-a-thumb">Camera control costs a thumb</a> treated framing as player
          work, while <a href="/articles/give-the-enemy-one-job">Give the enemy one job</a> treated each foe as a
          readable pressure inside a crowd. Lock-on sits between those problems. Once a game promises to keep one enemy
          centered, encounter designers inherit rules about who may attack from elsewhere and how quickly the player can
          change their mind.
        </p>
        <p>
          I get suspicious when lock-on appears under a camera heading and stays there through the whole design review.
          A camera option can quietly become an enemy scheduler, a movement model, a targeting rule, and an accessibility
          aid at the same time. Nintendo ran into that bundle almost immediately when it tried to make Zelda work in 3D.
        </p>

        <H2>Nintendo let the crowd wait</H2>
        <p>
          In Nintendo&apos;s{" "}
          <a href="https://iwataasks.nintendo.com/interviews/3ds/zelda-ocarina-of-time/1/2/">
            retrospective on <em>The Legend of Zelda: Ocarina of Time</em>
          </a>
          , the original team describes a basic 3D problem: two characters could fail to line up cleanly when the player
          tried to face or interact with one another. Yoshiaki Koizumi and Toru Osawa found part of the answer while
          watching a staged sword fight at Toei Kyoto Studio Park, where the performers presented one duel clearly even
          though several opponents were available.
        </p>
        <p>
          Koizumi says Z-targeting flagged one opponent and told the other enemies to wait. Osawa describes the lock as
          an invisible connection between Link and the target, which let the stick move Link forward, backward, or around
          the opponent instead of asking the player to manually reconcile two free-facing characters. Beat one enemy and
          the lock could move to the next.
        </p>
        <p>
          The visual marker changed during development too. Koizumi says an upside-down triangle became Navi because he
          wanted something that belonged to Zelda&apos;s world while still showing the target clearly. I love how much design
          got packed into that one relationship: camera framing, movement axes, target identity, and enemy timing all had
          to agree before the sword fight read cleanly.
        </p>

        <DataTable
          head={["Game", "Lock model", "What the player gets", "What the encounter assumes"]}
          rows={lockRows}
          caption="Three published implementations where target-lock behavior and crowd behavior are described together rather than as separate systems."
        />

        <H2>Sifu keeps the target moving</H2>
        <p>
          Sloclap wanted <em>Sifu</em> to feel crowded. In its{" "}
          <a href="https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/">
            official combat overview
          </a>
          , the studio says fights against multiple enemies sit at the heart of the game, then describes a dynamic camera
          lock that supports quick and responsive target swapping. The same passage says enemy aggression was tuned so
          the player could feel surrounded and challenged without being overwhelmed.
        </p>
        <p>
          That pairing is doing real work. <em>Sifu</em> lets attacks travel from one opponent to another, while pushes,
          knockdowns, thrown objects, and furniture can reshape the group around you. A hard duel lock would fight those
          verbs unless the rest of the crowd became much more patient; that last sentence is my inference from the
          published design, because Sloclap does not expose its aggression scheduler in the article.
        </p>
        <p>
          Santa Monica&apos;s own advice for <em>God of War</em> exposes the opposite edge. Its{" "}
          <a href="https://sms.playstation.com/stories/give-me-god-war-advanced-combat-strategies">
            advanced-combat guide
          </a>{" "}
          says the lock-on camera can help against a single enemy or a small group, but players struggling with the camera
          in large fights should try disabling it. That is a wonderfully inconvenient fact for anyone who wants lock-on
          to be a neutral preference: the usefulness of the control changes with encounter composition.
        </p>

        <H2>The assist has to survive the encounter</H2>
        <p>
          Removing lock-on whenever a crowd gets messy creates another problem. Ubisoft&apos;s{" "}
          <a href="https://news.ubisoft.com/en-ca/article/17eqw8mHg6HAdD8xnmODL9/immortals-fenyx-rising--designing-a-mythic-adventure-for-accessibility">
            accessibility breakdown for <em>Immortals Fenyx Rising</em>
          </a>{" "}
          lists target lock-on as support for motor, cognitive, and vision accessibility, because it helps players keep
          abilities and attacks aimed at the intended enemy. For some players, automatic target maintenance is exactly
          the work the game should take away.
        </p>
        <p>
          So a large fight that only behaves well with lock-on disabled has coupled its crowd design to a control demand
          some players specifically benefit from avoiding. The expensive fix may live in enemy approach rules, off-screen
          warnings, target-switch behavior, arena geometry, or attack selection rather than in the camera menu. Which one
          matters most will vary by game, and I do not have comparative player data that would justify pretending there is
          a universal order.
        </p>
        <p>
          Robineau&apos;s painting in the header shows Saint-George and d&apos;Eon fencing in the middle of a packed room. Two
          people act while everyone else watches. More than two centuries later, the Ocarina team walked out of a staged
          sword fight with the same useful trick for a Nintendo 64 crowd: let the current duel read before the next body
          demands the frame.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
