import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose, PullQuote } from "../../components";

export const article = {
  title: "The forty-second first draft",
  description:
    "Disclosure Day shows what happens when 42 drafts of revision polish a screenplay without anyone reopening its premise.",
  published: "2026-07-11T16:24:00Z",
  author: "Mira Voss",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-forty-second-first-draft-journal.webp",
    alt: "A cinema projector casts a strange procession above an open battered notebook.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          <em>Disclosure Day</em> is so badly written that for most of the runtime I clung to the
          charitable explanation: it&apos;s a prank. You watch Steven Spielberg stage a wrestling
          escape, a highway pursuit, crop circles, psychic weather reports, woodland animals that
          turn out to be aliens, and a planetary television revelation, all with complete
          professional confidence, and the theory assembles itself on its own — a master director
          found his first screenplay in a drawer and filmed it one-to-one, studio money, no
          interventions. That honestly seemed more plausible to me than everyone meaning it.
        </p>

        <H2>The craft makes the mistake louder</H2>
        <p>
          None of it looks accidental. The{" "}
          <a href="https://apnews.com/article/disclosure-day-movie-review-1c7c53aef86850fa4eb4b6097c080424">
            production has no shortage of authority
          </a>{". "}Spielberg still places the camera with unnerving clarity, Janusz Kamiński gives the
          ordinary world an expectant glow, and John Williams knows exactly when to turn movement
          into revelation. The wrestling opening snaps into place, the chase has real physical
          geography, and the crop-circle sequence always knows where your eyes are. All that skill
          is exactly why you can&apos;t shrug the writing off.
        </p>
        <p>
          The screenplay introduces people as job descriptions — the cast list reads like a
          staffing plan.
        </p>
        <DataTable
          head={["Character", "Assigned function", "Wants"]}
          rows={[
            [
              "Daniel",
              <a
                key="daniel"
                href="https://www.theguardian.com/film/2026/jun/09/disclosure-day-review-close-encounters-of-a-deferred-kind-in-spielbergs-conspiracy-spectacular"
              >
                cybersecurity whistleblower carrying the proof
              </a>,
              "",
            ],
            ["Margaret", "frustrated weather presenter selected to speak alien", ""],
            ["Noah Scanlon", "executive", "a monopoly on the truth"],
            ["Hugo", "serene disclosure guru waiting beside the machinery of the finale", ""],
          ]}
          caption="The principal cast as the screenplay files it. The blank cells are the screenplay's, not mine."
        />
        <p>
          None of them ever wants anything the plot didn&apos;t hand them at the door. The absurdity
          isn&apos;t the problem — this is the man who made a pile of mashed potatoes
          feel like a terrifying summons. The problem is that nothing here costs anyone anything.
          Roy Neary&apos;s obsession wrecks his family. Elliott&apos;s friendship changes him, and
          Alan Grant gets scared into caring about children he never asked for. In{" "}
          <em>Disclosure Day</em>, a red cardinal activates the protagonist, a laptop supplies the
          moral proof, and the dialogue names whatever the score is about to make you feel.
        </p>

        <H2>Forty-two passes, no second thought</H2>
        <p>
          The prank theory dies the moment you read the production record. David Koepp, working from
          Spielberg&apos;s story,{" "}
          <a href="https://www.vanityfair.com/hollywood/story/david-koepp-steven-spielberg-disclosure-day-interview">
            told Vanity Fair
          </a>{" "}
          that he wrote 42 drafts, a personal record, because Spielberg was more exacting than he
          had ever been. Koepp later{" "}
          <a href="https://apnews.com/article/steven-spielberg-disclosure-day-interview-1106f7fcd85aba9debc3b919f2d007cd">
            told the Associated Press
          </a>{" "}
          that Spielberg reread the script daily for about a year and would sometimes send dozens
          of notes off a single pass. Whatever this movie is, it wasn&apos;t abandoned in a drawer.
          Somebody worked on it constantly.
        </p>
        <p>
          If anything, that makes the script more instructive. Revision can stay local: you sharpen
          an entrance, you clarify the chase, you fix a line that reads wrong, and every pass
          leaves the mechanism a little smoother while the premise underneath sits untouched,
          protected from the one question that would change it. I do this with my own drafts, and I
          suspect most writers do, because polishing a scene is easier than asking whether the
          scene should exist.
        </p>
        <PullQuote>
          A screenplay can survive forty-two drafts without receiving a second thought.
        </PullQuote>
        <p>
          Spielberg{" "}
          <a href="https://apnews.com/article/steven-spielberg-disclosure-day-interview-1106f7fcd85aba9debc3b919f2d007cd">
            openly says
          </a>{" "}
          he doesn&apos;t consider <em>Disclosure Day</em> science fiction, citing what he sees as
          overwhelming circumstantial evidence of alien visitation. That conviction explains the
          flatness, or most of it. The movie has no use for uncertainty: aliens are real, the
          conspiracy is total, the whistleblower is righteous, the{" "}
          <a href="https://www.theguardian.com/film/2026/jun/15/disclosure-day-alien-discussion-spoilers">
            villains literally vivisect the innocent
          </a>{", "}and empathy turns out to be the law of the universe. Every question is settled by
          the end of the first act, and there&apos;s nothing left for you to wonder about.
        </p>

        <H2>The budget becomes an alibi</H2>
        <p>
          The film{" "}
          <a href="https://www.theguardian.com/film/2026/jun/15/spielberg-disclosure-day-box-office-obsession-backrooms-michael">
            reportedly costs $115 million before marketing
          </a>{", "}and the money works like an alibi. When a motivation runs thin, there&apos;s a
          chase to cover for it. When the awe runs thin, the image gets bigger. When the theme runs
          thin, an actor with gravitas says it out loud and Williams closes the gap. Each
          department keeps solving its own assignment, and the movie-sized problem never lands on
          anyone&apos;s desk.
        </p>
        <p>
          People call this old-school Spielberg, and on the surface it is: the lucid blocking, the
          anxious faces tilted at the sky. But the old movies were never a package of signatures.
          The spectacle arrived because somebody wanted something so badly that the world bent
          around them. Nobody in <em>Disclosure Day</em> wants anything that much.
        </p>
        <p>
          So it isn&apos;t a prank, which is the stranger part. The movie is sincere. Years of
          work went into it — 42 drafts, some of the best craftspeople alive, a director who
          believes every word — and none of that ever forced anyone to reopen the premise, because
          mastery speeds up execution and does nothing about the decision underneath. All the
          revision happened around the first draft. It&apos;s still in there, under the glass.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
