import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Callout,
  CodeBlock,
  DataTable,
  FlowSequence,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "The type checker gets a second context",
  description:
    "Fibre keeps principal structural types in one small algebra and moves refinements, relationships, dependent results, and generic predicates into a separate local logic.",
  published: "2026-08-15T10:00:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-type-checker-gets-a-second-context-journal.webp",
    alt: "Overlapping architectural tracings cover a carved stone beside chisels, a mallet, and a completed stone arch.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const twoContexts = `
  Γ ; Φ ⊢ e ⇒ τ
  Γ ; Φ ⊢ e ⇐ τ

  Γ  ordinary types
     x : Int
     xs : Vec A
     f : A -> B

  Φ  facts about current value identities
     i >= 0
     i < len(xs)
     len(out) = len(xs)
     Sized(packet)
`;

const basicSyntax = `
  type Positive = { x: Int | x > 0 }

  type Fin(n: Nat) =
    { i: Nat | i < n }

  rel Sized(p: Packet) :=
    p.len = len(p.body)

  fn get[A](xs: Vec A, i: Fin(len(xs))) -> A

  fn send(p: Packet)
    needs Sized(p)
`;

const packet = `
  type Packet = {
    len: U16
    body: Bytes
  }

  rel Sized(p: Packet) :=
    p.len = len(p.body)

  fn decode(input: &mut Cursor) -> p: Packet
    gives Sized(p)
  {
    let n = input.readU16()
    let body = input.readExact(n)

    return Packet { len: n, body }
  }
`;

const dynamicCheck = `
  fn sendChecked(p: Packet) -> Result Unit BadLength {
    check Sized(p) else {
      return Err(BadLength)
    }

    send(p)
    return Ok(())
  }
`;

const dependentResult = `
  fn split[A](xs: Vec A, at: Nat)
    -> (left: Vec A, right: Vec A)
    gives {
      len(left) + len(right) = len(xs)
      len(left) <= at
    }

  let (a, b) = split(items, 8)

  // Φ now contains:
  // len(a) + len(b) = len(items)
  // len(a) <= 8
`;

const dependentPair = `
  fn readFrame(input: &mut Cursor)
    -> (n: Nat, bytes: Bytes where len(bytes) = n)
  {
    let n = input.readU16().toNat()
    let bytes = input.readExact(n)
    return (n, bytes)
  }
`;

const abstractPredicate = `
  fn preserve[A, P: Pred A](
    x: A,
    f: fn(A) -> A,
  ) -> y: A
    needs P(x)
    gives P(y)
  {
    let y = f(x)
    prove P(y)
    return y
  }
`;

const sequenceFacet = `
  facet Seq(F: Type -> Type) {
    fn len[A](xs: F A) -> Nat

    fn map[A, B](xs: F A, f: fn(A) -> B) -> ys: F B
      gives len(ys) = len(xs)
  }

  fn mapTwice[F, A, B, C](
    xs: F A,
    ab: fn(A) -> B,
    bc: fn(B) -> C,
  ) -> ys: F C
    where Seq(F)
    gives Seq(F).len(ys) = Seq(F).len(xs)
  {
    let bs = Seq(F).map(xs, ab)
    return Seq(F).map(bs, bc)
  }
`;

const logicGrammar = `
  term t ::=
      x
    | c
    | measure(t)
    | t + k

  fact φ ::=
      t = t
    | t <= t + k
    | tag(x) = K
    | R(t1, ..., tn)
    | φ and φ

  R is an opaque relation symbol unless a library summary
  or an explicit proof opens it.
`;

const solverExample = `
  known:
    body = readExact(cursor, n)
    len(readExact(cursor, n)) = n
    packet.len = n
    packet.body = body

  congruence:
    len(body) = n
    packet.len = n
    len(packet.body) = len(body)

  therefore:
    packet.len = len(packet.body)
    Sized(packet)
