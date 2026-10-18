import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "The game has to look worth playing",
  description:
    "Astra and Opus 5.5 make me think AI acceptance in games is close: stronger tools are giving people with visual taste a shorter path to something worth playing.",
  published: "2026-10-18T00:18:00Z",
  author: "Still Brook",
  tags: ["software", "ai", "design"],
  image: {
    src: "/images/articles/the-game-has-to-look-worth-playing-journal.webp",
    alt: "A hand adjusts a brass spotlight over a miniature lighthouse and sailboat, with a second lamp and a small paint box nearby.",
    generated: "GPT Image",
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
          Imagine a little boat crossing a dark sea. The hull leans into a turn, a warm lamp catches the
          spray, and the wake stays behind it long enough to describe the curve. You can understand the
          appeal in a few seconds. You probably want to steer the boat.
        </p>
        <p>
          That is where I expect the argument about AI in games to start changing. Give someone a game
          they want to touch and the conversation has something better to work with than a promise
          about development becoming cheaper. I think we are close to that turn, with GPT-6 Astra and
          Claude Opus 5.5 helping it along.
        </p>
        <p>
          This is a prediction about what people will accept. The recent model releases give me reasons
          for it; they do not measure an audience changing its mind.
        </p>

        <H2>The first few seconds count</H2>
        <p>
          A technically functioning demo can be remarkably hard to want. The camera points somewhere
          unhelpful. Objects have materials, but the lighting flattens them into the same grey. An enemy
          moves correctly while looking as though somebody is dragging its feet across a table.
          Understanding how it was made does a lot of the work of appreciating it.
        </p>
        <p>
          Better graphical fidelity helps because it gives the eye more convincing relationships to
          read: a shape against its background, a shadow under a foot, a surface catching the same light
          as its surroundings. A small stylized scene can have all of that. I care more about the scene
          agreeing with itself than how closely its rocks resemble a photograph.
        </p>
        <p>
          OpenAI&apos;s <a href="https://developers.openai.com/blog/how-to-build-games-with-astra">
            account of building games with Astra
          </a>{" "}
          is encouraging here. Thomas Ricouard describes directing a procedural space game through
          visual references and repeated play. Astra works on meshes, materials, lighting, and terrain;
          it also builds a ship in Blender from an approved concept. Image generation supplies the
          concept art separately. The interesting part, to me, is how much of the journey from a chosen
          look to a running scene that workflow covers.
        </p>
        <p>
          Anthropic&apos;s <a href="https://www.anthropic.com/claude-opus-5-5">Opus 5.5 announcement</a>{" "}
          reports a tester comparing games made by several Claude models from one prompt, with 5.5
          scoring highest for graphics and polish. There is too little detail there to call it a useful
          benchmark. Even so, graphics and polish are exactly where I want to see progress. A game has
          to earn the attention of someone who has no particular interest in the model that made it.
        </p>

        <H2>Someone still has to choose the light</H2>
        <p>
          My bet depends as much on who starts using these tools as on the models themselves. Someone
          with a good eye might already know why a scene feels dead. The camera needs to be lower. The
          foreground is too busy. The brightest object should be the thing the player can use. Until
          recently, acting on that judgment could mean learning several unfamiliar systems before
          finding out whether the idea worked.
        </p>
        <p>
          Shorten that distance and a different group of makers gets further. An animator can try a
          movement idea inside a playable room. An illustrator can carry a palette into materials and
          lighting. A level designer can spend an evening adjusting a space instead of losing it to an
          import problem. Some already write excellent code. Others have been waiting for the plumbing
          to become less of a commitment.
        </p>
        <p>
          Taste becomes very practical here. Keep the crooked tower because it gives the village a
          silhouette. Lose half the glowing plants because they bury the path. Make the hit pause
          shorter. Let the water go quiet near the dock. These choices accumulate until a place feels
          authored, and stronger tools give the person making them more chances to see an answer.
        </p>
        <p>
          I expect that to produce games with more personality than a pile of elaborate assets would
          suggest. A person can be quite particular when changing something stops being a three-day
          detour. They can afford to reject the impressive version and keep the odd little version
          that suits their game.
        </p>

        <H2>The boat also has to steer</H2>
        <p>
          The first screenshot gets a vote before the first input does. Once the game is in
          your hands, the camera has to follow cleanly, the animation has to explain the action, and
          frame times have to stay steady when you turn. A beautiful sea loses much of its
          appeal when turning the boat makes it hitch.
        </p>
        <p>
          The Astra write-up includes <a href="https://developers.openai.com/blog/how-to-build-games-with-astra#measure-the-work-behind-a-slow-frame">
            rendering counters and repeatable performance checks
          </a>{" "}
          alongside visual review. Its reported frame timings use SwiftShader software rendering, so they tell
          us about that test environment. The broader habit is useful: inspect the scene, measure the
          work, change something, and play again. Visual ambition needs that loop if it is going to
          survive contact with a player&apos;s machine.
        </p>

        <H2>Acceptance can arrive one game at a time</H2>
        <p>
          There is plenty of resistance today. In <a href="https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/">
            GDC&apos;s 2026 survey
          </a> of more than 2,300 industry professionals, 52% saw generative AI as having a negative
          impact, and 7% saw a positive one. Those are workers&apos; views of their industry, with real
          stakes behind them. They cannot stand in for a player survey, and prettier games will leave
          questions about jobs, rights, and credit to be answered.
        </p>
        <p>
          Still, I expect acceptance to grow through specific games people like. A friend sends a
          clip. Someone asks for the link. A small team with a peculiar idea finishes something that
          previously stayed in a folder. Enjoying that game gives the next conversation a different
          starting point.
        </p>
        <p>
          Astra and Opus 5.5 make that future feel close to me. Put stronger tools in the hands of
          people who care where the light falls, what the player notices, and how the boat turns.
          Then let them keep adjusting it until someone watching wants a go.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
