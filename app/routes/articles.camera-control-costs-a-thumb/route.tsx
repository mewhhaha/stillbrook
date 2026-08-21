import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Divider, H2, Prose } from "../../components";

export const article = {
  title: "Camera control costs a thumb",
  description:
    "A player-controlled camera consumes input and attention, so 3D games should decide what that extra verb contributes before treating free look as a default.",
  published: "2026-08-09T12:41:00Z",
  author: "Still Brook",
  tags: ["craft"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Old_school_camera.jpg",
    alt: "A cream and black Asahi Pentax film camera from around 1965 rests on a textured surface.",
    credit: {
      author: "Swanie227",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Old_school_camera.jpg",
    },
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
          Give the player a right stick and you have assigned them a second thing to steer. The left thumb moves the
          character while the right thumb keeps the jump, enemy, landing, doorway, or patch of cover inside the frame.
          Plenty of games make that coordination feel good. Plenty more inherit it because the controller happened to
          arrive with two sticks.
        </p>
        <p>
          Camera control is a game mechanic with an input cost and an attention cost. If turning the view creates
          useful decisions, spend the thumb. If the player is mainly correcting the framing so they can perform the
          verb you actually care about, the camera has become a small administrative job attached to every other one.
        </p>
        <p>
          <a href="/articles/give-the-enemy-one-job">Give the enemy one job</a> assumed the player could read the
          enemy&apos;s role before the attack landed. <a href="/articles/failure-needs-a-short-commute">Failure needs a
          short commute</a> assumed the failed action stayed legible enough to learn from. Both assumptions pass through
          the camera first.
        </p>

        <H2>The second stick is work</H2>
        <p>
          Nintendo had already run into this problem while moving Mario through 3D. In an official{" "}
          <a href="https://iwataasks.nintendo.com/interviews/wii/super_mario_galaxy/0/1/">
            <em>Super Mario Galaxy</em> Iwata Asks
          </a>, producer Yoshiaki Koizumi looks back at <em>Super Mario Sunshine</em>&apos;s selectable camera modes and
          says they gave players an additional task before they could get into the gameplay. Nintendo swung toward an
          automatic camera in <em>Jungle Beat</em>, then Koizumi admits that move dodged the underlying camera problem
          rather than solving it.
        </p>
        <p>
          <em>Super Mario 3D Land</em> took a narrower approach. Its developers describe starting from the parallel-track
          camera used in <em>Super Mario Galaxy 2</em> because it made 3D Mario easy to play, then building a game meant
          to bridge familiar 2D rules and 3D movement. The camera still moves, but it carries more of the framing work
          itself instead of asking the player to continuously compose the shot.
        </p>
        <p>
          Evening Star pushed the idea far enough to make it part of the pitch for <em>Penny&apos;s Big Breakaway</em>.
          Esteban Fajardo&apos;s 2025{" "}
          <a href="https://gdcvault.com/play/1035507/Jazz-Platforming-in-Penny-s">GDC talk</a>{" "}
          asks whether a 3D platformer can work without camera control while describing levels built around movement,
          expression, and improvisation. The published overview does not tell me how much that choice improved player
          performance, so I would not pretend it does. It does establish that camera control was treated as removable
          design scope rather than mandatory genre furniture.
        </p>
        <p>
          That distinction bugs me because “standard controls” can hide a strange tax. A player misses a landing,
          rotates the view, reacquires the ledge, moves again, and the design report records a platforming mistake. Some
          of the work happened in the camera system. If the camera adds no interesting decision, why did you assign it
          a thumb?
        </p>

        <Divider />

        <H2>A free camera rewrites combat</H2>
        <p>
          The counterexample is useful because sometimes the camera deserves the job. Santa Monica Studio&apos;s 2019
          presentation on{" "}
          <a href="https://sms.playstation.com/stories/our-gdc-2019-presentations-engagement/media/306">
            evolving <em>God of War</em>&apos;s combat
          </a>{" "}
          describes its new intimate, player-controlled camera as a change that fundamentally altered the combat
          experience. The team says the old tricks stopped working. They did not bolt free look onto the previous
          combat and call the perspective finished; camera, controls, enemies, and abilities had to move together.
        </p>
        <p>
          Naughty Dog describes a related problem from the shooter side. Derek Mattson&apos;s{" "}
          <a href="https://gdcvault.com/play/1034314/A-Second-Shot-Improving-Ranged">
            <em>The Last of Us Part II</em> GDC talk
          </a>{" "}
          frames third-person shooting around the complications created when the camera and character can perceive
          different things. The talk covers camera-versus-character perception alongside hit detection, weapon feel,
          and input delay because aiming through a detached viewpoint changes what “I was pointing at that” even means.
        </p>
        <p>
          Once the player owns the frame, encounter design has to respect what can leave it. Threat indicators, audio,
          target assistance, enemy approach rules, and arena sight lines all become ways of returning information the
          camera can hide. I have not measured which of those compensations costs the least attention across genres;
          a lock-on brawler and a precision shooter plainly want different answers. The shared mistake is pretending
          the view sits outside the rules while every combat system works around it.
        </p>
        <p>
          This also changes how a designer reads a failed encounter. If the player never turned far enough to see the
          flanker, increasing the flanker&apos;s windup may barely help. If the player spends every jump correcting pitch,
          shortening the retry path gets them back to the same camera chore faster. The previous articles treated
          readability and repetition as encounter problems. Sometimes the missing variable is sitting under the right
          thumb.
        </p>
        <p>
          The old Pentax in the header has a shutter button, a focus ring, and no analog stick asking its owner to keep
          the subject centered while also running across the room. A modern controller on the desk has two sticks
          whether your game needs them or not. The plastic does not get a vote.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