`;

const mutation = `
  fn truncate(p: &unique Packet, n: Nat) {
    // p0 : Packet
    // Φ contains Sized(p0)

    p.body = take(p.body, n)

    // p1 : Packet
    // facts mentioning the old body are gone
    // Sized(p1) is no longer known

    p.len = len(p.body)

    // p2 : Packet
    // the assignment gives p2.len = len(p2.body)
    // Sized(p2) is known again
  }
`;

const elaboration = `
  source
    { x: T | φ(x) }

  proof-explicit core
    (x: T, ghost: Proof φ(x))


  source
    fn f(x: T) -> y: U
      needs P(x)
      gives Q(x, y)

  proof-explicit core
    fn f(
      x: T,
      ghost in: Proof P(x),
    ) -> (
      y: U,
      ghost out: Proof Q(x, y),
    )

  erase(ghost) = nothing at runtime
`;

const proofTarget = `
  proof target

  If:
    Γ ; Φ ⊢ e ⇐ T
    and every fact in Φ is true of the current runtime values

  then:
    erase(e) cannot reach an operation whose needs-clause is false,
    and if erase(e) returns v, v has the ordinary runtime shape T.
`;

const localSummary = `
  FunctionSummary split {
    shape:
      forall A.
      (Vec A, Nat) -> (Vec A, Vec A)

    needs:
      true

    gives:
      len(left) + len(right) = len(input)
      len(left) <= at

    effects:
      none

    local Γ graph: discarded
    local Φ graph: discarded
  }
