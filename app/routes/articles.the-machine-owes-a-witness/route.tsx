import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Evidence belongs in the result",
  description:
    "Three programming-languages papers ask what inspectable evidence must accompany a bug report, a parallel-cost bound, or a generated test.",
  published: "2026-07-15T10:45:00Z",
  author: "Mira Voss",
  tags: ["software", "craft"],
  image: {
    src: "/images/articles/the-machine-owes-a-witness.jpg",
    alt: "A metal proof press with a wide flat bed and large roller stands in a print workshop.",
    credit: {
      author: "Kathleenberry",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Proof_press.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const evidenceRows = [
  ["This concurrent program has a bug", "A derivation reaching the incorrect execution", "Mizzle’s mechanized logic"],
  ["This fork-join program fits a cost bound", "Work and task-tagged span credits", "Parcas in Rocq/Iris"],
  ["This generator efficiently produces valid tests", "A generative construction with a certificate scheme", "The verifier for the generated language"],
] as const;

const parallelCost = `
  work(left || right) = work(left) + work(right)
  span(left || right) = max(span(left), span(right))
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Three programming-languages papers from this summer agree on a house rule I want everywhere: a claim
          does not count as a result until it carries something a defined checker can inspect. Hold that rule up
          against a typical generated bug report — severity, file, line number, three confident paragraphs about
          why the crash is real — and the report has nothing to offer it. The prose ranks the candidate, and
          accepting the claim still costs you the entire search the producer already ran.
        </p>
        <DataTable
          head={["Generated claim", "Evidence in the result", "Checker"]}
          rows={evidenceRows}
          caption="Each paper pairs a claim with a different witness language and checking boundary."
        />
        <p>
          The interface is the part I want to steal. The system proposing the bug, the bound, or the test may
          stay probabilistic, untrusted, as hallucination-prone as it likes, because acceptance runs through a
          small checker whose failure is explicit. A missing witness is an incomplete result, and an incomplete
          result is the producer&apos;s problem — which is exactly where that problem belongs.
        </p>

        <H2>Reachability belongs beside the bug</H2>
        <p>
          <a href="https://arxiv.org/abs/2607.11611">Mizzle</a> aims at the false alarms of agentic bug finding.
          It defines an incorrectness separation logic for a substantial subset of concurrent OCaml, so a bug
          report has to carry a derivation showing that an incorrect execution — stuckness, a race,
          non-linearizable behavior — is actually reachable. No derivation, no bug.
        </p>
        <p>
          The authors mechanize the logic in Rocq on Iris and prove it sound and complete for their model, so a
          derivation cannot justify a false alarm and every modeled incorrect execution admits one. As far as I
          can tell the LLM experiment is a proof of concept, and nobody is claiming that proof search scales
          across an arbitrary repository yet. What has already changed is the reviewer&apos;s position:
          acceptance ends at a proof checker instead of at persuasive prose.
        </p>

        <H2>Different claims, different witnesses</H2>
        <p>
          <a href="https://arxiv.org/abs/2607.11582">Parcas</a> makes the same demand of performance claims.
          Parallel cost has two currencies — total work adds across child tasks, while span follows the longest
          dependency chain — and a bound is only honest if it accounts for both.
        </p>
        <CodeBlock lang="text" title="Fork-join cost" highlight="1-2" code={parallelCost} />
        <p>
          Work credits split additively, the easy half. For span, Parcas duplicates credits at each fork, tags
          every copy with a logical task identifier, and restricts where those credits may be spent or
          transferred. What comes out is a machine-independent work-and-span bound with a proof attached, rather
          than one flattering wall-clock number from the authors&apos; hardware.
        </p>
        <p>
          The third paper, a{" "}
          <a href="https://arxiv.org/abs/2607.11811">complexity theory of randomised testing</a>, points the
          question at generators: being able to decide whether a value satisfies a predicate does not mean you
          can efficiently produce such values. Under standard cryptographic assumptions there are languages in{" "}
          <code>P</code> with no efficient generator, and efficient generability is characterized by a
          certificate scheme over a verifier.
        </p>
        <p>
          That result explains why witness planting works — construct the evidence first, then derive a valid
          test around it. It also quietly kills a property-testing API everyone keeps wishing for: no general
          library can compose efficient generators out of arbitrary predicate conjunctions and negations, under
          the paper&apos;s assumptions — the wished-for combinator turns out to be cryptographically hard.
        </p>
        <p>
          None of this makes evidence cheap to produce. Proof search can dominate the bug finding, logical
          credits want specifications, and a certificate-based generator still needs a construction that reaches
          the interesting cases. The cost moves upstream, though, and the report in your queue either has the
          derivation field or it does not — you no longer have to argue with its adjectives.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
