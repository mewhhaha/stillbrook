import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Callout,
  CodeBlock,
  CodeTabs,
  DataTable,
  H2,
  Prose,
  SocialPost,
} from "../../components";

export const article = {
  title: "A gazillion tokens later",
  description:
    "Prompting becomes productive when a vague idea collapses into a small building block with a chosen quality, a reference point, a harness, and a finish line.",
  published: "2026-07-30T15:54:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/a-gazillion-tokens-later-journal.webp",
    alt: "A measured wooden block sits in a test jig amid scattered notes and discarded shavings.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const discoveryPrompt = `
  I have an idea for [thing].
  Help me find the smallest useful version.

  Ask what I care about.
  Offer a few scopes and their tradeoffs.
  Do not write code yet.
`;

const executionPrompt = `
  Build [first block].

  Protect: [one quality].
  Reference: [benchmark, fixture, screenshot, or tool].
  Done when: [observable check].
  Stop if: [constraint or unresolved decision].
`;

const feedbackRows = [
  ["Functionality", "Tests, fixtures, failure cases", "Required behavior passes within the existing scope"],
  ["Interface", "Screenshot, transcript, interaction recording", "The target flow matches the reference"],
  ["Simplicity", "Concept, file, and dependency budget", "No abstraction appears before its second use"],
  ["Code quality", "Lint, types, named invariants", "No warnings and the stated invariants survive"],
  ["Performance", "Benchmark plus a known-good ceiling", "The target lands or the budget expires"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I have spent a gazillion tokens and reached the end with nothing I could use. The transcript
          looked substantial, which hid the problem for longer than it should have: the project never
          became small enough to finish.
        </p>
        <p>
          My best prompting sessions now have two different temperatures. I let the first prompt stay
          vague enough for us to discover the shape together, then I force execution into one small
          artifact with a chosen quality, a reference point, a harness, and a finish line. The smaller
          that artifact gets, the more likely I am to have something tomorrow.
        </p>

        <H2>Vague first, narrow second</H2>
        <p>
          Starting with a detailed specification feels responsible, but it can freeze the first idea
          before either of you understands the problem. I would rather tell the model what I am trying
          to make, what I care about, and what still feels uncertain. Let it ask questions. Let it
          offer scopes before generated code makes each rejected scope expensive.
        </p>
        <p>
          Mitchell Hashimoto describes the same split in his{" "}
          <a href="https://mitchellh.com/writing/my-ai-adoption-journey">
            account of adopting coding agents
          </a>
          . Vague requests get a planning session, then clear actionable tasks get fresh execution
          sessions. “Draw the owl” is a fine conversation starter and a miserable unit of work.
        </p>
        <CodeTabs labels={["Discovery", "Execution"]}>
          <CodeBlock lang="text" title="discovery.txt" code={discoveryPrompt} />
          <CodeBlock lang="text" title="execution.txt" code={executionPrompt} />
        </CodeTabs>
        <Callout variant="tip" title="Use voice for the messy half">
          <p>
            Dictation is good for motive, taste, examples, uncertainty, and the part where you do not
            yet know the right noun. Ask the model to restate the constraints and possible scopes before
            coding. Type exact paths, identifiers, and stop conditions afterward. Speech recognition
            has no respect for your module names.
          </p>
        </Callout>
        <p>
          This also keeps me from optimizing the prompting workflow before I have a workflow. A
          cathedral of aliases, modes, and orchestration can consume more attention than the little
          tool I wanted to ship. I judge the setup by what I keep relative to how much deliberate
          steering it demanded.
        </p>

        <H2>One block can ship</H2>
        <p>
          Hashimoto&apos;s{" "}
          <a href="https://mitchellh.com/writing/building-block-economy">
            building block economy
          </a>{" "}
          gives this instinct a better frame. Models are decent at starting from nothing, but they are
          much better at gluing together high-quality, documented components that already survived real
          use. So a decent ambition for a personal project is to come out of it holding one block a
          later run can trust.
        </p>
        <p>
          Make the parser, the command, the tiny library, the format, or the component. Small scope
          still deserves careful tests and a pleasant interface. It leaves out the platform around the
          block, the future plugin system, and the administration panel for users who do not exist.
        </p>

        <H2>A win needs a ruler</H2>
        <p>
          Local improvement can look heroic when the baseline is bad enough. Hashimoto asked an agent
          loop to optimize a naive Go terminal renderer and got a dramatic result against its starting
          point. Then he compared it with Ghostty&apos;s existing hand-written renderer.
        </p>
        <SocialPost
          author="Mitchell Hashimoto"
          handle="@mitchellh"
          href="https://x.com/mitchellh/status/2060088112257372610"
          publishedAt="2026-05-28T19:57:35Z"
          verified
          caption="The agent loop’s own scorecard, before the known-good renderer entered the comparison."
        >
          <p>88ms =&gt; 1.5ms</p>
          <p>150K allocs =&gt; ~500 allocs</p>
          <p>Incredible right? Nope.</p>
        </SocialPost>
        <p>
          The Go version had improved enormously and was still roughly seventy-five times behind the
          known renderer. Its benchmark showed that each pass improved the Go code. The existing
          renderer showed that the result was nowhere near the target.
        </p>
        <p>
          A reference can be code, a screenshot, a command transcript, a fixture corpus, an
          accessibility tree, or a tool whose interface you already enjoy. Give the model something
          external to its own output, because “better than my previous answer” is an embarrassingly low
          ceiling.
        </p>

        <H2>Pick the thing you protect</H2>
        <p>
          Code quality, interface, functionality, simplicity, and performance pull in different
          directions. Asking the model to maximize all of them produces endless rewrites where every
          pass invents a new reason to reopen the design. Pick one primary quality and, when needed, one
          veto such as “do not add a dependency.”
        </p>
        <DataTable
          head={["Priority", "Feedback", "Finish line"]}
          rows={feedbackRows}
          caption="Each row pairs a quality with evidence the agent can generate and a stop condition it can evaluate."
        />
        <p>
          Turn that evidence into a harness before the implementation gets large. The agent can write
          the tests, benchmark command, screenshot script, or structural checker itself, then run it
          after every change. Give it a target and a stop condition too: reach the number, satisfy the
          fixture, spend the allotted budget, or return with a question when an unresolved decision
          blocks the next step.
        </p>
        <p>
          I do not think one feedback loop works for every task. Notice what you are judging this time,
          then make that judgment available to the model instead of keeping it as a vague
          disappointment in your head.
        </p>

        <H2>Make failure durable</H2>
        <p>
          You build prompting intuition by trying varied work: tiny scripts, interface changes,
          research, refactors, writing, performance passes. The repetitions teach you where the model
          can roam and where it needs a fence. Reading prompt advice alone cannot give you the same
          sense for when a request is about to balloon.
        </p>
        <p>
          When the model does something you do not want repeated, update the instructions. Hashimoto
          says the lines in Ghostty&apos;s{" "}
          <a href="https://github.com/ghostty-org/ghostty/blob/main/AGENTS.md">
            <code>AGENTS.md</code>
          </a>{" "}
          come from observed agent failures. The correction moves into the next session&apos;s starting
          conditions, and a test or tool can make the lesson executable.
        </p>
        <p>
          After a failed run, I want one durable artifact: the new test, benchmark, screenshot script,
          or instruction line that makes the same failure harder to repeat. Open Ghostty&apos;s AGENTS
          file and you can read the corrections in the order they were earned, like rings in a stump.
          Most of the code behind those failures is gone, and the lines are still there.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
