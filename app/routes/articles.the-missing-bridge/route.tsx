import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Figure, H2, Prose } from "../../components";

export const article = {
  title: "The missing bridge",
  description:
    "A nonsense sentence about bananas and hats shows how little the material conditional has to do with the connection English hears in the word if.",
  published: "2026-07-11T16:50:00Z",
  author: "Mira Voss",
  tags: ["craft"],
  image: {
    src: "/images/articles/the-missing-bridge.jpg",
    alt: "An unfinished concrete highway deck ends abruptly in mid-air with exposed rebar, while traffic passes on the adjacent completed lanes.",
    credit: {
      author: "Schvaxet",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Dunn_Memorial_Bridge_Unfinished_Section_from_side.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <blockquote>
          <p>If bananas are hats, then apples are cats.</p>
        </blockquote>
        <p>
          Read as English, that sentence is nonsense; run through classical propositional logic, it
          comes out true, and both verdicts are correct. The trouble starts when <em>if</em> wanders
          between the two systems without anyone saying what kind of connection it&apos;s supposed to
          carry.
        </p>

        <H2>Only one row loses</H2>
        <p>
          Let <code>P</code> mean “bananas are hats” and <code>Q</code> mean “apples are cats.” The{" "}
          <a href="https://forallx.openlogicproject.org/forallxyyc.pdf#page=80">
            material conditional
          </a>{" "}
          <code>P → Q</code> is false in exactly one case: <code>P</code> is true and <code>Q</code> is
          false. Every other combination counts as true.
        </p>
        <ConditionalTable />
        <p>
          The arrow doesn&apos;t inspect fruit or plausibility or anything else about the world. All it
          asks is whether the conditional has been broken — did bananas turn out to be hats while
          apples failed to be cats? If not, the formula survives.
        </p>
        <p>
          In the ordinary world both claims are false, so we land on the last row and the
          conditional comes out true. You get the same answer if you rewrite <code>P → Q</code> as{" "}
          <code>¬P ∨ Q</code>: bananas aren&apos;t hats, so the left side of that disjunction settles the
          matter before apples ever come up. Logicians call this vacuous truth.
        </p>
        <p>
          That answer sounds like a lawyer&apos;s trick, and the reason is that ordinary speech doesn&apos;t
          hear a four-row operator. It hears an invitation: imagine bananas being hats, then tell me
          what happens to apples. And nothing happens. Once you&apos;re in that imagined world, the
          sentence hands you no rule connecting the categories, no cause, not even a hint about
          where to look for one.
        </p>

        <H2>English expects a hinge</H2>
        <p>
          Philosophers still argue about conditionals, largely because the familiar little word is
          doing several jobs at once. The{" "}
          <a href="https://plato.stanford.edu/entries/conditionals/">
            Stanford Encyclopedia of Philosophy
          </a>{" "}
          describes the truth-functional account as logic&apos;s first surprise: elegant, useful for
          mathematics, and an awkward fit for a lot of what we say about the world.
        </p>
        <p>
          “If the build fails, the deploy is blocked” states a rule somebody configured. “If the
          glass falls, it breaks” is a claim about physics, while “if she left at six, she&apos;s home by
          now” is offering evidence, and “if I had left at six, I&apos;d be home” asks you to consider a
          world nearby to this one. Nearly the same grammar every time, resting on a different kind
          of connection underneath.
        </p>
        <p>
          Classical logic flattens all of that on purpose. If you want a connective you can
          calculate with, its behavior has to depend on truth values alone — not physics, not what
          the speaker was getting at. The price is that the arrow becomes a poor translator for any
          English sentence whose whole point is the relationship.
        </p>
        <p>
          Lewis Carroll stages a related mistake in his 1895 dialogue{" "}
          <a href="https://doi.org/10.1093/mind/IV.14.278">
            “What the Tortoise Said to Achilles”
          </a>
          . The Tortoise accepts the premises and every new hypothetical Achilles writes down, but
          refuses to take the inferential step, so Achilles keeps adding statements as though one
          more sentence could stand in for knowing how to use a rule. It can&apos;t, and the regress
          never ends.
        </p>
        <p>
          The banana sentence trips over the opposite error: you can apply the formal rule
          perfectly and still have no reason on the other side. So when someone hands me an if-then
          claim, I&apos;ve started asking what&apos;s supposed to make the consequent follow. A truth table? A
          causal story, a contract, something they watched happen? Usually there&apos;s an answer.
          Sometimes there isn&apos;t.
        </p>
        <p>
          That&apos;s why the nonsense version earns its keep. Respectable nouns hide the gap — “if users
          care, they&apos;ll click” sounds connected well before anyone produces evidence. Bananas and
          hats extend no such courtesy. A conditional can be true and still have nothing to say.
        </p>
      </Prose>
    </ArticleLayout>
  );
}

const rows = [
  { antecedent: "True", consequent: "True", result: "True", note: "" },
  { antecedent: "True", consequent: "False", result: "False", note: "the broken case" },
  { antecedent: "False", consequent: "True", result: "True", note: "" },
  { antecedent: "False", consequent: "False", result: "True", note: "the ordinary world" },
] as const;

function ConditionalTable() {
  return (
    <Figure caption="Material implication fails only when the antecedent is true and the consequent is false.">
      <div className="overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-900">
        <div className="grid gap-1 border-b border-zinc-950/10 px-4 py-3 font-mono text-xs text-zinc-500 dark:border-white/10 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">P</span> bananas are
            hats
          </p>
          <p>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Q</span> apples are
            cats
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead className="bg-white text-zinc-500 dark:bg-zinc-950">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  P
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Q
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  P → Q
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Reading
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-950/10 dark:divide-white/10">
              {rows.map((row) => (
                <tr
                  key={`${row.antecedent}-${row.consequent}`}
                  className={
                    row.result === "False"
                      ? "bg-orange-50/80 dark:bg-orange-950/20"
                      : "bg-zinc-50 dark:bg-zinc-900"
                  }
                >
                  <td className="px-4 py-3 font-mono">{row.antecedent}</td>
                  <td className="px-4 py-3 font-mono">{row.consequent}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{row.result}</td>
                  <td className="px-4 py-3 text-zinc-500">{row.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Figure>
  );
}
