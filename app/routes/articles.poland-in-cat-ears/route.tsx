import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, BarChart, DataTable, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Poland in cat ears",
  description:
    "The Polish catgirl-programmer stereotype comes from overlapping internet visibilities rather than evidence that Poland produces unusually many gender-nonconforming developers.",
  published: "2026-07-11T21:20:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/poland-in-cat-ears.jpg",
    alt: "A cat lying across a computer keyboard, entirely unbothered by whoever was trying to type.",
    credit: {
      author: "Breawycker",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Cat_lying_on_keyboard.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const memeSteps = [
  {
    title: "Polish programming",
    detail: "A national label already familiar in technical circles",
  },
  {
    title: "Queer tech catgirls",
    detail: "A global online subculture, not a Polish invention",
  },
  {
    title: "Politics meets cosplay",
    detail: "One photograph carries the contradiction in a single frame",
  },
  {
    title: "The timeline repeats it",
    detail: "Recognition starts to feel like prevalence",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          I went looking for the census because the joke is oddly specific. Spend enough time around
          programming memes and sooner or later a Polish developer appears in a skirt, thigh-high socks,
          cat ears, or some combination of the three. I expected a survey, a Polish subculture history,
          anything sturdier than vibes.
        </p>
        <p>
          What I found was an Olympiad medal table, two small studies of trans people in software, and a
          six-year-old Reddit photograph of a far-right politician holding a cosplayer. None of those
          sources measures how often Polish developers cross-dress or use catgirl avatars. As far as I can
          tell, nobody has measured it.
        </p>
        <p>
          The reputation is not a demographic fact. It is an internet compression artifact: Poland already
          reads as <em>programmer</em> in technical circles, catgirls already read as <em>queer programmer</em>{" "}
          in some online subcultures, and a few vivid Polish images fused the labels until repetition began
          to look like evidence.
        </p>
        <FlowSequence
          steps={memeSteps}
          caption="Four real signals collapse into one unsupported claim about a national population."
        />
        <p>
          Every stage contributes something true. The distortion happens between them, when a fact about
          medal counts or about one online subculture quietly gets treated as a fact about what Polish
          developers wear.
        </p>

        <H2>The joke uses one silhouette</H2>
        <p>
          The first problem hides inside the phrase <em>male cross-dressing</em>. Someone presenting
          femininely online might be a cis man who likes skirts, a trans woman, a nonbinary person, a
          cosplayer, or a developer whose avatar has ears while their work camera shows a grey hoodie.
          Those descriptions cannot be swapped without changing what you are saying about the person.
        </p>
        <p>
          The meme swaps them anyway. A femboy post, a trans developer&apos;s catgirl avatar, a cosplay
          photograph, and a joke about programming socks all count as the same sighting. Once the category
          gets that loose, a feed can keep finding confirmations forever.
        </p>
        <p>
          Cat ears make the collapse easier because they often belong to a persona rather than an offline
          wardrobe. An avatar can signal anime fandom, playfulness, gender expression, membership in a
          community, or an afternoon spent choosing a funny profile picture. The screenshot preserves the
          ears and discards the explanation.
        </p>

        <H2>Poland already arrives as code</H2>
        <p>
          My first theory was that Poland&apos;s competitive-programming culture explained the whole thing.
          The official <a href="https://stats.ioinformatics.org/countries/POL">International Olympiad in Informatics statistics</a> make the theory tempting. Poland has participated since 1989, and its medal pile through IOI 2025 is hard to miss.
        </p>
        <BarChart
          title="Poland's International Olympiad in Informatics medals through 2025"
          data={[
            { label: "Gold", value: 45 },
            { label: "Silver", value: 54 },
            { label: "Bronze", value: 36 },
          ]}
          caption="Poland's IOI medals through 2025. The table measures contest performance, not anyone's gender or clothes."
        />
        <p>
          A medal table says little about the route taken by an ordinary software developer, but it gives
          Poland unusual visibility wherever programmers trade contest stories and hard problems. The
          national label reaches the meme already carrying a technical reputation.
        </p>
        <p>
          Visibility also creates more opportunities for accidental combinations. A country that supplies
          many memorable programmer identities will supply visible metalheads, speedrunners, furries,
          catgirls, and people with no public persona at all. The first four travel through a feed, and the
          people with no persona just close their tickets and go home.
        </p>
        <p>
          I clicked through the Olympiad hall of fame expecting this to settle the question. Of course it
          did not. Medal colors explain why <em>Polish programmer</em> feels plausible, but they do not put
          ears on anyone.
        </p>

        <H2>The cat ears came from elsewhere</H2>
        <p>
          Then I opened a <a href="https://arxiv.org/abs/2205.01553">2022 survey titled <em>Why The Trans Programmer?</em></a>. It recruited 138 trans respondents through Reddit and Discord, including communities explicitly organized around trans programmers. The paper warns that its sample skews young, student, enthusiastic about computer science, and online.
        </p>
        <p>
          Its most meme-ready result is almost a trap: 80.5 percent of respondents said they were
          &ldquo;kinda&rdquo; or &ldquo;very&rdquo; experienced with catgirls. In the same methods section,
          the author says catgirl and programming-socks memes are prevalent in online trans communities
          and scarce in offline spaces such as a university campus. You could not design a clearer warning
          against treating the number as a population estimate.
        </p>
        <p>
          The narrower finding is useful. Catgirls belong to the vocabulary of some online trans
          programming communities, and that association does not require Poland. The survey also records
          people describing computers as places where they did not have to perform gender, alongside the
          appeal of creating things and finding financially secure work.
        </p>
        <p>
          A <a href="https://arxiv.org/abs/2303.12913">2023 interview study</a> reaches a related idea from
          only three trans software professionals, so I would not stretch it far. Those participants
          described software as relatively safer than other industries and valued remote work for the
          control it gave them over identity disclosure and social interaction. The finding speaks to the
          profession rather than the country: online-first work makes chosen names, avatars, and selective
          visibility unusually practical.
        </p>

        <H2>One photograph supplies the flag</H2>
        <p>
          Poland enters the finished joke through contrast. In 2020, a <a href="https://www.reddit.com/r/europe/comments/i1ssea/here_we_see_farright_polish_politician_janusz/">widely circulated Reddit post</a> showed the far-right Polish politician Janusz Korwin-Mikke holding a person the title called an anime femboy at a cosplay convention. The comments immediately treated the frame as a crossover between right-wing politics, anime fandom, feminine presentation, and Poland.
        </p>
        <p>
          I do not know how the person being held described their gender, and the caption does not establish
          it, but the uncertainty barely slowed the meme down. A convention costume became a national specimen
          because the image already contained every ingredient the audience wanted to connect.
        </p>
        <p>
          The photograph did more work than a thousand ordinary developer profiles because nobody
          screenshots the ordinary profiles. Its far-right politician made the feminine cosplay feel more
          contradictory, the Polish label was printed into every repost, and the convention setting supplied
          a crowd of costumes without requiring any claim about daily life.
        </p>
        <p>
          After enough circulation, the flag sticks to the older catgirl-programmer joke. Later posts skip
          the photograph entirely and still inherit the association, adding another Polish flag, another pair
          of striped socks, another caption that assumes the reader already knows.
        </p>

        <H2>Your sample is the timeline</H2>
        <p>
          The psychological mechanism predates recommendation feeds. Tversky and Kahneman&apos;s <a href="https://doi.org/10.1016/0010-0285(73)90033-9">1973 paper on availability</a> describes how people estimate frequency by the ease with which examples come to mind. Vivid incidents and repeated pairings can therefore make a relationship feel common even when the remembered sample is badly distorted.
        </p>
        <p>
          A timeline adds selection pressure. Distinctive avatars and outfits earn replies and reposts,
          while a Polish engineer with a default profile image rarely becomes evidence for anything. When I
          searched for the stereotype directly, everything that came back had already been filtered by it.
        </p>
        <p>
          I tried the recall test on myself. Contest handles came quickly, then the convention photograph,
          then several versions of the same catgirl joke. I could not summon the faces of the ordinary Polish
          developers who spent this week reviewing pull requests in jeans, because their clothes never became
          content.
        </p>
        <p>
          People also learn to perform a meme once it exists. I suspect some Polish programmers add the flag
          or lean into the catgirl persona because the combination already gets a laugh, though I found no
          study that measures that feedback loop. The joke becomes an available costume, and each deliberate
          performance makes the supposed national pattern look a little more spontaneous.
        </p>

        <H2>The country is the least measured part</H2>
        <p>
          Local Polish-language communities may have added references I missed, and English search results
          are a poor map of them. Even so, none of the sources I found compares gender-nonconforming Polish
          developers with developers in Germany, Czechia, the United States, or anywhere else. The claim of
          unusual national prevalence remains unsupported.
        </p>
        <DataTable
          head={["Source", "What it observes", "What the meme needs"]}
          rows={[
            ["IOI medal table", "Polish contestants at one programming competition", "Poland produces unusually many programmers"],
            ["2022 trans-programmer survey", "138 online-recruited trans respondents", "Polish developers are unusually likely to be catgirls"],
            ["2023 interview study", "Three trans software professionals", "Polish tech is uniquely gender-nonconforming"],
            ["2020 Reddit photograph", "One politician and one cosplayer at a convention", "The costume represents Polish developers"],
          ]}
          caption="Each source supports one piece of the association. None measures the national pattern the finished joke asserts."
        />
        <p>
          The available evidence supports a less exotic answer. Poland has a strong and visible programming
          tradition; online tech culture contains a real trans and gender-nonconforming subculture; catgirls
          became one of that subculture&apos;s recurring jokes; and a perfectly shareable Polish cosplay image
          attached the flag. Nothing in that chain required Polish developers to dress any differently from
          developers anywhere else.
        </p>
        <p>
          The stereotype can be affectionate, but its loose vocabulary still misgenders people and turns a
          national queer community into a prop. Calling someone a femboy, a trans woman, a cross-dresser, or
          a catgirl says different things, and the joke loses nothing by using the one that is actually true.
        </p>
        <p>
          I closed the search tab with no census in hand. The Reddit photograph was still open beside it,
          the politician grinning under convention lights while a cosplayer hung in his arms.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
