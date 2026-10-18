import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose, SocialPost } from "../../components";

export const article = {
  title: "Please, sir. I’m tired.",
  description:
    "Codex usage limits have been reset for outages, launches, milestones, cache bugs, vibes, and literal RESET week until the exception became a public ritual.",
  published: "2026-07-18T17:10:00Z",
  author: "Still Brook",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/please-sir-im-tired-journal.webp",
    alt: "A tired attendant faces a brass button amid empty jars and a ring of wax seals.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const resetPosts = [
  {
    date: "Dec 25, 2025",
    href: "https://x.com/thsottiaux/status/2004100061933064395",
    reason: "A holiday gift, plus double usage through New Year’s Day",
  },
  {
    date: "Mar 3, 2026",
    href: "https://x.com/thsottiaux/status/2028649088594436225",
    reason: "An eight-minute outage caused by high-cyber-risk blocking",
  },
  {
    date: "Mar 8",
    href: "https://x.com/thsottiaux/status/2030474136024400173",
    reason: "Enough reports of fast drains to reset during the investigation",
  },
  {
    date: "Mar 10",
    href: "https://x.com/thsottiaux/status/2031216405266481489",
    reason: "The incident was stable, resolved, and due one expected refill",
  },
  {
    date: "Mar 27",
    href: "https://x.com/thsottiaux/status/2037346989244096581",
    reason: "The plugin launch, and because it had been a while",
  },
  {
    date: "Apr 1",
    href: "https://x.com/thsottiaux/status/2039248564967424483",
    reason: "Unexplained limit pressure and some newly reclaimed compute",
  },
  {
    date: "Apr 9",
    href: "https://x.com/thsottiaux/status/2042067902392942790",
    reason: "A second three-million-user celebration after awkward timing",
  },
  {
    date: "Apr 17",
    href: "https://x.com/thsottiaux/status/2044943514832871564",
    reason: "Codex’s first anniversary; Codex was allowed to press its own button",
  },
  {
    date: "Apr 21",
    href: "https://x.com/thsottiaux/status/2046602907077038501",
    reason: "Four million active users",
  },
  {
    date: "Apr 28",
    href: "https://x.com/thsottiaux/status/2048997818673537399",
    reason: "A good week, several things to celebrate, and good vibes",
  },
  {
    date: "May 19",
    href: "https://x.com/thsottiaux/status/2056851041132696025",
    reason: "One counted like and several things to celebrate",
  },
  {
    date: "May 23",
    href: "https://x.com/thsottiaux/status/2058280452851638313",
    reason: "A compaction cache regression that made limits drain faster",
  },
  {
    date: "May 31",
    href: "https://x.com/thsottiaux/status/2061106703446450392",
    reason: "Restoring paid accounts to full weekly and hourly limits",
  },
  {
    date: "Jun 18",
    href: "https://x.com/thsottiaux/status/2067399435009622521",
    reason: "A sneaky double reset, with another refill banked",
  },
  {
    date: "Jun 28",
    href: "https://x.com/thsottiaux/status/2071381664853319742",
    reason: "An investigation during literal OpenAI RESET week",
  },
  {
    date: "Jul 9",
    href: "https://x.com/thsottiaux/status/2075330198887940337",
    reason: "A new researcher got credit for pressing the button",
  },
  {
    date: "Jul 10",
    href: "https://x.com/thsottiaux/status/2075452680760443190",
    reason: "The GPT-5.6 Sol launch, twice over twenty-four hours",
  },
  {
    date: "Jul 13",
    href: "https://x.com/thsottiaux/status/2076735790567338203",
    reason: "Seven million active users and a banked refill",
  },
  {
    date: "Jul 14",
    href: "https://x.com/thsottiaux/status/2077114635308986427",
    reason: "Eight million active users",
  },
  {
    date: "Jul 18",
    href: "https://x.com/thsottiaux/status/2078320950488297917",
    reason: "Another paid-plan refill",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Thibault “Tibo” Sottiaux{" "}
          <a href="https://x.com/thsottiaux/status/2078320950488297917">
            reset Codex usage limits again today
          </a>
          . The post began “Oops... I did it again,” which is fair: this was the twentieth public
          reset post or announcement I could verify from his X account since Christmas. The button
          has been pressed for outages, investigations, launches, milestones, cache bugs, vibes,
          and one week that happened to be named RESET.
        </p>
        <p>
          Free tokens are welcome. I would also like to stop learning the emotional weather around
          Codex capacity by watching one man approach a large red button.
        </p>
        <SocialPost
          author="Tibo"
          handle="@thsottiaux"
          href="https://x.com/thsottiaux/status/2078320950488297917"
          publishedAt="2026-07-18T03:28:22Z"
          avatar="/images/articles/please-sir-im-tired-tibo.jpg"
          verified
          media={{
            src: "/images/articles/please-sir-im-tired-codex-remix.jpg",
            alt: "Britney Spears lying against a blue background under the words Oops, I did it again — Codex Remix.",
            width: 1254,
            height: 1254,
          }}
          quotedPost={{
            author: "Tibo",
            handle: "@thsottiaux",
            href: "https://x.com/thsottiaux/status/2078310751878647932",
            text: "GPT-5.6 Sol confirmed to be an extremely good model",
            avatar: "/images/articles/please-sir-im-tired-tibo.jpg",
            verified: true,
          }}
          replies="2.4K"
          likes="14.4K"
          caption="Number twenty, posted July 18, 2026."
        >
          <p>Oops... I did it again.</p>
          <p>
            Enjoy reset usage limits for all paid users for Codex and ChatGPT Work. Super grateful
            for an incredible team who is iterating at lightspeed and keeping the infra up as we
            scale faster than ever.
          </p>
          <p>Enjoy the weekend!</p>
        </SocialPost>
        <p>
          The first one in this run reads like a holiday favor. After that come outage apologies,
          product launches, adoption milestones, and at least one case of comic timing that was
          apparently irresistible. Here is the whole roll call, with every reason linked to the
          post that supplied it.
        </p>

        <H2>Twenty trips to the button</H2>
        <DataTable
          head={["Date", "Reason or occasion"]}
          rows={resetPosts.map(({ date, href, reason }) => [
            date,
            <a key={href} href={href}>
              {reason}
            </a>,
          ])}
          caption="Twenty reset posts and announcements from Tibo’s X account, December 25, 2025 through July 18, 2026."
        />
        <p>
          There are sensible operational events in there. The March 3 reset followed an outage;
          the May 23 reset followed a cache regression; several others arrived while the team was
          investigating reports of limits draining too quickly. A refill is a direct way to make
          users whole when accounting or availability goes sideways.
        </p>
        <p>
          The same button also celebrates every million users, welcomes launches, marks an
          anniversary, rewards a like, and rescues the vibes. By June, one refill no longer carried
          enough ceremony.
        </p>
        <SocialPost
          author="Tibo"
          handle="@thsottiaux"
          href="https://x.com/thsottiaux/status/2067399435009622521"
          publishedAt="2026-06-18T00:10:10Z"
          avatar="/images/articles/please-sir-im-tired-tibo.jpg"
          verified
          quotedPost={{
            author: "🥔🥔🥔",
            handle: "@argofowl",
            href: "https://x.com/argofowl/status/2067364445593170007",
            text: (
              <>
                ❗❗❗
                <br />
                <br />
                guys remember this post about codex rate limit resets “on your own time”?
                <br />
                <br />
                well apparently this is some bullshit that is only bankable when you refer people
                and they sign up for codex...
              </>
            ),
            avatar: "/images/articles/please-sir-im-tired-argofowl.jpg",
            verified: true,
          }}
          replies="955"
          likes="7.4K"
          views="565.9K"
          caption="Sottiaux announced a double reset on June 18 and said another refill had been banked."
        >
          <p>Dearest gentle codexer.</p>
          <p>
            We did a sneaky double reset. Not only do you get a full reset on us. But you are also
            getting one into the reset bank to use at your own leisure.
          </p>
          <p>Enjoy</p>
        </SocialPost>
        <p>
          I don’t know what the underlying capacity curve looks like, and public posts cannot show
          it. They do show the product teaching us a ritual: limits tighten or behave strangely,
          Tibo appears, the account refills, everyone cheers, and the exception becomes part of the
          expected service. Two unofficial sites now exist just to answer whether he has done it
          again:{" "}
          <a href="https://tibogpt.com/">tibogpt.com</a> and{" "}
          <a href="https://hascodexratelimitreset.today/">hascodexratelimitreset.today</a>.
        </p>
        <p>
          And look, the resets are generous. But the same post now covers a launch, a cache bug, or
          eight million users, so the post itself carries no information. If your weekly limit
          evaporates midweek, was that an incident or a dry spell between celebrations? You find
          out by watching whether Tibo shows up.
        </p>
        <p>
          I clicked through all twenty posts while building this list. By the time I reached April
          17, where Codex was allowed to reset its own rate limits, the generosity had become a
          recurring bit with a familiar cue. I will take the tokens. Please, sir. I’m tired.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
