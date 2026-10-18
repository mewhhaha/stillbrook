import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Modules that disappear at runtime",
  description:
    "1SubML checks modules as existential record values, then erases coercions, aliases, and identity witnesses before emitting JavaScript.",
  published: "2026-07-15T01:20:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-sleeper-moved-journal.webp",
    alt: "A carved wooden heron passes through a stone doorway as measuring supports crumble away behind it.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const erasurePolicy = `
  ast::Expr::Coerce(e) => compile(ctx, &e.expr)?,
  ast::Expr::Identity(..) => js::var("id".to_string()),

  fn compile_newtype(ctx: &mut Context<'_>, def: &NewtypeDef) {
      // Enum constructors keep runtime tags above this point.
      ctx.set_binding(def.name, js::var("id".to_string()));
      ctx.set_binding(def.name2, js::var("id".to_string()));
  }

  TypeAlias(..) => {}
`;

const counterModules = `
  alias Counter = {
      type s;
      new: s;
      increment: (s, int) -> s;
      get: s -> int;
  };

  let simple_counter = ({
      new = 0;
      increment = fun (n, inc) -> n + inc;
      get = fun n -> n;
  } :> Counter);

  let step_counter = ({
      new = {val=0; steps=0};
      increment = fun ({val; steps}, inc) ->
          {val=val + inc; steps=steps+1};
      get = fun c -> c.val;
  } :> Counter);
`;

const moduleUse = `
  let count_to = fun (ctr: Counter, target) -> (
      mod C = ctr;
      let rec go = fun state ->
          if C.get state >= target then C.get state
          else go (C.increment (state, 1));
      go C.new
  );

  mod C: Counter =
      if choose_simple then simple_counter else step_counter;
  print count_to (C, 5);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          My favorite four lines in 1SubML are in the code generator, and they are all anticlimaxes. A checked
          coercion compiles to its inner expression. An identity witness becomes the JavaScript function{" "}
          <code>id</code>, newtype wrap and unwrap both point at that same <code>id</code>, and a type alias
          compiles to nothing at all.
        </p>
        <CodeBlock
          lang="rust"
          title="compiler_lib/src/codegen.rs (abridged)"
          highlight="1-2,6-7,10"
          code={erasurePolicy}
        />
        <p>
          A backend this sparse is the receipt for a checker that already did the work. Before code generation,
          1SubML has verified structural subtyping, higher-rank polymorphism, existential members, and identity
          evidence — the JavaScript receives only the records and functions that survived the proofs.
        </p>

        <H2>A module is an existential record</H2>
        <p>
          What earns that erasure a whole essay is which feature it swallows: modules. The project&apos;s{" "}
          <a href="https://github.com/Storyyeller/1subml/blob/1a895060b384ac6410ca0e27d415b37669fe8541/README.md#modules-as-values">
            counter example
          </a>{" "}
          writes a module signature as a record type whose member <code>type s</code> hides the state
          representation behind the operations that use it.
        </p>
        <CodeBlock lang="ocaml" title="Counter.ml" highlight="1-6,8-12,14-19" code={counterModules} />
        <p>
          <code>simple_counter</code> picks <code>int</code> for <code>s</code>; <code>step_counter</code> picks a
          record that also counts its steps. Sealing either with <code>:&gt; Counter</code> checks the fields and
          takes the representation private, while the runtime value stays an ordinary record. No functor language,
          no separate module layer — an ordinary <code>if</code> can choose your module.
        </p>
        <p>
          Opening the package with <code>mod C = ctr</code> gives the hidden type a stable local name, which is
          what lets <code>count_to</code> call <code>C.increment</code> on <code>C.new</code> without knowing what
          either is. It also locks a door you want locked: a state born in <code>simple_counter</code> cannot be
          handed to <code>step_counter.increment</code>, even though both modules satisfy <code>Counter</code>.
        </p>
        <CodeBlock lang="ocaml" title="main.ml" highlight="1-7,9-12" code={moduleUse} />

        <H2>The checker pays for the erasure</H2>
        <p>
          None of this comes free — the complexity moved uphill into type comparison. 1SubML represents
          polymorphic structure with implicit{" "}
          <a href="https://github.com/Storyyeller/1subml/blob/1a895060b384ac6410ca0e27d415b37669fe8541/docs/guide_ch4.md#spine-constructors">
            spine constructors
          </a>
          : free pieces become variance-annotated parameters, structurally identical skeletons share one spine,
          and the checker trims unused parameters before building any of it.
        </p>
        <p>
          The same economy produces <code>a =&gt; b</code>, a type inhabited only by pure identity functions.
          Possessing such a value is evidence that the source type subtypes the target, so the checker consumes
          the fact and the backend emits <code>id</code> — or skips the call entirely when it can.
        </p>
        <DataTable
          head={["Construct", "In the emitted JavaScript"]}
          rows={[
            ["checked coercion", "its inner expression"],
            [
              "identity witness",
              <span key="witness">
                the function <code>id</code>
              </span>,
            ],
            ["type alias", "nothing"],
            ["enum constructor", "its tag, kept for pattern matching to inspect"],
            ["field the program reads", "kept"],
          ]}
          caption="The erasure policy in five rows, from the constructs that vanish to the ones that stay."
        />
        <p>
          Erasure does have limits, and they are the sensible ones. The backend deletes only what existed to
          convince the checker.
        </p>

        <H2>The small backend sharpens the claim</H2>
        <p>
          At commit{" "}
          <a href="https://github.com/Storyyeller/1subml/tree/1a895060b384ac6410ca0e27d415b37669fe8541">
            <code>1a89506</code>
          </a>{" "}
          the honest label is still experimental: a small standard library, acyclic imports, JavaScript as the one
          user-facing backend. The repository claims a worst-case polynomial type checker and, in the same guide,
          admits approximate exhaustiveness errors on pathological pattern trees. Whether the checker holds up in
          anger is nothing I can settle by reading the source.
        </p>
        <p>
          The playground is the right closing demonstration anyway. It compiles the counter modules and their
          typed evaluator into a JavaScript string and then runs <code>eval(compiled)</code> — and in the gap
          between those two calls, the signatures, coercions, aliases, and witnesses have already done their work
          and vanished.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
