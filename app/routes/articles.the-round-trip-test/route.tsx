import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  CodeBlock,
  DataTable,
  FlowSequence,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The round-trip test",
  description:
    "Bun's Rust rewrite changed the language, implementation, review process, and security budget at once; an LLM port back to Zig would reveal which improvement came from where.",
  published: "2026-07-11T17:51:26Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/the-round-trip-test.jpg",
    alt: "A steam locomotive sits on a railway turntable in Papar, Sabah, ready to be turned around and sent back the way it came.",
    credit: {
      author: "Cccefalon",
      license: "CC BY-SA 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Papar_Sabah_Heritage-Steam-Train-Turntable-01.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const missingExperiment = `
  const rust = await port(zig, "rust", fable);
  const zigAgain = await port(rust, "zig", mythos);

  compare(rust, zigAgain, {
    behavior: sameTestSuite,
    pressure: sameFuzzCorpus,
    metrics: ["crashes", "leaks", "latency", "binary", "review-hours"],
  });
`;

const variables = [
  ["Language", "Zig", "Rust"],
  ["Implementation", "accumulated", "rewritten"],
  ["Review", "normal project flow", "two adversarial agents"],
  ["Security", "existing checks", "11 model review rounds"],
  ["Attention", "years of patches", "64 agents for 11 days"],
] as const;

const outcomes = [
  [
    "Zig keeps the gains",
    "The rewrite and harness deserve more credit than the language switch.",
  ],
  [
    "Memory bugs return",
    "Rust was carrying policy that Zig still leaves to discipline.",
  ],
  [
    "Zig gets better again",
    "Congratulations. The migration loop is an optimizer wearing a language-war costume.",
  ],
] as const;

const roundTripSteps = [
  { label: "start", title: "Zig" },
  { label: "model", title: "Fable" },
  { label: "port", title: "Rust" },
  { label: "model", title: "Mythos" },
  { label: "return", title: "Zig²" },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Bun&apos;s move from Zig to Rust is impressive engineering, and nothing here is meant to take
          that away. But as an experiment it&apos;s a mess. The migration changed the language, every
          implementation file, the review process, the compute budget, and the amount of security
          attention, all in a single pass — and then everyone read out of it whatever they walked in
          believing: Rust fixed Bun, Zig failed Bun, AI made language choice irrelevant.
        </p>
        <CodeBlock
          lang="ts"
          title="the-missing-experiment.ts"
          highlight="2-3,5-9"
          code={missingExperiment}
        />
        <p>
          If the second Zig version comes out better than the original, that&apos;s an awkward result for
          everyone who already declared victory — it wouldn&apos;t mean Zig won, it would mean a second
          full rewrite found more problems. Which is exactly why I want Bun to run it.
        </p>

        <H2>Five variables changed</H2>
        <p>
          The{" "}
          <a href="https://bun.com/blog/bun-in-rust">official rewrite account</a>{" "}
          says 535,496 lines of Zig became a mechanical Rust port over 11 days, with 64 Claude agents
          working concurrently at the peak. The pre-merge run burned 5.9 billion uncached input tokens and
          690 million output tokens (plus 72 billion cached reads), priced at roughly $165,000. Two
          adversarial reviewers checked each translated file, the full cross-platform test suite passed,
          and the team later ran 11 rounds of security review on top of that.
        </p>
        <p>
          Rust still has a strong claim here. The problem Bun kept naming was use-after-free, double-free,
          and missed cleanup around JavaScriptCore&apos;s garbage collector — exactly the kind of policy
          that safe Rust turns into compiler errors and <code>Drop</code>, and that Zig leaves to whoever
          is writing the file. A model can write the <code>defer</code>, sure. But nothing in the build
          complains about the one it forgot.
        </p>
        <DataTable
          head={["Variable", "Before", "After"]}
          rows={variables}
          caption="The internet saw one result and selected one cause — conclusion on social media: obviously my favorite row did it."
        />
        <p>
          But look at the table. A rewrite is also a forced reread of every error path and every
          workaround that stopped being needed three versions ago, so the port doubled as a giant cleanup
          campaign — run under a fresh compiler, fresh reviewers, and a test suite mature enough to hold a
          million-line diff in place. The language switch is one row in that table.
        </p>

        <H2>Port it back</H2>
        <p>
          Bun used a pre-release Fable 5, which{" "}
          <a href="https://www.anthropic.com/news/claude-fable-5-mythos-5">
            Anthropic describes as a Mythos-class model
          </a>. The follow-up I keep wishing someone would fund is maliciously simple: point the
          security-focused model at the Rust tree and ask for Zig back. Preserve the behavior and the Rust
          ownership design, make every implicit <code>Drop</code> an explicit Zig lifetime rule, and then
          attack both implementations with the same corpus.
        </p>
        <FlowSequence
          steps={roundTripSteps}
          caption="The reverse port turns a victory lap into an actual comparison."
        />
        <DataTable head={["Outcome", "What it would mean"]} rows={outcomes} />
        <p>
          Nobody would ship the reverse port; it&apos;s an ablation. And passing the same tests
          isn&apos;t enough, because both versions can agree on behavior today while disagreeing about how
          easily tomorrow&apos;s edit creates a dangling pointer. So compare the ugly numbers instead:
          fuzz time to first crash, leak counts, binary size, latency, how many cleanup sites a human has
          to maintain by hand, how often reviewers had to step in, and how much lifetime policy exists
          only in prose.
        </p>
        <p>
          Mythos is suited to the ugly part. The{" "}
          <a href="https://www.anthropic.com/glasswing">Project Glasswing results</a>{" "}
          report that Mythos Preview can find vulnerabilities and build working proofs. Cloudflare&apos;s{" "}
          <a href="https://blog.cloudflare.com/cyber-frontier-models/">production experiment</a>{" "}
          found the harness mattered as much as the model — narrow parallel hunts with independent
          validators and executable proofs beat one agent declaring itself thorough. Run that same harness
          against both trees and let each language defend itself under identical pressure.
        </p>
        <p>
          A million-line language rewrite used to be a one-way door, the kind of organizational trauma you
          didn&apos;t get to repeat. Bun turned it into an 11-day compute bill, which makes the reverse
          experiment merely absurd instead of impossible.
        </p>
        <p>
          So port it back. Maybe Zig keeps the gains, and the forced reread plus the review harness
          deserve the credit the borrow checker is currently collecting. Maybe the memory bugs creep back
          in, and Rust really was carrying policy that Zig leaves to discipline. My own suspicion — I
          can&apos;t prove it, and I&apos;d love to see the data — is the third outcome: every lap comes
          out a little better, whatever language it lands in, and someone at Bun eventually has to decide
          with a straight face whether $165,000 buys lap three.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
