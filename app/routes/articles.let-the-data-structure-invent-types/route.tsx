import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Let the data structure invent its own types",
  description:
    "If each arena can generate its own local handle type, IDs from two otherwise identical arenas stop being interchangeable before any runtime bounds check.",
  published: "2026-08-12T09:46:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/let-the-data-structure-invent-types-journal.webp",
    alt: "Two wooden specimen cabinets hold different carved shapes fitted to individual compartments.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ordinaryArena = `
  type Id = Nat

  type Arena<T> = {
    items: Vec<T>
  }

  fn insert<T>(arena: &mut Arena<T>, value: T) -> Id {
    let id = arena.items.len
    arena.items.push(value)
    return id
  }

  fn get<T>(arena: &Arena<T>, id: Id) -> &T {
    return &arena.items[id]
  }

  let left = Arena<String>::new()
  let right = Arena<String>::new()

  let zero = left.insert("zero")
  right.get(zero) // type-checks
`;

const scopedArena = `
  type Arena<T> = scope {
    type Id = private Nat

    items: Vec<T>

    relation Live(id: Id) =
      id.raw < items.len

    fn insert(self: &mut Self, value: T)
      -> id: self.Id
      ensures self.Live(id)

    fn get(self: &Self, id: self.Id) -> &T
      requires self.Live(id)
  }
`;

const twoArenas = `
  let left = Arena<String>::new()
  let right = Arena<String>::new()

  let zero = left.insert("zero")

  left.get(zero)   // okay: zero is left.Id
  right.get(zero)  // error: expected right.Id
`;

const arenaError = `
  error: handle belongs to a different scope

    expected: right.Id
       found: left.Id

    zero was created by left.insert(...)
`;

const bufferScope = `
  type Buffer = scope {
    type Offset = private Nat

    bytes: Bytes

    relation InBounds(at: Offset) =
      at.raw < bytes.len

    relation Ordered(a: Offset, b: Offset) =
      a.raw <= b.raw

    fn offset(self: &Self, n: Nat)
      -> Option<at: self.Offset>
      ensures Some(at) => self.InBounds(at)

    fn byte(self: &Self, at: self.Offset) -> Byte
      requires self.InBounds(at)
  }
`;

const invalidatedOffset = `
  let at = buffer.offset(20)?

  let before = buffer.byte(at) // okay

  buffer.truncate(8)

  let after = buffer.byte(at)
  // error: buffer.InBounds(at) is no longer known
`;

const dependentFunction = `
  fn checksum(
    buffer: &Buffer,
    start: buffer.Offset,
    end: buffer.Offset,
  ) -> U32
    requires {
      buffer.InBounds(start)
      buffer.InBounds(end)
      buffer.Ordered(start, end)
    }
`;

const moveAndClone = `
  let arena = Arena<String>::new()
  let zero = arena.insert("zero")

  let moved = move arena
  moved.get(zero) // okay: moving preserves the scope identity

  let copy = moved.clone()
  copy.get(zero)  // error: copy generated a fresh Id type
`;

const scopeFlow = [
  {
    label: "Construct",
    title: "Generate a fresh scope",
    detail: "The arena gets a hidden identity that no other arena has.",
  },
  {
    label: "Mint",
    title: "Create local values",
    detail: "Handles have types such as arena.Id and relations such as arena.Live(id).",
  },
  {
    label: "Move",
    title: "Carry the identity with the value",
    detail: "Renaming, borrowing, and moving the arena do not mint a second type family.",
  },
  {
    label: "Clone",
    title: "Create a new scope",
    detail: "A real copy gets a fresh identity, so old handles do not silently become handles into the copy.",
  },
] as const;

const seededArena = `
  type SeededArena<T> = scope {
    arena: Arena<T>
    first: arena.Id

    relation FirstIsLive =
      arena.Live(first)
  }
`;

const loweredScope = `
  // source model
  new Arena<T>

  // checker model
  exists scope rho. Arena<T, rho>

  arena.Id
  // becomes
  Id<rho>

  arena.Live(id)
  // becomes
  Live<rho>(arena, id)
