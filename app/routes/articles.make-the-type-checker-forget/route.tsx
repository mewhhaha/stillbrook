import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  Callout,
  CodeBlock,
  Compare,
  FlowSequence,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Make the type checker forget",
  description:
    "Blot already keeps refinement facts out of algebraic subtyping. Push that separation further and functions and data structures can become local solver islands that mint generic type families, close their proofs, emit HIR, and then disappear from the checker.",
  published: "2026-08-12T10:30:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Telephone_switchboard_operators%2C_ca_1922_%28MOHAI_5108%29.jpg",
    alt: "A telephone operator sits at a large switchboard, connecting individual lines with patch cords in Seattle around 1922.",
    credit: {
      author: "Webster & Stevens",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Telephone_switchboard_operators,_ca_1922_(MOHAI_5108).jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const currentJudgement = `
  Γ ; K ; Φ ; R ; Ω ⊢ e : A ! E ; C

  Γ  ordinary inferred types
  K  compile-time values
  Φ  integer relationships
  R  value identities and array lengths
  Ω  ownership paths
  C  erasable lowering certificates
`;

const localIsland = `
  check_scope(imported_summaries, body):
    types = fresh Simple-sub graph
    facts = fresh refinement graph
    relations = fresh value identities
    ownership = fresh ownership state

    infer body
    prove local obligations
    settle public boundary
    emit Runtime HIR

    return ScopeSummary {
      scheme,
      effects,
      families,
      refinements,
      ownership,
      hir,
    }

    // types, facts, relations: gone
`;

const scopeSummary = `
  struct ScopeSummary {
      scheme: ClosedType,
      effects: ClosedEffects,
      families: Vec<FamilySummary>,
      refinements: Vec<BoundaryFact>,
      ownership: OwnershipSummary,
      hir: RuntimeHir,
      dependencies: SummaryFingerprint,
  }
`;

const proposedArena = `
  // Proposed Blot, not current syntax.
  const Arena = fn Element =>
    @type.scope (fn Scope =>
      const Id = fn Payload =>
        @type.family (Scope, "Id", Payload)

      const Cursor = fn Payload =>
        @type.family (Scope, "Cursor", Payload)

      return {
        .Id = Id;
        .Cursor = Cursor;
        .insert = fn value => ...;
        .get = fn id => ...;
      }
    )
`;

const localGeneric = `
  // A local generic is still an ordinary comptime function.
  const PairOf = fn Family => fn A => {
    .left = Family A;
    .right = Family A;
  }

  let arena = Arena Str
  const TwoIds = PairOf arena.Id Int

  // TwoIds is a pair of IDs from this arena only.
  // Another arena has a different Id family.
`;

const familyRepresentation = `
  // Today, simplified:
  enum Type {
      Variable(VariableId),
      Rigid(VariableId),
      // ...
      Opaque(String),
  }

  // One possible direction:
  enum TypeNode {
      // ... existing structural cases ...
      Family {
          scope: ScopeId,
          family: FamilyId,
          arguments: Vec<TypeId>,
      },
      Package {
          scopes: Vec<ScopeId>,
          body: TypeId,
      },
  }
`;

const packedArena = `
  // Source view:
  let arena = makeArena Str
  let id = arena.insert "brook"

  // Checker view, approximately:
  arena : exists s. Arena<s, Str>

  // Opening the package gives this lexical scope a fresh rigid name s.
  // id : Id<s, Str>
  // The s is erased before runtime.
`;

const boundaryRefinement = `
  fn split(bytes, n)
    requires 0 <= n
    ensures left.len + right.len == bytes.len
    ensures left.len == min(n, bytes.len)
    => (left, right)
`;

const localProof = `
  inside split:
    i = min(n, bytes.len)
    0 <= i
    i <= bytes.len
    left.len = i
    right.len = bytes.len - i
    cursor = i
    remaining = bytes.len - cursor
    ... 27 more temporary facts ...

  outside split:
    left.len + right.len = bytes.len
    left.len = min(n, bytes.len)
`;

const cacheExample = `
  fn parseHeader(input) =>
    // edit implementation here
    ...

  // Old body hash:  91d8...
  // New body hash:  44a1...
  // Public summary: 7b0c...  <- unchanged

  // Recheck parseHeader.
  // Reuse callers that only depend on summary 7b0c...
`;

const currentProfile = `
  list-heavy compiler profile, 9 samples

  checking                 6.60 ms
  preparing Runtime HIR   14.40 ms
  emitting WebAssembly     0.293 ms
  total                    23.60 ms

  final HIR: 63 operations
`;

const patchTypecheck = `
  // compiler/src/typecheck.rs
  struct ScopeChecker {
      types: ConstraintTypeArena,
      variables: Vec<Variable>,
      refinements: RefinementContext,
      relations: RelationArena,
      ownership: OwnershipState,
  }

  fn close(self, boundary: Boundary) -> ScopeSummary {
      // reject escaping inference variables
      // quantify permitted generics
      // preserve generated ScopeIds intentionally
      // project Φ down to boundary-visible identities
      // close ownership and effects
      // commit HIR
  }
`;

const patchPrimitive = `
  // compiler/src/primitives.rs
  @type.scope  : (Scope -> A) -> packaged A
  @type.family : (Scope, Text, TypeArgs) -> Type

  // Checker-only projection. This does not make runtime types reflectable.
  @type.member : (scoped_value, Text) -> comptime TypeConstructor
`;

const rollout = [
  {
    label: "Patch 1",
    title: "Split the checker before changing the language",
    detail: "Give functions and recursive SCCs local inference arenas, close summaries, emit HIR on close, and benchmark it.",
  },
  {
    label: "Patch 2",
    title: "Export refinement summaries",
    detail: "Project the existing difference-constraint facts onto parameters, results, and public fields only.",
  },
  {
    label: "Patch 3",
    title: "Add generative type families",
    detail: "Introduce scope identities and local generic constructors as compile-time closures over those identities.",
  },
  {
    label: "Patch 4",
    title: "Package runtime-generated scopes",
    detail: "Open hidden scope identities as local rigids when a generated structure is unpacked; erase them before runtime.",
  },
] as const;

const comparisonAttributes = [
  "Inference graph",
  "Refinement facts",
  "Generic families",
  "Incremental dependency",
  "HIR",
] as const;

const comparisonEntities = [
  {
    name: "Current direction",
    values: [
      "Shared through a larger checking unit",
      "Auxiliary and lexical, already outside subtyping",
      "Staged constructors plus module-stable nominal types",
      "Mostly module revision and declaration-prefix reuse",
      "Prepared after checking from retained facts",
    ],
  },
  {
    name: "Solver islands",
    values: [
      "Fresh per function, recursive SCC, or scoped structure",
      "Private graph; only boundary projection escapes",
      "A local constructor may close over a fresh ScopeId",
      "Depend on a closed summary fingerprint",
      "Committed as the island closes",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="11 min read">
      <Prose>
        <p>
          The last two articles kept moving type information inward. First I put invariants on{" "}
          <a href="/articles/a-language-made-of-links">links between values</a>. Then I let an individual data
          structure{" "}
          <a href="/articles/let-the-data-structure-invent-types">mint types that belong only to itself</a>.
          There is an obvious way to keep going: let the local scope become more sophisticated until it is almost a
          tiny language of its own.
        </p>
        <p>
          That sounds like a recipe for a miserable type checker. Every arena creates its own generic family. Every
          buffer has offsets tied to its identity. Functions accumulate equalities and bounds. A parser knows dozens of
          relationships between cursor positions, lengths, slices, and results. If all of that enters one global type
          problem, the feature has failed before the syntax is finished.
        </p>
        <p>
          I think the useful direction is the reverse. Make local types more expressive <em>because</em> the compiler
          promises to forget them. A function or data scope can have a fresh inference graph, a refinement context,
          generated type families, value identities, and ownership proofs. When the scope closes, the checker exports
          a small summary and throws the working state away.
        </p>
        <p>
          I wanted to see whether this was remotely compatible with a real compiler, so I went through{" "}
          <a href="https://github.com/mewhhaha/blot">Blot</a>. It turns out Blot is a particularly convenient victim
          because it already made the most important architectural decision: refinement is not algebraic subtyping.
        </p>

        <H2>Blot already has two worlds</H2>
        <p>
          Blot&apos;s ordinary inference engine follows Lionel Parreaux&apos;s{" "}
          <a href="https://cse.hkust.edu.hk/~parreaux/publication/icfp20/">Simple-sub</a> shape: inference variables
          collect lower and upper bounds, levels control generalization, and biunification propagates subtype
          constraints. The point of that engine is boring but valuable: compact principal types with a polynomial
          algorithm.
        </p>
        <p>
          The checker spec then puts a second set of knowledge beside that lattice. Stripped down, its full judgment
          looks like this:
        </p>
        <CodeBlock lang="text" title="Blot's checking judgment" code={currentJudgement} />
        <p>
          <code>Phi</code> is relational knowledge. <code>R</code> records identities such as a particular array and
          its length. <code>Omega</code> is ownership. Certificates authorize later lowering decisions. The spec is
          explicit that none of these participates in subtype propagation.
        </p>
        <p>
          That separation exists for a good reason. Blot&apos;s branch narrowing does not push an intersection or a
          complement into a type variable. It computes a ground result, shadows the name in a child environment, and
          keeps the Simple-sub graph untouched. If branch refinements were allowed to mutate shared upper bounds, facts
          from one branch could leak into another. If arbitrary logical intersections and complements became ordinary
          positive types, the nice algebraic solver would quietly become a much nastier problem.
        </p>
        <p>
          The current refinement implementation is deliberately small too. Its propositions are affine integer facts:
          equality with an offset, lower and upper bounds, strict ordering, and difference bounds. They become
          difference constraints such as <code>x - y &lt;= k</code>. Entailment is shortest-path closure. The code even
          says why it recomputes closure instead of building a grand incremental theorem prover: the expected contexts
          are small.
        </p>
        <p>
          That line feels like the opening. Keep making the contexts small on purpose.
        </p>

        <H2>A function can be a solver island</H2>
        <p>
          Today it is natural to picture inference as one graph that lexical environments point into. A child scope
          changes name lookup, but inference variables still belong to the larger solver. That is exactly what you want
          while two expressions are jointly constraining one unknown. It is less obviously what you want after a
          function has a closed principal type.
        </p>
        <p>
          I would make a function body an actual checking boundary. Recursive functions are the exception: a mutually
          recursive strongly connected component has to be one island because its members genuinely constrain each
          other. Blot already discovers recursive SCCs for other compiler work, so this is not a new graph problem.
        </p>
        <CodeBlock lang="text" title="One local checking unit" code={localIsland} />
        <p>
          The important word is <em>closed</em>. A summary cannot contain a pointer to a live inference variable, a
          branch-local value identity, or a random node in the refinement graph. If the boundary needs polymorphism,
          quantify it. If it intentionally exports a generated identity, name that identity in the summary. Everything
          else dies with the island.
        </p>
        <CodeBlock lang="rust" title="A possible closed summary" code={scopeSummary} />
        <p>
          Callers constrain against the summary rather than reaching into the callee&apos;s graph. This is less magical
          than it sounds. Module interfaces already work this way: Blot&apos;s incremental spec refuses to cache an
          interface containing live inference variables or unbound rigid identities. I am proposing the same hygiene
          one level lower.
        </p>

        <H2>Now local generics become cheap enough to be interesting</H2>
        <p>
          The previous article gave an arena its own <code>Id</code>. Push that harder and the arena should be allowed
          to own a <em>generic type constructor</em>, not merely one zero-argument brand. An arena might have{" "}
          <code>Id&lt;Payload&gt;</code>, <code>Cursor&lt;Mode&gt;</code>, a state type, and relationships between all of them.
        </p>
        <p>
          Blot already has a nice answer to higher-kinded abstraction: a type constructor is just a compile-time
          function. The inference lattice does not need kinds because the function is evaluated and specialized before
          runtime typing needs to represent it. I would preserve that rule completely.
        </p>
        <CodeBlock lang="text" title="Proposed Blot sketch" highlight="3-9" code={proposedArena} />
        <p>
          <code>@type.scope</code> creates one fresh compile-time identity. <code>@type.family</code> creates a nominal
          family under it. <code>Id</code> itself is an ordinary compile-time closure over <code>Scope</code>, which means
          it can be passed to another type-level function without inventing a new kind system.
        </p>
        <CodeBlock lang="text" title="Passing a local generic around" code={localGeneric} />
        <p>
          This is the part I find more interesting than simply having path-dependent aliases. A data structure can
          manufacture a <em>family of types</em>, hand that family to generic compile-time code, receive a transformed
          family back, and still keep the whole construction confined to one generated scope.
        </p>
        <p>
          Two arenas may both expose a function printed as <code>Id</code>. Their identities still differ because the
          constructor&apos;s real key is something like <code>(scope, family, arguments)</code>, not the display name.
          Equality is then an integer-identity comparison plus argument comparison, which fits Blot&apos;s flat-arena
          direction much better than growing strings such as{" "}
          <code>"Arena&lt;some huge path&gt;::Id&lt;Int&gt;"</code> through the solver.
        </p>

        <H2>The existing nominal type is almost, but not quite, this</H2>
        <p>
          Blot already has <code>@type.seal</code>. The current primitive constructs a sealed value from a text name and
          a carrier, and the Rust type representation eventually has an <code>Opaque(String)</code> case. That is useful
          for a normal nominal type such as <code>Centimeter</code>. It is the wrong identity source for a type generated
          by the third arena created at runtime.
        </p>
        <p>
          I would split human naming from semantic identity and make generated families first-class in the internal
          type graph:
        </p>
        <CodeBlock lang="rust" title="A type representation direction" highlight="11-20" code={familyRepresentation} />
        <p>
          Start invariant. Variance across a locally generated family can come later if a real program needs it. A
          zero-argument, module-stable family can implement today&apos;s sealed nominal types, so this can be an extension
          of the existing mechanism instead of a second nominal system.
        </p>

        <H2>A runtime-created scope needs a package, not a runtime tag</H2>
        <p>
          Compile-time-generated families are the easy half. The previous article wanted <em>each runtime arena
          instance</em> to mint its own handle family. That means the function returning an arena is hiding a fresh type
          name from its caller.
        </p>
        <CodeBlock lang="text" title="The hidden type name" code={packedArena} />
        <p>
          Type theory has a familiar name for that package. I would avoid making arbitrary existential syntax part of
          Blot&apos;s source language at first, though. <code>@type.scope</code> can produce an internal package, and ordinary
          binding can open it automatically as a fresh rigid identity for the lexical lifetime of the unpacked value.
        </p>
        <p>
          Put ten arenas in an array and each element is packaged. Pull one out and the checker opens one fresh local
          rigid. Pass the arena and its IDs together and the rigid remains shared across the values. Let the package die
          and the identity dies too. None of this requires a scope tag in WebAssembly. The brand exists for checking and
          specialization, then erases.
        </p>
        <p>
          There is one compiler capability Blot is already circling around that would make the surface pleasant. A
          compile-time function currently cannot simply inspect the inferred type of an arbitrary runtime argument;
          <code>@type.of</code> evaluates its operand, which is intentionally not runtime reflection. Blot&apos;s own design
          notes need a checker-only version of this capability for resolving interfaces attached to inferred types. The
          same narrow mechanism could project <code>arena.Id</code> from a scoped value without turning every runtime
          type into inspectable data.
        </p>
        <CodeBlock lang="text" title="Possible primitive boundary" code={patchPrimitive} />

        <H2>Refinement should get stronger by staying local</H2>
        <p>
          Once functions are islands, I would be much less nervous about giving their refinement context more work.
          Not arbitrary theorem proving—just more facts in the fragment Blot already handles well. A parser function
          can have thirty cursor and length relations internally if the caller only receives two of them.
        </p>
        <CodeBlock lang="text" title="A public contract" code={boundaryRefinement} />
        <CodeBlock lang="text" title="What the local proof graph might know" code={localProof} />
        <p>
          Closing an island becomes a projection problem. Keep only propositions whose identities are visible at the
          boundary: parameters, returned values, public fields, and intentionally exported generated scopes. Eliminate
          local temporaries. If a public fact is implied by the local graph, serialize the compact fact. If it is not,
          it does not get to escape merely because the implementation happened to assume it.
        </p>
        <p>
          This resembles the useful boundary in Benjamin Cosman and Ranjit Jhala&apos;s{" "}
          <a href="https://arxiv.org/abs/1706.08007">Local Refinement Typing</a>: infer rich intermediate
          refinements locally and ask programmers for signatures mainly at exported or cyclic boundaries. Liquid Types
          similarly showed that a decidable predicate vocabulary can infer refinements precise enough for useful safety
          properties without making every term carry a hand-written proof. I would borrow the locality, not transplant
          an SMT architecture wholesale into Blot.
        </p>
        <p>
          Blot&apos;s difference constraints have another nice property here: they summarize. If the local graph knows{" "}
          <code>a - b &lt;= 4</code>, <code>b - c &lt;= 7</code>, and a hundred unrelated facts, it can export the entailed
          boundary relation <code>a - c &lt;= 11</code> without exposing <code>b</code> at all. The closure algorithm is
          already doing the mathematical part.
        </p>

        <H2>Relationships become part of the summary, not the main type</H2>
        <p>
          This is where the three articles finally line up. A generated family answers where a value belongs. A local
          relationship answers what is currently true about that value. The principal algebraic type answers how the
          value can be used structurally. Ownership answers whether it may be moved or changed.
        </p>
        <p>
          I would keep those as separate coordinates rather than trying to make one heroic type expression contain
          everything. Blot&apos;s experimental owned-region work is already written this way: store provenance, ordinary
          path-sensitive ownership, region-family derivation, and the destructive HIR operation form a proof stack.
          Region authority deliberately stays out of algebraic subtyping.
        </p>
        <p>
          A proof-producing data structure could therefore own a little bundle of local systems. An arena owns its{" "}
          <code>Id&lt;T&gt;</code> family. A partitionable buffer owns an interval relationship algebra. A transaction owns
          row-view families and a liveness relation. A parser state owns source-position families and cursor ordering.
          Generic functions over the structure import only the pieces they name.
        </p>

        <Compare
          attributes={comparisonAttributes}
          entities={comparisonEntities}
          caption="The proposal does not make the ordinary type lattice more logical. It makes the auxiliary reasoning smaller, more numerous, and easier to close."
        />

        <H2>This could also be a compiler optimization</H2>
        <p>
          So far this is a language argument. Blot gives it a compiler-performance reason too. Its current design notes
          include a nine-sample profile of a list-heavy compile: 23.6 ms overall, with 6.60 ms in checking, 14.4 ms
          preparing Runtime HIR, and 0.293 ms actually emitting WebAssembly.
        </p>
        <CodeBlock lang="text" title="A profile already in Blot's design notes" code={currentProfile} />
        <p>
          I would not claim solver islands automatically make the 6.60 ms smaller. They add boundaries, summary
          construction, and potentially repeated instantiation. A monolithic graph can be efficient precisely because
          it shares work. This needs a benchmark, not a slogan.
        </p>
        <p>
          The incremental case is more concrete. Today Blot&apos;s cache rules are primarily module-shaped, with some reuse
          for an unchanged top-level declaration prefix. A closed function summary gives the compiler a finer semantic
          dependency. Change a body, recheck its island, and compare its summary fingerprint. If the public summary did
          not change, callers have no new typing fact to observe.
        </p>
        <CodeBlock lang="text" title="Semantic invalidation below the module" code={cacheExample} />
        <p>
          Generative identities have to participate in that fingerprint. Blot&apos;s incremental spec already says a cache
          hit is unsound if a reachable generative identity changed. A locally generated family makes that rule more
          common, not different.
        </p>
        <p>
          The larger opportunity is the 14.4 ms HIR preparation. Blot&apos;s own next-step note says to progressively emit
          settled Runtime HIR during checking and delete request-local fact-map reconstruction. A solver island gives a
          clean commit point: once its summary and proofs are closed, build its HIR while the useful local identities
          are still in hand, then discard them instead of reconstructing their meaning later.
        </p>

        <H2>The actual Blot patch I would try first</H2>
        <p>
          I would not start by adding <code>@type.scope</code>. The compiler architecture should prove that the boundary
          is useful before the source language depends on it.
        </p>
        <CodeBlock lang="rust" title="compiler/src/typecheck.rs, direction only" code={patchTypecheck} />
        <p>
          Give every non-recursive function a <code>ScopeChecker</code>. Give each recursive SCC one shared checker.
          Imports arrive as immutable closed summaries. Generalization and settling happen before <code>close</code>{" "}
          returns. Any inference variable that still points outward without an explicit quantifier is a compiler error,
          not something silently retained in a parent graph.
        </p>
        <p>
          Then move the refinement context in with it. Blot&apos;s TypeScript authority already creates child refinement
          contexts for branch proofs; the experiment is to make a function own the root of that context and to add a
          boundary-projection pass. The Rust compiler should eventually carry the same compact representation so there
          is still one semantic compiler rather than a clever editor checker and a different production checker.
        </p>
        <p>
          Next, teach <code>compiler/src/session.rs</code> to cache the closed summary by the function&apos;s lowered body,
          imported summaries, compile-time dependencies, and reachable generative identities. Teach{" "}
          <code>compiler/src/hir.rs</code> to accept a closed island directly. Only after measuring that pipeline would
          I introduce type families in <code>compiler/src/value.rs</code>, <code>typecheck.rs</code>, and{" "}
          <code>primitives.rs</code>.
        </p>

        <FlowSequence
          steps={rollout}
          caption="The source-language experiment comes after the compiler has already learned how to close and forget local reasoning state."
        />

        <H2>There is a limit, and I would enforce it</H2>
        <Callout variant="caution" title="Do not turn every expression into a theorem boundary">
          <p>
            An island has overhead. I would use functions, recursive SCCs, modules, and explicitly generative data
            scopes as boundaries. A three-line arithmetic expression does not need its own solver, cache key, family
            namespace, and summary object.
          </p>
        </Callout>
        <p>
          I would also keep Blot&apos;s current refusal to put arbitrary refinement logic into the Simple-sub lattice.
          Locality makes stronger proof systems more tolerable; it does not make them free. Difference constraints and
          ground set algebra should remain the fast editor path. A future stronger solver could be invoked inside an
          island that asks for it, produce a small checked certificate, and disappear again.
        </p>
        <p>
          Local generics should stay staged and predicative too. Blot already has explicit <code>@forall</code> for
          Rank-N use and refuses impredicative inference. A generated <code>arena.Id</code> does not require reopening
          that problem. It is a compile-time function closing over a rigid scope identity, and applications specialize
          to ordinary closed types.
        </p>
        <p>
          Finally, a summary must be intentionally lossy. If callers can ask arbitrary questions about a function&apos;s
          internal proof graph, the graph is part of the interface and the island never closed. The compiler should
          make you name the relationships you want to preserve.
        </p>

        <H2>The strange end point is a simpler global checker</H2>
        <p>
          If this works, the language gets locally weirder while the whole-program type problem gets more boring. A
          structure can create generic types. A function can build a dense little refinement graph. A region can have
          its own proof algebra. A recursive group can infer against itself. None of those graphs is automatically a
          graph the rest of the program has to carry.
        </p>
        <p>
          The switchboard image at the top is a decent model for it. The operator establishes the connection that
          matters now. The rest of the board does not become one cable. When a local call is done, most of the patch
          cords can come out; what survives is the route that somebody outside actually needs.
        </p>
        <p>
          That is the version of advanced types I want to try in Blot: not a type checker that can remember everything,
          but one with much better places to forget.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
