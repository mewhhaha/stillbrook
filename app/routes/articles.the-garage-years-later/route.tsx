import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The garage, years later",
  description:
    "Revisiting Reddit's one-person languages by age instead of debut shows what solo years actually produce: a plan to freeze, a dormant design other people keep alive, an eight-year 0.3, a line-count budget that holds, and a release routine older than Linux.",
  published: "2026-07-18T16:30:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-garage-years-later-journal.webp",
    alt: "A crowded garage workbench holds two mechanical devices among jars, hand tools, and a sleeping cat.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const pipefishExample = `
  solveFor(rT, rB, h float, n int) :
      dT, dB, q
  given :
      dT = circumscribingLength(rT, n)
      dB = circumscribingLength(rB, n)
      S = √(h² + (rB-rT)²)
      q = √(S² - ((dB-dT)/2)²)

  circumscribingLength(r float, n int) :
      2*r*tan(π/n)

  √(x float) :
      sqrt(x)
`;

const cognateExample = `
  Def Move discs as (
      Let N be number of discs;
      Let A be first rod;
      Let B be second rod;
      Let C be third rod;

      Unless Zero? N (
          Move - 1 N discs from A via C to B;
          Prints ("Move disc " N " from " A " to " C);
          Move - 1 N discs from B via A to C;
      )
  );

  Move 5 discs from \\a via \\b to \\c
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Last week I{" "}
          <a href="/articles/five-languages-with-no-committee">toured five languages</a> from{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/">r/ProgrammingLanguages</a> small
          enough to fit in one person&apos;s head, and a colleague{" "}
          <a href="/articles/the-compiler-workshop">did the same for three small compilers</a> the
          next day. Both pieces judged debuts. That kept nagging at me, because a debut only proves
          a weekend of conviction.
        </p>
        <p>
          So I went back — to r/ProgrammingLanguages and this time also to{" "}
          <a href="https://www.reddit.com/r/Compilers/">r/Compilers</a> — with the clock as the
          filter instead of the star count. Still one person, still no committee, but years of
          commits on the record. What does the rude idea turn into when nobody ever arrives to take
          it off your hands?
        </p>
        <DataTable
          caption="Five creator-led languages, checked on July 18, 2026. The age is the selection criterion; the stars are along for the ride."
          head={["Language", "The one idea", "One person since", "Last commit", "Stars"]}
          align={["left", "left", "right", "right", "right"]}
          rows={[
            ["Pipefish", "functional core, imperative shell — as grammar", "2022", "July 18, 2026", "190"],
            ["Cognate", "lowercase words are comments", "2020", "February 2025", "262"],
            ["Mech", "programs are reactive tables", "2018", "July 18, 2026", "288"],
            ["Cwerg", "a compiler with a line-count budget", "2019", "June 2026", "701"],
            ["Seed7", "extensible syntax, portable everywhere", "1990", "July 17, 2026", "446"],
          ]}
        />

        <H2>Still subtracting</H2>
        <p>
          Tim Hardcastle has been building{" "}
          <a href="https://github.com/tim-hardcastle/Pipefish">Pipefish</a> in Go since 2022 — long
          enough that the language{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1b7uihq/">
            changed its name in public
          </a>
          , from Charm, two years in — and the repository was touched again the day I checked. The architecture is the
          functional-core, imperative-shell pattern promoted from team discipline to grammar:{" "}
          <code>cmd</code> declarations do IO and touch state, <code>def</code> declarations are
          pure, and everything is an immutable value in between. Local definitions sit in a{" "}
          <code>given</code> block after the function body, evaluated only on demand, so a function
          opens with what it returns and keeps the plumbing below.
        </p>
        <CodeBlock lang="text" title="examples/trig.pf" code={pipefishExample} />
        <p>
          The <code>√</code> and <code>π</code> in that file are user code, defined a few lines
          further down, because the syntax bends that far on request. Four years of this could have
          piled into a kitchen-sink language, and instead the README calls the core 97%
          feature-complete and points at a roadmap whose endpoint is a freeze: settle a small set
          of features, ship 1.x, stay there. The repo wears a badge reading &quot;No AI —
          Handbuilt from &apos;if&apos; statements&quot;. Last week I said a tiny language needs an
          opinion worth stealing, and Hardcastle is ahead of me — his license section signs off
          with &quot;Please steal my code and ideas.&quot;
        </p>

        <H2>The quiet stretch</H2>
        <p>
          <a href="https://github.com/cognate-lang/cognate">Cognate</a> has had no commit since
          February 2025, seventeen months before I checked, and 1,230 of the repository&apos;s
          roughly 1,270 commits belong to one contributor. By debut-day rules that reads as an
          obituary. Its{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/vmvyr6/">
            2022 pitch to the subreddit
          </a>{" "}
          read &quot;concatenative programming in English prose&quot;: a stack language, evaluated
          right to left, in which every word starting with a lowercase letter is a comment. The
          capitalized words are the program, and the lowercase ones are you talking to the next
          reader.
        </p>
        <CodeBlock lang="text" title="examples/hanoi.cog" code={cognateExample} />
        <p>
          Read the last line again: <code>Move 5 discs from \a via \b to \c</code> executes as
          written. That legibility seems to be what keeps the project breathing while
          its author is elsewhere: hedyhli&apos;s{" "}
          <a href="https://cognate-playground.hedy.dev/">browser playground</a> and
          dragoncoder047&apos;s{" "}
          <a href="https://github.com/dragoncoder047/cogni">microcontroller interpreter</a> are
          separate implementations by different people, and if anyone is coordinating all this, I
          can&apos;t see it.
        </p>

        <H2>Eight years to 0.3</H2>
        <p>
          Corey Montella&apos;s GitHub bio says he builds robots and programming languages;{" "}
          <a href="https://github.com/mech-lang/mech">Mech</a> is where they meet. The repository
          dates to August 2018, he{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/b7e9sx/">
            pitched it to the subreddit in 2019
          </a>{" "}
          as a reactive language for games and animations, and it now carries 10,932 commits from
          him against a couple hundred from everyone else. Everything is a matrix-shaped, broadcast-happy value —{" "}
          <code>ix := x &gt; 2</code> then <code>x[ix]</code> filters a vector with no loop in
          sight — because the language wants sensor readings flowing through tables with a robot on
          the other end.
        </p>
        <p>
          In May the project{" "}
          <a href="https://mech-lang.org/post/2026-05-11-version-0.3/">reached v0.3 beta</a>, and
          the additions lean research-ward: state machines for protocols, relational joins for
          data. A 0.3, in the eighth year. At a company that cadence would be a firing offense, and that is exactly what makes
          it credible here — the README still warns that Mech is unfit for critical systems until a
          1.0 that sits nowhere on the calendar. No committee means nobody to pressure you into
          calling it done, and Montella conspicuously doesn&apos;t.
        </p>

        <H2>A number instead of a committee</H2>
        <p>
          Over on r/Compilers, Robert Muth&apos;s{" "}
          <a href="https://github.com/robertmuth/Cwerg">Cwerg</a> answers the question that
          subreddit asks weekly — how big does a real compiler have to be? — by writing the limit
          into the project&apos;s one-line description: &quot;The best C-like language that can be
          implemented in 10kLOC.&quot; He means the number. The README pins a line budget on every
          component, publishes the current counts beside it, and attaches a confession: &quot;We
          cheat a little bit and do not include various tables.&quot;
        </p>
        <DataTable
          caption="Cwerg's line budgets against the counts published in the repository's CLOC files (regular Python code, July 18, 2026). The generated tables sit outside the count — that is the cheating the README admits to."
          head={["Component", "Budget", "Counted today"]}
          align={["left", "right", "right"]}
          rows={[
            ["Frontend", "10,000", "8,008"],
            ["Backend, target-neutral", "10,000", "4,526"],
            ["Backend, Arm32", "5,000", "1,354"],
            ["Backend, Aarch64", "5,000", "1,272"],
            ["Backend, X86-64", "5,000", "1,427"],
          ]}
        />
        <p>
          The budget has teeth because something real is traded for it. Generated code is allowed
          to land within 50% of the state-of-the-art compilers, in exchange for a codebase one
          developer can genuinely hold, implemented twice over — a Python reference and a C++
          performance version, kept in step since 2019. His subreddit history is the same grind in
          miniature: the{" "}
          <a href="https://www.reddit.com/r/Compilers/comments/svmnz6/">news in February 2022</a>{" "}
          was that Cwerg could now emit x86-64 instructions. Six and a half years in, every count
          sits under its cap.
        </p>

        <H2>Older than Linux</H2>
        <p>
          And then there is the far end. Thomas Mertes posts to r/ProgrammingLanguages every couple
          of months, the title always the same shape:{" "}
          <a href="https://www.reddit.com/r/ProgrammingLanguages/comments/1konjnt/">
            &quot;Version 2025-05-16 of the Seed7 programming language released&quot;
          </a>
          . The cadence has not slowed —{" "}
          <a href="https://github.com/ThomasMertes/seed7/releases">the latest release</a> landed on
          July 11, a week before I checked. The hello-world file in the{" "}
          <a href="https://github.com/ThomasMertes/seed7">repository</a> carries a copyright line
          that starts in 1990; that file is older than Linux.
        </p>
        <p>
          Four hundred and forty-six stars after thirty-six years. Nobody would call that traction,
          and Mertes plainly stopped chasing it decades ago; the release notes read like a
          craftsman keeping his shop, and the version threads collect their handful of polite
          upvotes on a subreddit younger than the language. By the rules I used last week, Seed7
          scores as a curiosity. But the other four are still finding out what decades of solo
          maintenance turn a language into, and Mertes could just tell them.
        </p>
        <p>
          Going by that cadence, the next version post is due around September: another datestamped
          title, another quiet thread. I plan to check back in four years and see which of the
          other four are still writing them.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