`;

const compilePipeline = [
  {
    label: "Shape",
    title: "Infer the principal ordinary type",
    detail: "Records, variants, functions, unions, and polymorphism stay in Γ. Values never participate in ordinary type equality.",
  },
  {
    label: "Facts",
    title: "Solve the local fibre",
    detail: "Congruence, offsets, bounds, tags, and opaque relation symbols live in Φ and are scoped to one checking unit.",
  },
  {
    label: "Boundary",
    title: "Close a small summary",
    detail: "Only the principal shape, public needs/gives facts, effects, and generic requirements escape the function.",
  },
  {
    label: "Erase",
    title: "Drop proof state before runtime",
    detail: "Static facts and proof terms vanish unless the program explicitly asks to reify one.",
  },
] as const;

const researchMap = [
  [
    "Principal structural inference",
    "Simple-sub / algebraic subtyping",
    "Keep it entirely in Γ; logical facts never mutate subtype bounds.",
  ],
  [
    "Automatic semantic predicates",
    "Liquid Types",
    "Use the refinement idea, but default to a fixed small theory product instead of general SMT queries.",
  ],
  [
    "Predicate-polymorphic generics",
    "Abstract Refinement Types",
    "Quantify over opaque relations directly in generic signatures.",
  ],
  [
    "Mutable refined state",
    "Flux",
    "Use unique ownership for strong updates and invalidate only facts incident to the written place.",
  ],
  [
    "Indexed and existential APIs",
    "Bidirectional indexed typing",
    "Check dependency where it appears rather than asking global inference to discover arbitrary dependent types.",
  ],
  [
    "Semantic foundation",
    "Fibrations / dependent refinement semantics",
    "Treat substitution as reindexing facts over a simpler underlying type system.",
  ],
] as const;

const solverCosts = [
  ["Ordinary shape constraints", "Simple-sub-style graph", "Principal inference, local simplification"],
  ["Ground equalities + measures", "Congruence closure", "Near-linear / n log n family of algorithms in classic results"],
  ["Bounds and offsets", "Difference-constraint graph", "Shortest-path closure; cubic worst case on a local pack"],
  ["Finite constructors", "Tag facts + ordinary pattern typing", "Small finite propagation"],
  ["Abstract generic relation", "Opaque predicate symbol", "No solving until instantiated or supplied by a contract"],
  ["Nonlinear theorem / induction", "Explicit proof boundary", "Not part of automatic type resolution"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="14 min read">
      <Prose>
        <p>
          I think I made the last few type-system sketches too eager to give every good idea its own mechanism. Relationship
          types got links. Rel got a fact graph. Facet split generic types into observable surfaces. Each move helped, but
          the pile started to look like exactly the kind of language design I was trying to avoid: four elegant features
          standing beside each other, politely refusing to admit they were the same problem.
        </p>
        <p>
          So I started again with a narrower question. What is the smallest type checker I can imagine that still gets
          most of the practical value from refinement types, dependent types, cross-value relationships, and serious
          generic abstraction? I want soundness to have a boring proof outline, and I want type resolution to have an
          algorithm I can explain without gesturing toward a theorem prover in another process.
        </p>
        <p>
          The answer I keep arriving at has two contexts. Call the language <strong>Fibre</strong> for now. The ordinary
          type system lives in <code>Γ</code>. A separate logical context, <code>Φ</code>, records facts about the current
          values. The important restriction is that <code>Φ</code> never participates in ordinary type equality or
          unification.
        </p>
        <CodeBlock lang="text" title="The whole checker, before the details" code={twoContexts} />

        <H2>The shape stays principal</H2>
        <p>
          The base layer should be aggressively conventional. I would start with the same family of ideas behind Lionel
          Parreaux&apos;s{" "}
          <a href="https://cse.hkust.edu.hk/~parreaux/publication/icfp20/">Simple-sub</a>: infer compact principal
          structural types with subtyping, then simplify them into something a person can read. The newer 2026 work on{" "}
          <a href="https://doi.org/10.1145/3776689">Boolean-algebraic subtyping</a> shows how much further that base can
          go with unions, intersections, negation, tagged records, and recursive types while keeping a principled
          structural story.
        </p>
        <p>
          Fibre does not require the fanciest version. That is part of the point. <code>Γ</code> can evolve from a small
          Hindley-Milner-ish core toward richer algebraic subtyping without changing what a length proof means, because
          a length proof never became a subtype edge in the first place.
        </p>
        <p>
          Refinement information enters through a second syntax. A refined value is an ordinary shape plus a proposition
          that must hold in <code>Φ</code>.
        </p>
        <CodeBlock lang="text" title="fibre syntax" code={basicSyntax} />
        <p>
          <code>Positive</code> and <code>Fin(n)</code> look like ordinary refinement types. <code>Sized</code> is a
          relationship over two fields. <code>get</code> looks dependently typed because the second parameter mentions
          the first. The checker does not need three different internal representations for those lines. They all become
          facts in the fibre over the current environment.
        </p>

        <H2>A relationship is a refinement with more than one endpoint</H2>
        <p>
          The packet example from the earlier essays survives almost unchanged. Its fields stay boring, while the useful
          agreement between them gets a name.
        </p>
        <CodeBlock lang="text" title="packet.fibre" highlight="6-7,9-16" code={packet} />
        <p>
          A successful call to <code>readExact(n)</code> contributes a fact saying the returned buffer has length{" "}
          <code>n</code>. The constructor copies <code>n</code> into the header. Congruence is enough to connect those
          equalities and establish <code>Sized(p)</code>. Nothing about the runtime packet carries a proof object unless
          the program explicitly asks for one.
        </p>
        <p>
          Untrusted input still needs a boundary. Fibre has a boring operation for that too: a dynamic check promotes a
          proposition into <code>Φ</code> on the successful path.
        </p>
        <CodeBlock lang="text" title="A runtime check establishes a static fact" code={dynamicCheck} />
        <p>
          This split matters to me more than making invalid states universally unrepresentable. Logging a malformed
          packet is useful. Rejecting it before transmission is useful. The type system should let the operation that
          needs the relationship ask for it instead of forcing every intermediate value into a different nominal type.
        </p>

        <H2>Dependent typing becomes substitution</H2>
        <p>
          Full dependent type theory lets arbitrary terms appear in types, which immediately raises the question of when
          two type-level programs are equal. Fibre refuses that problem. Term dependency appears only inside refinements
          and contracts, where function application substitutes actual values into logical formulas.
        </p>
        <CodeBlock lang="text" title="A dependent result without dependent type equality" code={dependentResult} />
        <p>
          At the call site, <code>xs</code> becomes <code>items</code> and <code>at</code> becomes <code>8</code>. The two
          postconditions are reindexed into the caller&apos;s <code>Φ</code>. Category theorists have been using fibrations to
          talk about exactly this sort of indexing and substitution for decades; Bart Jacobs&apos; work on{" "}
          <a href="https://doi.org/10.1016/0304-3975(93)90169-T">comprehension categories</a> is one standard route into
          that semantics.
        </p>
        <p>
          More recent work gives this refinement story directly. Satoshi Kura&apos;s{" "}
          <a href="https://link.springer.com/chapter/10.1007/978-3-030-71995-1_21">categorical construction of dependent
          refinement type systems</a>{" "}
          starts with an underlying type system and a fibration of predicates, then lifts dependent products, dependent
          sums, effects, and recursion under suitable conditions. That is close enough to the mathematical picture here
          that I would use it as the semantic blueprint rather than inventing a bespoke model.
        </p>
        <p>
          A dependent pair is equally ordinary. The second component can refer to the first in its refinement while both
          runtime values remain plain data.
        </p>
        <CodeBlock lang="text" title="A sigma-shaped pair in surface syntax" code={dependentPair} />
        <p>
          This deliberately gives up some things Agda, Idris, Lean, and F* can express. You cannot normalize an arbitrary
          recursive function inside type equality because Fibre has no such equality. The reward is that the ordinary
          type solver never becomes a theorem prover by accident.
        </p>

        <H2>Generic code can quantify over the fibre</H2>
        <p>
          Refinements get much more interesting when a generic function can abstract over the predicate itself. The
          useful precedent is{" "}
          <a href="https://goto.ucsd.edu/~rjhala/papers/abstract_refinement_types.html">Abstract Refinement Types</a>,
          which showed that refinement parameters can be encoded as uninterpreted propositions while preserving
          SMT-based decidability.
        </p>
        <CodeBlock lang="text" title="A predicate-polymorphic function" code={abstractPredicate} />
        <p>
          <code>P</code> is opaque inside the generic. The function may assume it, require it, pass it along, and return
          evidence for it, but it cannot inspect the definition. That is exactly the abstraction boundary I want. A
          generic relationship behaves more like a type parameter than like a macro that pastes arbitrary logic into the
          solver.
        </p>
        <p>
          Type constructors fit the same picture. Facet&apos;s idea that a higher-kinded parameter can be an ordinary
          compile-time function still works, while laws about values produced by that constructor live in <code>Φ</code>.
        </p>
        <CodeBlock lang="text" title="A generic type constructor with a relational law" highlight="1-7,9-22" code={sequenceFacet} />
        <p>
          <code>F</code> belongs to the type-level part of <code>Γ</code>. The length-preservation law belongs to the
          fibre. The generic body is checked once under both abstractions. We do not need a special mechanism called
          associated refinement, another one called typeclass law, and a third one called dependent postcondition.
        </p>

        <H2>The automatic logic should be almost disappointingly small</H2>
        <p>
          Liquid Types earned their usefulness by trading logical expressiveness for automation. Their original PLDI
          paper combines Hindley-Milner inference with predicate abstraction to infer dependent refinements with very
          little annotation. Fibre keeps that bargain and makes the automatic fragment even more explicit.{" "}
          <a href="https://goto.ucsd.edu/~rjhala/papers/liquid_types.html">The Liquid Types paper</a>{" "}
          is still the obvious ancestor here.
        </p>
        <CodeBlock lang="text" title="The default proposition language" code={logicGrammar} />
        <p>
          Ground equality with uninterpreted measures such as <code>len</code> is a congruence-closure problem. Nelson
          and Oppen&apos;s classic work gives decision procedures for quantifier-free equality by computing that closure.
          Bounds and offsets use difference constraints, the same graph-shaped family that underlies zones and the more
          expressive octagon abstract domain. Antoine Miné&apos;s{" "}
          <a href="https://arxiv.org/abs/cs/0703084">octagon paper</a>{" "}
          gives the familiar quadratic-space, cubic-closure engineering point for that richer domain.
        </p>
        <CodeBlock lang="text" title="The Sized proof is mostly congruence" code={solverExample} />
        <FlowSequence
          steps={compilePipeline}
          caption="Fibre separates principal shape inference, local fact solving, boundary summarization, and proof erasure."
        />
        <p>
          I would begin even smaller than octagons: equalities plus difference constraints shaped like{" "}
          <code>x - y &lt;= k</code>, finite constructor tags, and opaque relation symbols. Multiplication, quantifiers,
          induction, arbitrary recursive unfolding, and user-defined solver theories stay out of the default loop.
          They can cross an explicit proof boundary instead.
        </p>
        <DataTable
          head={["Question", "Default mechanism", "Resolution story"]}
          rows={solverCosts}
          caption="The default checker has a fixed collection of small decision procedures; harder mathematics is explicit rather than silently added to type resolution."
        />
        <p>
          This is stricter than modern SMT-backed refinement systems. It is also easier to profile, cache, and explain.
          The new 2026{" "}
          <a href="https://arxiv.org/abs/2607.00824">Ranger work on practical range refinements</a>{" "}
          is a useful reminder that there is still active research in getting useful imperative refinements from a
          deliberately narrow domain plus bidirectional and flow-sensitive inference, rather than solving every theorem
          the language can state.
        </p>

        <H2>Mutation changes identities, not the logic</H2>
        <p>
          Refinements over mutable data are where clean whiteboard systems usually start lying. If two aliases can
          mutate the same field, a fact about that field can become false behind the checker&apos;s back. I would borrow
          the strong part of Rust&apos;s bargain here: refined mutation requires a unique path.
        </p>
        <CodeBlock lang="text" title="Strong update by value identity" code={mutation} />
        <p>
          Internally, each write gives the place a fresh SSA-like identity. Facts mentioning the old projection do not
          automatically transfer to the new one. Nico Lehmann and collaborators&apos;{" "}
          <a href="https://arxiv.org/abs/2207.04034">Flux</a>{" "}
          is the closest practical evidence I know for this combination: it uses Rust&apos;s ownership discipline to make
          refined mutable locations and strong updates tractable, and formalizes the safety dependency on the aliasing
          model.
        </p>
        <p>
          Fibre would be less ambitious than Flux&apos;s full refinement language. The lesson I want is narrower: aliasing
          control gives a fact context a trustworthy notion of "the value after this write." Without that, every
          relational invariant around mutation turns into a miniature separation-logic problem.
        </p>

        <H2>Bidirectionality draws the line around clever inference</H2>
        <p>
          A principal base type does not imply that every rich signature should be inferred. Higher-rank polymorphism,
          indexed types, and existentials are exactly where bidirectional typing earns its keep: synthesize ordinary
          information, check expressive information against a known boundary.
        </p>
        <p>
          Jana Dunfield and Neel Krishnaswami&apos;s{" "}
          <a href="https://arxiv.org/abs/1908.05839">bidirectional typing survey</a>{" "}
          lays out that design discipline, while their work on{" "}
          <a href="https://arxiv.org/abs/1601.05106">indexed types and existentials</a>{" "}
          shows a sound and complete bidirectional account with refinement-style equality information and significant
          inference. Fibre would use the same social contract with the programmer: ordinary expressions synthesize;
          dependent views and higher-rank boundaries are places where a signature may be required.
        </p>
        <p>
          That keeps the hard feature from infecting every local variable. Most code sees principal shapes and facts
          learned from control flow. The fancy type appears where a human chose to make it part of an API.
        </p>

        <H2>Soundness should reduce to an erasure theorem</H2>
        <p>
          I do not want the soundness argument to depend on trusting the source syntax. The clean route is to elaborate
          Fibre into a proof-explicit core, then erase the proofs before execution.
        </p>
        <CodeBlock lang="text" title="Elaboration sketch" code={elaboration} />
        <p>
          Explicit Refinement Types takes a related route: proofs are present in the formal calculus, refinements erase
          to a simply typed program, and the authors formalize soundness in Lean. Their system intentionally gives up
          SMT automation to support a much richer logic. Fibre would use the same proof-erasure shape while allowing the
          small automatic solver to synthesize many of those ghost proofs. The{" "}
          <a href="https://arxiv.org/abs/2311.13995">lambda-ert paper</a>{" "}
          is useful here precisely because it separates the semantic question from solver convenience.
        </p>
        <CodeBlock lang="text" title="The theorem I would want before calling the language sound" code={proofTarget} />
        <p>
          The actual mechanized proof would still be work. The architecture at least keeps the obligations legible:
          prove the base calculus sound, prove every automatic decision procedure sound, prove elaboration preserves the
          source judgments, then prove erasure preserves runtime behavior. A stronger solver can make the checker accept
          more programs without changing the theorem.
        </p>
        <Callout variant="note" title="Sound does not mean complete">
          <p>
            Fibre should reject some true statements. If the automatic fibre cannot prove a nonlinear fact, the user
            can insert a checked boundary, call a separately verified proof function, or choose a richer verification
            mode. Predictable incompleteness is preferable to making everyday type resolution depend on an open-ended
            theorem search.
          </p>
        </Callout>

        <H2>Compilation closes the fibre early</H2>
        <p>
          The performance story gets better if <code>Φ</code> is local by construction. A function, recursive SCC, or
          explicit checking scope gets a fresh fact graph. When the scope closes, the compiler exports a summary and
          throws the working proof state away.
        </p>
        <CodeBlock lang="text" title="A closed function summary" code={localSummary} />
        <p>
          This is the same direction as <a href="/articles/make-the-type-checker-forget">Make the type checker forget</a>,
          now with a cleaner theoretical boundary. Callers depend on a principal type plus a small set of named
          contracts, not on the callee&apos;s internal equality graph, branch refinements, or solver variables.
        </p>
        <p>
          The fixed solver fragment gives the compiler an unusually concrete cost model. Classic congruence closure has
          near-linear or <code>n log n</code>-family algorithms for the ground equality problem. Difference-bound closure
          has a cubic worst case in the number of variables in one pack, which is why the pack should be one local
          function-sized neighbourhood instead of the whole program. The type graph and fact graph can be cached and
          invalidated independently.
        </p>

        <H2>The research pieces already exist; the cut is the experiment</H2>
        <p>
          I do not think the mathematical ingredients here are new. Fibrations already organize predicates over
          contexts. Liquid typing already makes dependent refinements automatic. Abstract refinements quantify over
          predicates. Flux connects refinements to ownership. Bidirectional systems handle indexed and existential
          boundaries. Algebraic-subtyping work keeps pushing principal structural inference further.
        </p>
        <DataTable
          head={["Piece", "Closest research line", "Fibre's proposed cut"]}
          rows={researchMap}
          caption="Fibre is a proposed compiler architecture and source language assembled from established lines of type-theory research."
        />
        <p>
          The part I have not found packaged this way is the strict algorithmic separation: principal structural
          inference never sees logical predicates; the logical fibre is a fixed product of small decidable theories;
          cross-value relationships are ordinary named contracts; dependent types elaborate to substitution in that
          fibre; abstract predicates are generic parameters; and every function closes both contexts into a small
          summary. Structural Refinement Types gets surprisingly close on the algebraic side, and Kura&apos;s categorical
          construction gets close on the semantic side, which is why I would be cautious about calling the combination
          novel before a serious literature pass.
        </p>
        <p>
          Still, it is specific enough to build. The first prototype does not need induction, a universe hierarchy, a
          general SMT bridge, dependent pattern matching, or a kind checker. It needs two graphs, a bidirectional
          boundary, a tiny proof language, and enough syntax to make the distinction visible without turning every
          function signature into a paper.
        </p>
        <p>
          The Jacquard cards in the photograph are separate strips connected into one program for the loom. Fibre&apos;s
          split feels similar in a useful, unromantic way. <code>Γ</code> says what shape of thing can pass through the
          machine. <code>Φ</code> carries the holes that constrain this particular run. Keeping the two strips separate
          is what lets the checker stay small while the program says more.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