`;

const loweredMethods = `
  fn insert<T, rho>(
    arena: &mut Arena<T, rho>,
    value: T,
  ) -> id: Id<rho>

  fn get<T, rho>(
    arena: &Arena<T, rho>,
    id: Id<rho>,
  ) -> &T
`;

const comparisonAttributes = ["Fresh identity comes from", "Type is named through", "Usual level", "Missing piece for Tether"] as const;

const comparisonEntities = [
  {
    name: "Scala path type",
    values: [
      "An object path",
      "graph1.Node versus graph2.Node",
      "Objects with nested classes or abstract members",
      "Scoped relationship facts and mutation invalidation",
    ],
  },
  {
    name: "OCaml generative functor",
    values: [
      "A generative functor application",
      "A generated module's type components",
      "The module system",
      "Ordinary data values acting as the generative boundary",
    ],
  },
  {
    name: "GhostCell brand",
    values: [
      "A fresh hidden brand",
      "A phantom brand parameter",
      "A library API using rank-2 polymorphism",
      "Direct surface syntax plus local named relationships",
    ],
  },
  {
    name: "Tether scope",
    values: [
      "Constructing an ordinary scoped value",
      "arena.Id and arena.Live(id)",
      "Records, arenas, buffers, graphs",
      "The proposed combination",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="9 min read">
      <Prose>
        <p>
          The last two articles kept moving type information closer to the data that gives it meaning. First came{" "}
          <a href="/articles/the-type-between-the-fields">relationship types</a>: instead of making a byte string
          globally become <code>Bytes&lt;n&gt;</code>, let a packet say that its length field and body happen to agree.
          Then{" "}
          <a href="/articles/a-language-made-of-links">Tether</a> turned those relationships into named links that
          mutation could invalidate and repair locally.
        </p>
        <p>
          There is still one global thing left in that design that bothers me: the types themselves. A program tends
          to declare <code>NodeId</code>, <code>Offset</code>, or <code>Handle</code> once, somewhere above the values
          that actually own those names. Then every instance of the data structure speaks the same type language.
        </p>
        <p>
          I want to try the opposite. Treat a data structure as a scope. Let an individual arena, graph, buffer, or
          table invent types that only make sense inside that particular value, and let its relationships use those
          local types directly.
        </p>

        <H2>The arena should own the word Id</H2>
        <p>
          An arena is the smallest example I know where the missing distinction is obvious. The ordinary version
          returns an integer-shaped handle. We can wrap that integer in a nominal <code>Id</code>, but two arenas of
          the same type still produce the same <code>Id</code> type.
        </p>
        <CodeBlock lang="text" title="ordinary-arena.tether" highlight="1,15-18,20" code={ordinaryArena} />
        <p>
          The last line is not necessarily an out-of-bounds access. That almost makes the bug worse. Slot zero may
          exist in both arenas, so the program quietly reads a completely different object. The handle has enough type
          information to say "I am an arena ID" and not enough to say which arena made it.
        </p>
        <p>
          A phantom type parameter can encode the missing owner if we already have a name for it. The awkward part is
          that the identity we want does not exist until the arena value exists. I do not want callers inventing a
          global <code>UserArenaTag</code> just so one runtime object can distinguish its handles from another runtime
          object.
        </p>
        <p>
          So in this version of Tether, <code>scope</code> means the structure may declare types of its own. Every
          construction of <code>Arena</code> creates a fresh family of those types.
        </p>
        <CodeBlock lang="text" title="arena.tether" highlight="1-2,6-7,10-15" code={scopedArena} />
        <p>
          <code>Id</code> is backed by a natural number, but that representation is private to the scope. Outside the
          arena, the useful name is not merely <code>Id</code>. It is <code>left.Id</code>, <code>right.Id</code>, or
          whichever stable value produced it.
        </p>
        <CodeBlock lang="text" title="two-arenas.tether" highlight="1-4,6-7" code={twoArenas} />
        <CodeBlock lang="text" title="compiler output" code={arenaError} />
        <p>
          This is the first rule: two values constructed from the same data-structure declaration do not automatically
          share its inner nominal types. The declaration gives them the same <em>shape</em> of local type system, not
          the same type identities.
        </p>

        <H2>A local type is not a local proof</H2>
        <p>
          The distinction gets more useful with a buffer. An offset should belong to one buffer forever, but being in
          bounds is a fact that can stop being true when the buffer changes. Those are different jobs, so I would give
          them different language constructs.
        </p>
        <CodeBlock lang="text" title="buffer.tether" highlight="1-2,6-11,13-18" code={bufferScope} />
        <p>
          <code>buffer.Offset</code> says where the offset came from. It prevents using an offset minted by one buffer
          with another buffer. <code>buffer.InBounds(at)</code> says something more temporary: given the buffer&apos;s
          current byte length, this particular offset is safe to dereference.
        </p>
        <p>
          That separation matters the first time the buffer shrinks. The offset does not magically become an offset
          into some other object. Its local type is still valid. The relationship that justified a read is what
          disappears.
        </p>
        <CodeBlock lang="text" title="truncate.tether" highlight="1,3,5-8" code={invalidatedOffset} />
        <p>
          This plugs directly into Tether&apos;s existing write-footprint model. A call that may write{" "}
          <code>buffer.bytes</code> invalidates caller facts whose predicates mention that field. The checker does not
          need a registry of every offset ever minted. It only needs to forget the <code>InBounds</code> facts currently
          present in the local proof graph.
        </p>
        <Callout variant="note" title="Origin and validity are separate axes">
          <p>
            A local type is good for stable provenance: this handle belongs to this graph, this offset belongs to this
            buffer, this row key belongs to this table. A relationship is good for state-dependent facts: this handle
            is still live, this offset is in bounds, this row is visible in this transaction. Making one construct do
            both jobs would make mutation much harder to reason about.
          </p>
        </Callout>

        <H2>The scope should appear in function types</H2>
        <p>
          Once a value can create types, ordinary function signatures need one small dependent feature. A later
          parameter has to be able to mention the scope introduced by an earlier parameter.
        </p>
        <CodeBlock lang="text" title="checksum.tether" highlight="2-4,6-10" code={dependentFunction} />
        <p>
          This is intentionally narrower than "all values may appear in all types." The path <code>buffer</code> is a
          stable name for one scope during the call, and the other parameters can select types and relationships from
          it. That is enough to write most APIs I care about without turning Tether into a fully dependently typed
          language.
        </p>
        <p>
          Scala already demonstrates how useful this shape can be. Its documentation on{" "}
          <a href="https://docs.scala-lang.org/tour/inner-classes.html">inner classes</a> uses a graph whose nested{" "}
          <code>Node</code> type is path-dependent: a node from one graph instance is not simply a node from every graph
          instance. Scala 3 also has{" "}
          <a href="https://docs.scala-lang.org/scala3/book/types-dependent-function.html">dependent function types</a>{" "}
          where a result type can depend on a parameter value. Tether is borrowing that instinct rather than claiming
          that instance-dependent types are new.
        </p>

        <H2>Moving a scope is not creating one</H2>
        <p>
          Path syntax creates an immediate practical question. If the type is called <code>arena.Id</code>, what
          happens when <code>arena</code> is moved into another variable? I would not make the source variable name the
          real identity. It is only how the programmer refers to an identity the compiler already tracks.
        </p>
        <CodeBlock lang="text" title="identity.tether" highlight="1-5,7-8" code={moveAndClone} />
        <FlowSequence
          steps={scopeFlow}
          caption="Scope identity follows the value through moves, but a true clone starts another local type family."
        />
        <p>
          Internally, imagine that construction creates an unforgeable name <code>rho</code>. Moving the arena carries{" "}
          <code>rho</code> with it. A shared reference points at the same <code>rho</code>. A clone creates a fresh name,
          say <code>sigma</code>, because the copied arena can diverge immediately afterward.
        </p>
        <p>
          The clone rule is especially important for graphs and slot maps. If a copied graph silently accepted every
          handle from the original graph, the type system would be saying the two structures are one scope even while
          their contents evolve independently. A graph-specific <code>fork</code> operation can return a remapping from
          old handles to new handles when that conversion is genuinely useful.
        </p>
        <p>
          Persistent immutable structures are the interesting countercase. Two versions may intentionally share one
          logical identity even though they are different values. I would leave that as an explicit library-level
          choice rather than pretending "one runtime object" is always the correct definition of a scope. The compiler
          needs a notion of generated identity; libraries still get to decide when identities are preserved.
        </p>

        <H2>Scopes nest naturally</H2>
        <p>
          Once ordinary data structures are scopes, packaging dependent values stops needing a separate exotic box.
          An outer structure can contain an inner scope, then let later fields and relationships refer to types that
          inner value generated.
        </p>
        <CodeBlock lang="text" title="seeded-arena.tether" highlight="1-6" code={seededArena} />
        <p>
          <code>first</code> cannot accidentally refer to some arena outside the record because its type literally
          selects <code>arena.Id</code> from the sibling field in the same structure. The relationship then records
          that the handle is live in that arena&apos;s current state.
        </p>
        <p>
          This also gives the language a boring answer to the old "how do I return the thing and a value whose type
          depends on the thing?" problem. Return a scoped record containing both. The outer structure is the stable
          name that keeps the dependency together.
        </p>
        <p>
          Collections are harder but not mysterious. A <code>Vec&lt;Arena&lt;T&gt;&gt;</code> contains elements with
          different hidden scope identities. Pull one element out and the checker opens its identity as a fresh local
          abstract name for as long as that element is in scope. In type-theory terms there is an existential package
          hiding in the implementation. I would rather the compiler handle that packaging than make everyday arena
          users write existential syntax themselves.
        </p>

        <H2>The compiler model can stay small</H2>
        <p>
          The surface feature sounds stranger than the lowering. A scoped structure can be translated into the sort
          of phantom brand people already encode by hand. Construction introduces a fresh type-level identity, and
          all local types receive that identity as a hidden parameter.
        </p>
        <CodeBlock lang="text" title="lowering sketch" highlight="2,5-6,8-10,12-14" code={loweredScope} />
        <CodeBlock lang="text" title="lowered methods" highlight="1-4,6-9" code={loweredMethods} />
        <p>
          At runtime, <code>rho</code> can usually disappear. The arena handle is still the same integer it would have
          been before. The new information exists for type checking, relation tracking, and diagnostics.
        </p>
        <p>
          There is precedent for that branded implementation technique too. The{" "}
          <a href="https://plv.mpi-sws.org/rustbelt/ghostcell/">GhostCell paper</a> uses branded types to tie cells to a
          matching permission token, building the brand from phantom types and rank-2 polymorphism. It is a clever
          library encoding of a fresh identity that the Rust type system can track without runtime tagging.
        </p>
        <p>
          OCaml attacks freshness from another angle in its module system. A{" "}
          <a href="https://ocaml.org/manual/5.5/generativefunctors.html">generative functor</a> produces type
          components that are different across separate applications. That is very close to the semantic move here;
          the proposed difference is mostly where I want programmers to encounter it. Applying a module constructor is
          a natural generative boundary in OCaml. I want constructing an ordinary data structure to be one too.
        </p>
        <Compare
          attributes={comparisonAttributes}
          entities={comparisonEntities}
          caption="The fresh-name machinery has close relatives. Tether's experiment is putting it directly on ordinary structures and composing it with named relationships."
        />

        <H2>The type case is the structure</H2>
        <p>
          I like this feature because it changes what a data declaration means without asking every type in the
          language to become more complicated. A normal record says, "these values travel together." A Tether scope
          says one extra thing: "inside this value, these are the names by which some values are allowed to relate."
        </p>
        <p>
          An arena can own <code>Id</code>. A graph can own <code>Node</code> and <code>Edge</code>. A buffer can own{" "}
          <code>Offset</code>. A database transaction can own a <code>Row</code> view that cannot be confused with a row
          borrowed from another transaction. Those types do not need globally unique names because their owner already
          gives them one.
        </p>
        <p>
          The relationships from the previous article then sit inside the same scope instead of floating beside it.
          The local type answers "which world does this value belong to?" The local relation answers "what is true in
          that world right now?" Mutation can preserve the first while invalidating the second.
        </p>
        <p>
          The hero image for this article is a printer&apos;s type case, which is almost too literal. The case is the
          structure. The compartments tell you where each piece belongs. The pieces are only useful because the case
          gives them an arrangement. I think some program data wants the same privilege: not merely to contain values,
          but to define the little type vocabulary in which those values make sense.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
