import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "The invisible army",
  description:
    "Building a 251-line terminal RTS on aztecs, the Haskell ECS, uncovers a genuinely pleasant pure-world core underneath stale documentation, a scheduler that does not exist, and an optional query that is secretly mandatory.",
  published: "2026-07-12T15:40:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-invisible-army.jpg",
    alt: "A museum diorama of hundreds of painted tin soldiers frozen mid-battle across a model landscape of hills and farmhouses.",
    credit: {
      author: "Thomas Quine",
      license: "CC BY 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Battle_is_engaged_(26178770262).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const componentsCode = `
newtype Pos = Pos (Int, Int) deriving (Eq, Show)

instance (Monad m) => Component m Pos

data Unit = Unit Team Job deriving (Show)

instance (Monad m) => Component m Unit
`;

const writebackCode = `
workers <-
  system . readQuery $
    (,,,) <$> entity <*> query <*> query <*> query
      :: Access IO (V.Vector (EntityID, Unit, Pos, Cargo))

-- ...decide the whole tick in plain Haskell, ending in
-- moves :: Map EntityID (Int, Int), then join on EntityID:

void . system . runQuery $ queryMapWith (move moves) entity
  where
    move ms e (Pos p) = Pos (Map.findWithDefault p e ms)
`;

const stalemateFrame = `
tick 280  stockpiles [(Red,3),(Blue,3)]

        .            .

  #R    r    r.   b      bB=

        .            .
`;

const reproCode = `
spawn_ $ bundle (Name "worker") <> bundle (Cargo 3)
spawn_ $ bundle (Name "soldier")
found <-
  system . readQuery $ (,) <$> query <*> queryMaybe
    :: Access IO (V.Vector (Name, Maybe Cargo))
liftIO $ print (V.toList found)

-- [(Name "worker",Just (Cargo 3))]
`;

const disjointCode = `
disjoint :: ReadsWrites -> ReadsWrites -> Bool
disjoint a b =
  Set.disjoint (reads a) (writes b)
    || Set.disjoint (reads b) (writes a)
    || Set.disjoint (writes b) (writes a)
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          <a href="https://github.com/aztecs-hs/aztecs">Aztecs</a> is an ECS for Haskell in the Bevy
          tradition: game state is a database, entities are row IDs, components are columns, and
          systems are queries. Bevy proved the shape in Rust. Aztecs asks what the same database
          looks like as a pure value — a world you can pass to a function and get a new world back.
        </p>
        <p>
          I wanted to know how that feels to work with, so I built the smallest real-time strategy
          game I could get away with on version 0.17.1: two bases, three workers each, five crystal
          mines, soldiers at eight crystal a head, last base standing wins.
        </p>
        <p>
          The game came out at 251 lines, and the first build ran — rare enough for me against an
          unfamiliar API that it says something about how the core is put together. The rest of the
          story happens outside the type checker&apos;s jurisdiction: seventeen major versions in
          thirteen months, a front page documenting an API removed several rewrites ago, and a
          battle that froze because an optional query turned out to be mandatory.
        </p>

        <H2>A war as a database</H2>
        <p>A component is any type you are willing to write an instance for:</p>
        <CodeBlock lang="haskell" title="Main.hs" code={componentsCode} />
        <p>
          The <code>m</code> exists so components can declare lifecycle hooks that run in your
          monad, and you pay the <code>(Monad m) =&gt;</code> incantation on every declaration
          whether you use hooks or not. Spawning reads nicely, though. Bundles form a monoid, so a
          soldier is{" "}
          <code>bundle (Unit t Fight) &lt;&gt; bundle (Pos p) &lt;&gt; bundle (Health 10)</code>,
          and the world sorts it into the right archetype.
        </p>
        <p>
          Queries are applicative and see one entity at a time, which is exactly the wrong shape for
          an RTS. To march a soldier you need the position of every enemy on the map, and no
          per-entity query can tell you that. So each tick became three moves: snapshot the world
          with <code>readQuery</code>, decide everything in ordinary Haskell over lists, and write
          the decisions back.
        </p>
        <CodeBlock lang="haskell" title="Main.hs" code={writebackCode} />
        <p>
          That last line is the trick none of the examples show. <code>queryMapWith</code> rewrites
          a component as a function of another query against the same entity, and{" "}
          <code>entity</code> is a query for the row&apos;s own ID, so closing over the plan gives
          you a bulk write joined on <code>EntityID</code>. GHC does demand the type annotation on
          every snapshot, because <code>query</code> alone pins down nothing.
        </p>

        <H2>The army that would not march</H2>
        <p>
          The first full run produced a war of great dignity. Workers walked to the mines and dug
          them empty. Then both stockpiles parked at three, forever short of a soldier&apos;s price,
          while the one soldier each side had already trained stood at attention beside its barracks
          from tick 40 to tick 400, when I stopped waiting. Bases are <code>#</code> and{" "}
          <code>=</code>, workers are lowercase, soldiers are capitals, and a spent mine is a dot:
        </p>
        <CodeBlock lang="text" title="empty rows trimmed" code={stalemateFrame} />
        <p>
          I blamed my own planner first — some ordering bug in nearest-enemy selection — and spent a
          while rereading thirty innocent lines. Printing the snapshot settled it: every worker was
          present, every mine and base accounted for, and not a single soldier among them.
        </p>
        <p>
          My unit query had asked for <code>queryMaybe</code> on <code>Cargo</code>, since workers
          carry crystal and soldiers travel light. But when aztecs runs a query it collects the
          component IDs of everything the query touches, the optional ones included, and matches
          only archetypes that contain them all. Eight lines reproduce it:
        </p>
        <CodeBlock lang="haskell" title="Repro.hs" code={reproCode} />
        <p>
          The soldier is not returned with <code>Nothing</code>, it is filtered out before the query
          runs, so through the public runners <code>queryMaybe</code> can never actually answer{" "}
          <code>Nothing</code>. Why ship an optional query that the archetype index makes mandatory?
          Once you know, the workaround is easy — snapshot soldiers separately through{" "}
          <code>readQueryFiltered</code> with a <code>without @IO @Cargo</code> filter, monad before
          component — and my army marched. Blue razed the Red base on tick 202.
        </p>

        <H2>The front door describes a different house</H2>
        <p>
          By then I had stopped trusting prose and started reading source. Holding the{" "}
          <a href="https://hackage.haskell.org/package/aztecs-0.17.1/docs/Aztecs-ECS.html">
            Hackage landing page
          </a>{" "}
          for <code>Aztecs.ECS</code> — the first thing a newcomer reads — against what 0.17.1
          actually accepts produces a table like this:
        </p>
        <Compare
          attributes={["Query API", "Rendering backend", "Changelog", "Scheduling"]}
          entities={[
            {
              name: "The front door",
              values: [
                <>
                  <code>instance Component Position</code>, systems in arrow notation with{" "}
                  <code>proc</code> and <code>runSystem_</code>
                </>,
                <>
                  Recommends <code>aztecs-sdl</code>
                </>,
                <>
                  <a href="https://github.com/aztecs-hs/aztecs/blob/main/CHANGELOG.md">Ends</a> at
                  0.15
                </>,
                "Systems run “in sequence or in parallel automatically”",
              ],
            },
            {
              name: "The source at 0.17.1",
              values: [
                "Predates the 0.11 interpreter rewrite, two redesigns ago, and no longer compiles",
                "The ecosystem replaced it with GL and GLFW packages",
                "Two major versions of unrecorded history",
                "Everything runs sequentially; the parallel path has no callers",
              ],
            },
          ]}
          caption="What the Aztecs.ECS landing page teaches against what the installed library accepts."
        />
        <p>
          Some of it bites harder than a stale example. Components can declare{" "}
          <code>componentOnInsert</code>, <code>componentOnChange</code>, and{" "}
          <code>componentOnRemove</code> hooks — &quot;reactive&quot; is a headline feature in the
          README. I gave a marker component all three, spawned two entities, called{" "}
          <code>remove</code> on one and <code>despawn</code> on the other, and only{" "}
          <code>remove</code> said goodbye. Death by <code>despawn</code> — the one lifecycle event
          an RTS produces in volume — runs no hooks at all.
        </p>
        <p>
          The scheduling row deserves a closer look, because I went hunting for the scheduler
          itself. The one function that would make the parallel-or-not decision is exported, called
          by nothing, and wrong:
        </p>
        <CodeBlock lang="haskell" title="Aztecs/ECS/Query.hs" code={disjointCode} />
        <p>
          Every definition of parallel safety demands all three of those conditions, and this one is
          satisfied by any. Two queries writing the same component sail through the first{" "}
          <code>||</code>. If the automatic scheduler ever arrives, its gatekeeper will wave the
          collisions in.
        </p>
        <p>
          I want to be fair about whose house this is. Aztecs is one person&apos;s library, and the
          churn is experimentation done in the open — the 0.15 changelog says &quot;revert to
          v0.9.0-style archetypes&quot; out loud, which is more honesty than most of us manage in a
          release note. The core survived those rewrites and I trust it. The prose around it still
          describes the versions that lost.
        </p>

        <H2>Blue wins, and I cannot fully tell you why</H2>
        <p>
          Here is the loose end I keep turning over. Fearing a mirror-image stalemate, I had set the
          center mine one cell closer to Red, a small deliberate thumb on the scale. Blue won
          anyway.
        </p>
        <p>
          The frames suggest Red banked its economic lead into an earlier first soldier and sent it
          marching alone across the map into two waiting Blue soldiers — the oldest RTS blunder
          there is, trickling units into a fight one at a time, emerging from a thirty-line planner
          that has never heard of army composition. That reading might be taste; I never proved it,
          because every attempt to trace the causality ended with me watching the whole war again
          instead. As reviews of a game engine core go, that is a strong one.
        </p>
        <p>
          The final frame is still in my scrollback: two Blue soldiers standing where the Red base
          used to be, next to a mine showing <code>.</code>, on a map that went quiet at tick 202.
          Two hundred and fifty-one lines bought me one library bug and a lesson in military
          logistics I never asked for.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
