import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, NumberLine, Prose } from "../../components";

export const article = {
  title: "The cliff at 100,000",
  description:
    "PostgreSQL 19 turns JIT off by default because the planner could price a query more reliably than the LLVM compilation a cost threshold might suddenly add.",
  published: "2026-08-12T06:28:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-cliff-at-100000-journal.webp",
    alt: "A loaded cart meets a toll gate beside an oversized copper calculating engine.",
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
          PostgreSQL 19 is going to arrive with one switch in a different position. <code>jit</code>,
          on by default in PostgreSQL 18, is off in 19. The release notes are unusually candid about
          why: the optimizer-cost rule that decided when LLVM should join a query was unreliable.
        </p>
        <p>
          The interesting failure is narrower than “JIT is slow.” PostgreSQL can estimate enough about
          a query to choose among scans, joins, sorts, and aggregates. What it could not estimate reliably
          was the compilation bill it was about to add. A query could cross one planner-cost boundary and
          suddenly acquire a compiler before it acquired its rows.
        </p>

        <H2>The threshold priced the query</H2>
        <p>
          With JIT enabled, PostgreSQL compares a plan&apos;s total estimated cost with <code>jit_above_cost</code>.
          The <a href="https://www.postgresql.org/docs/19/runtime-config-query.html">default is 100,000</a>.
          Those are planner units, not milliseconds. The{" "}
          <a href="https://www.postgresql.org/docs/18/using-explain.html">EXPLAIN documentation</a>{" "}
          calls them arbitrary units determined by planner cost parameters; their job is to compare ways
          of executing a query.
        </p>
        <NumberLine
          title="The automatic JIT boundary when JIT is enabled"
          points={[
            { value: 99_999, label: "stay interpreted", side: "below" },
            { value: 100_001, label: "JIT eligible", side: "above" },
          ]}
          threshold={{ value: 100_000, label: "jit_above_cost" }}
          min={99_995}
          max={100_005}
          format={(value) => Math.round(value).toLocaleString("en-US")}
          caption="Illustrative plans one cost unit either side of the default threshold. Planner cost is a relative estimate, not elapsed time."
        />
        <p>
          The switch introduces work from another budget. Tomas Vondra&apos;s{" "}
          <a href="https://www.postgresql.org/message-id/E1w8GWU-002bSL-31%40gemulon.postgresql.org">
            commit message for the new default
          </a>{" "}
          says PostgreSQL has no reliable estimate for LLVM compilation and optimization cost. A couple
          of unrelated inserts can raise a plan estimate just enough to turn JIT on, producing the
          performance cliff the threshold was meant to avoid.
        </p>
        <p>
          PostgreSQL&apos;s own JIT guide makes the fixed cost visible with a deliberately forced example.
          A small aggregate finishes in 0.365 ms without JIT. Lower the threshold to 10 and the reported
          execution time becomes 7.416 ms, with 7.104 ms spent in JIT. The example is intentionally
          absurd, which is useful here: the missing part of the price is sitting in plain sight.
        </p>

        <H2>The compiler still earns its place</H2>
        <p>
          The <a href="https://www.postgresql.org/docs/19/jit-decision.html">PostgreSQL 19 JIT guide</a>{" "}
          says compilation is primarily useful for long-running, CPU-bound work, often analytical queries.
          A long scan or aggregate can spend enough time evaluating expressions for compilation to pay
          back its entrance fee. Short queries usually cannot.
        </p>
        <p>
          The problem was choosing between those cases automatically with a score that did not contain a
          dependable price for the choice itself. The commit notes that large deployments had already
          learned to disable JIT by default, including the hyperscalers known to the PostgreSQL developers.
          PostgreSQL 19 follows that practice without removing JIT.
        </p>
        <p>
          Analytical sites can still enable it, and the same cost thresholds decide which queries compile
          afterward. That moves one useful bit of workload knowledge outside the planner: an operator can
          say this is a place where compilation is expected to pay instead of asking query cost to imply it.
        </p>

        <H2>A gate needs the price of opening it</H2>
        <p>
          A hard threshold works badly when crossing it adds a fixed cost that the score does not measure.
          Raising the threshold only moves the discontinuity. Better costing could put compilation into the
          decision properly; cheaper JIT could make a bad choice less expensive. Vondra&apos;s commit leaves
          both routes open for reconsidering the default later.
        </p>
        <p>
          For now, the <a href="https://www.postgresql.org/docs/release/19.0/">PostgreSQL 19 release notes</a>{" "}
          leave <code>jit_above_cost</code> at 100,000. The threshold is still there. The switch above it is
          the part that moved.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
