import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "The type checker that can wait",
  description:
    "An elaborator that can answer “not yet” keeps evaluation order from turning missing type information into false rejections.",
  published: "2026-07-15T00:24:39Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-type-checker-that-can-wait.jpg",
    alt: "A mechanical railway interlocking frame with red, blue, and black levers lined up beside a control panel.",
    credit: {
      author: "Olga Ernst & Hp.Baumeler",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Mechanisches_Stellwerk_in_Hausen_im_Tal_(2018).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const orderSensitiveChecker = `
  let fType: Type | undefined;

  const solveF = () => {
    fType = arrow(nat, nat);
  };

  const checkCall = () => {
    if (!fType) throw new Error("f has no function type yet");
    return apply(variable("f"), numeral(3), fType);
  };

  run([checkCall, solveF]); // error
  run([solveF, checkCall]); // core application at Nat
`;

const suspendedElaboration = `
  type Elab<A> =
    | { tag: "done"; value: A }
    | { tag: "wait"; resume: (context: Context) => Elab<A> }
    | { tag: "error"; message: string };

  function bind<A, B>(
    job: Elab<A>,
    next: (value: A) => Elab<B>,
  ): Elab<B> {
    if (job.tag === "done") return next(job.value);
    if (job.tag === "error") return job;
    return {
      tag: "wait",
      resume: context => bind(job.resume(context), next),
    };
  }
`;

const surfaceAndCore = `
  surface: id 3
  core:    @id Nat 3
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          &quot;No&quot; and &quot;not yet&quot; are different answers, and a type checker that files both under
          the same exception will reject correct programs for arriving in the wrong order. The toy below does
          exactly that. One queue step supplies <code>f</code>&apos;s type and another checks a call to{" "}
          <code>f</code>; run them in one order and you get a core term, swap them and you get an error about a
          fact that was ten lines from being known.
        </p>
        <CodeBlock lang="ts" title="order-sensitive.ts" highlight="3-9,11-12" code={orderSensitiveChecker} />
        <p>
          What the checker wants is a third outcome. When the context cannot yet decide a required fact, the
          computation should hold on to the obligation and resume once somebody supplies the missing type —
          without inventing an answer, and without giving up.
        </p>
        <p>
          The split matters because only one of the two cases is a real rejection. If <code>f</code> is already
          known at type <code>Nat</code>, the call is wrong and no amount of rescheduling will save it. An absent
          type is another thing entirely, since later constraints may pin down exactly the function type the call
          needs, and a checker that throws on absence is rejecting programs it merely has not finished learning
          about.
        </p>

        <H2>Elaboration fills the missing core</H2>
        <p>
          This scheduling problem is elaboration&apos;s daily work. Proof assistants let you write{" "}
          <code>id 3</code> while the kernel insists on <code>@id Nat 3</code>, and somebody has to find that{" "}
          <code>Nat</code>.
        </p>
        <CodeBlock lang="text" title="One term at two levels" highlight="1-2" code={surfaceAndCore} />
        <p>
          Bidirectional typing splits the traffic: some terms synthesize a type outward, others check against a
          type flowing inward. Application is where the order becomes visible.
        </p>
        <FlowSequence
          steps={[
            { title: "Synthesize the function", detail: "Ask the context for its function type" },
            { title: "Wait on a missing fact", detail: "Keep the obligation instead of rejecting it" },
            { title: "Resume in a richer context", detail: "Use the solved metavariable without restarting" },
            { title: "Check the argument", detail: "Produce the result type and elaborated core term" },
          ]}
          caption="Suspension preserves the unfinished application until the context can answer it."
        />
        <p>
          The result type may mention the argument just checked. Any step can hit a fact the context does not
          hold yet, so waiting has to preserve both the obligation and the partial term around it.
        </p>

        <H2>Waiting composes</H2>
        <p>
          <a href="https://arxiv.org/abs/2607.09564">Bidirectional Elaborators à la Carte</a> specifies
          elaboration in a dependently typed monadic DSL. The TypeScript sketch below keeps only the operational
          outline, which is already worth a look.
        </p>
        <CodeBlock lang="ts" title="suspension-sketch.ts" highlight="1-4,6-16" code={suspendedElaboration} />
        <p>
          Read the <code>wait</code> branch of <code>bind</code>. A suspended job gets wrapped in a new
          suspension whose resume runs the original job under the richer context and then binds the remainder
          again — so the entire rest of the computation waits along with its earliest blocked step. Errors still
          cut through immediately, and finished values flow on as if nothing had happened.
        </p>
        <p>
          The part my sketch cannot show is why waiting is safe. A suspended computation may be resumed after
          metavariables have been solved and the context has grown, and the term it produces then has to agree
          with what the partial computation already committed to. The paper carries that burden with a presheaf
          model and dependent indexing: the DSL cannot produce an ill-typed core term, and elaboration is stable
          under substitution and judgmental equality. The TypeScript union is an intuition for the control flow,
          nothing more.
        </p>
        <p>
          That guarantee is precisely what a homemade promise pile lacks. Swapping the toy&apos;s exception for
          a callback would postpone the decision, but postponing proves nothing about whether reordered checks
          still mean the same typed term.
        </p>

        <H2>The locked lever stays visible</H2>
        <p>
          The paper abstracts over normal forms and conversion checking and then extracts a concrete elaborator
          from the algebra, which makes it a foundation rather than a settled production tool. Fine by me — the
          foundation is the part that usually gets hand-waved.
        </p>
        <p>
          In the opening queue, <code>checkCall</code> reaches for a locked lever and throws. The suspended
          version keeps its hand on the lever: the request for <code>f</code>&apos;s type rides along inside the
          result, and when <code>solveF</code> finally supplies <code>Nat → Nat</code>, the same obligation moves
          and the application receives its <code>Nat</code>. Signal boxes solved this by making wrong-order lever
          pulls mechanically impossible; the elaborator settles for making the order stop mattering.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
