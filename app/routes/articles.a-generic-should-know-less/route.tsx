import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "A generic should know less",
  description:
    "Facet treats types as bundles of observable surfaces, then compiles a generic against the exact layout, operations, families, and facts it actually uses.",
  published: "2026-08-15T07:08:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/a-generic-should-know-less-journal.webp",
    alt: "A brass aperture reveals three faces of a many-sided stone beside one reusable tool.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ordinaryGeneric = `
  fn minimum<T: Ord + Copy>(a: T, b: T) -> T {
    if a < b { a } else { b }
  }

  minimum<Meters>(x, y)
  minimum<Celsius>(a, b)
  minimum<Score>(p, q)
`;

const distinctTypes = `
  type Meters  = distinct F32
  type Celsius = distinct F32
  type Score   = distinct F32

  impl Order(Meters)  = FloatOrder
  impl Order(Celsius) = FloatOrder
  impl Order(Score)   = FloatOrder

  impl Copy(Meters)  = bitcopy
  impl Copy(Celsius) = bitcopy
  impl Copy(Score)   = bitcopy
`;

const genericFootprint = `
  generic minimum<T>

  source requirements:
    Order(T)
    Copy(T)

  observed by body:
    abi(T)                  = f32
    Order(T).less           = float_less_f32
    Copy(T).return          = bits

  not observed:
    nominal_identity(T)
    Hash(T)
    Display(T)
    fields(T)
`;

const sharedCode = `
  code instance minimum#f32-total-order

  params:
    a: f32
    b: f32

  body:
    if float_less_f32(a, b) { a } else { b }

  used by:
    minimum<Meters>
    minimum<Celsius>
    minimum<Score>
`;

const capability = `
  facet Iterator(I) {
    Item: Type
    next: fn(&mut I) -> Option<Item>
  }

  fn drain[I](it: &mut I) -> Vec(Iterator(I).Item)
  where Iterator(I)
  {
    let out = Vec(Iterator(I).Item).new()

    while let Some(value) = Iterator(I).next(it) {
      out.push(value)
    }

    return out
  }
`;

const drainSummary = `
  generic drain<I>

  observes:
    Iterator(I).Item
    Iterator(I).next
    Vec(Iterator(I).Item).new
    Vec(Iterator(I).Item).push

  ignores:
    every other facet of I
`;

const typeFamilies = `
  let Option = typefn(T: Type) =>
    enum {
      None
      Some(T)
    }

  let Result = typefn(E: Type) =>
    typefn(T: Type) =>
      enum {
        Err(E)
        Ok(T)
      }

  let Array = typefn(T: Type, n: Nat) =>
    packed[n] T
`;

const mapFamily = `
  facet Mappable(F) {
    map: fn[A: Type, B: Type](
      F(A),
      fn(A) -> B,
    ) -> F(B)
  }

  fn twice[F, A, B, C](
    xs: F(A),
    ab: fn(A) -> B,
    bc: fn(B) -> C,
  ) -> F(C)
  where Mappable(F)
  {
    let bs = Mappable(F).map(xs, ab)
    return Mappable(F).map(bs, bc)
  }
`;

const noKinds = `
  // There is no separate syntax for "F has kind Type -> Type".

  F: compile_time_function

  F(A) : Type
  F(B) : Type

  Mappable(F).map:
    fn(F(A), fn(A) -> B) -> F(B)
`;

const constGeneric = `
  let Matrix = typefn(
    T: Type,
    rows: Nat,
    cols: Nat,
  ) => packed[rows * cols] T

  fn diagonal[T, n](m: Matrix(T, n, n)) -> Array(T, n) {
    let out = Array(T, n).uninit()

    for i in 0..n {
      out[i] = m[i * n + i]
    }

    return out
  }
`;

const memoryFamily = `
  let Batch = typefn(T: Type, n: Nat) => {
    if Layout(T).size * n <= 128
       && Move(T).kind == trivial
    {
      return InlineArray(T, n)
    }

    return HeapArray(T, n)
  }

  type TinyIds = Batch(UserId, 8)
  type BigRows = Batch(LargeRow, 64)
`;

const memoryDecision = `
  Batch(UserId, 8)

    observes:
      Layout(UserId).size = 8
      Move(UserId).kind   = trivial
      n                   = 8

    result:
      InlineArray(UserId, 8)

  Batch(LargeRow, 64)

    observes:
      Layout(LargeRow).size = 96
      n                     = 64

    result:
      HeapArray(LargeRow, 64)
`;

const abstractQueue = `
  package Queue(T) = hide Rep {
    export type Queue

    export facet QueueOps(Queue) {
      Item = T
      empty: fn() -> Queue
      push: fn(&mut Queue, T)
      pop: fn(&mut Queue) -> Option(T)
      len: fn(&Queue) -> Nat
    }

    private Rep = RingBuffer(T)
  }
`;

const abstractionUse = `
  fn drainQueue[Q](q: &mut Q) -> Vec(QueueOps(Q).Item)
  where QueueOps(Q)
  {
    let out = Vec(QueueOps(Q).Item).new()

    while let Some(x) = QueueOps(Q).pop(q) {
      out.push(x)
    }

    return out
  }
`;

const hiddenEdit = `
  package Queue(T) = hide Rep {
    ...

  - private Rep = RingBuffer(T)
  + private Rep = ChunkedDeque(T, chunk = 64)
  }

  reusable downstream:
    drainQueue
    queueLength
    parseJobs

  recompile:
    Queue implementation
`;

const specializationModes = `
  generic lowering choices

  erase
    no runtime observation of T

  share by shape
    same ABI + same referenced operations

  pass a facet table
    body is shared, operations vary at runtime

  specialize
    constants or layout change control flow or representation
`;

const genericCacheKey = `
  generic-cache-key minimum<T> = hash(
    body,
    target,
    abi(T),
    Order(T).less,
    Copy(T).return,
  )

  // Deliberately absent:
  // T's name, unrelated implementations, private fields.
`;

const incrementalEdit = `
  type Meters = distinct F32

  impl Order(Meters) = FloatOrder
  impl Copy(Meters) = bitcopy

  + impl Display(Meters) = printMeters

  cache minimum<Meters>: reusable
  reason: Display(Meters) is outside minimum's footprint
`;

const hashEdit = `
  type UserId = distinct U64

  - impl Hash(UserId) = SipHash13
  + impl Hash(UserId) = AHash

  invalidated:
    hashMapGet<UserId, _>
    hashMapInsert<UserId, _>

  reusable:
    minimum<UserId>
    sort<UserId>       // if sort only observes Order
    encode<UserId>     // if encode only observes Encode
`;

const compilerSummary = `
  GenericSummary {
    body: hash("minimum body"),
    parameters: [T],
    requirements: [Order(T), Copy(T)],

    observations: [
      Abi(T),
      Member(Order(T), "less"),
      Member(Copy(T), "return"),
    ],

    local_solver_state: discarded,
  }
`;

const publicSurface = `
  export type UserId = distinct U64

  export facets {
    Eq(UserId)
    Hash(UserId)
    Encode(UserId)
  }

  private facets {
    Layout(UserId)
    Fields(UserId)
  }
`;

const layoutGeneric = `
  fn pack[T](xs: Slice(T)) -> Bytes
  where Encode(T)
  {
    // No Layout(T) access: representation may stay hidden.
    return encodeElements(xs)
  }

  fn memcpyPack[T](xs: Slice(T)) -> Bytes
  where Encode(T), reveal Layout(T)
  {
    // This optimization is legal only because the caller exposed layout.
    if Move(T).kind == trivial {
      return copyRaw(xs)
    }

    return encodeElements(xs)
  }
`;

const codegenFootprint = [
  ["No type-specific observation", "Erase the parameter", "One body"],
  ["ABI / layout only", "Share by representation shape", "One body per observed shape"],
  ["Operations only", "Facet table or bind static operation cells", "Usually one body plus small tables"],
  ["Compile-time constants", "Specialize when they affect control flow", "One body per observed constant set"],
  ["Nominal identity used semantically", "Keep identity in checking; erase unless runtime reflection asks for it", "Often still shared"],
] as const;

const compilerFlow = [
  {
    label: "Check",
    title: "Type-check the generic once",
    detail: "Requirements constrain the body while local inference and proof state stay generic.",
  },
  {
    label: "Observe",
    title: "Record the facets the body reads",
    detail: "Layout queries, operations, associated types, constants, and facts form a compact footprint.",
  },
  {
    label: "Bind",
    title: "Choose a lowering for this footprint",
    detail: "Erase, share by shape, pass a facet table, or specialize where the observation changes code.",
  },
  {
    label: "Cache",
    title: "Key code by observations",
    detail: "Unrelated type changes stop invalidating generic code that never saw them.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="13 min read">
      <Prose>
        <p>
          <a href="/articles/the-object-boundary-is-optional">Slab</a>{" "}
          split an object into the bands a loop actually touches. The particle could keep one logical identity while
          position and velocity lived in a hot band, names lived somewhere cold, and the compiler tracked those
          dependencies separately. After writing it, the generic type parameter started looking suspiciously like the
          object I had just dismantled.
        </p>
        <p>
          A generic usually receives one enormous fact called <code>T</code>. The body may only compare two values, or
          ask their size, or call one iterator method, but the compiler carries the whole type identity through checking,
          specialization, caching, diagnostics, and often code generation. We have spent decades adding mechanisms to
          cope with the consequences: traits, typeclasses, associated types, const generics, higher-kinded encodings,
          specialization rules, erased generics, monomorphization, dictionaries. They solve real problems. I am curious
          how much machinery remains if the generic stops knowing things it never asked for.
        </p>
        <p>
          Call this language <strong>Facet</strong>. A type is still a type; meters do not become interchangeable with
          degrees because their bits match. The new rule lives underneath that semantic identity: compile a generic
          against the exact facets it observes, and keep everything else out of its dependency graph.
        </p>

        <H2>Three names can still share one generic body</H2>
        <p>
          Start with an ordinary minimum function. Its signature says a lot about <code>T</code>, though the machine
          code needs remarkably little.
        </p>
        <CodeBlock lang="text" title="minimum.facet" code={ordinaryGeneric} />
        <p>
          Suppose the three types are deliberately distinct. Mixing meters and Celsius remains a type error. Their
          ordering and copying happen to use the same implementation.
        </p>
        <CodeBlock lang="text" title="three distinct scalar types" code={distinctTypes} />
        <p>
          Facet checks <code>minimum</code> once against its requirements, then records what the body actually observed.
          That summary is smaller than the source constraint.
        </p>
        <CodeBlock lang="text" title="generic observation footprint" code={genericFootprint} />
        <p>
          The nominal identity never enters the function body. It matters at the call site, where the checker refuses
          to mix the three domains, then it can disappear from this code-generation problem. All three calls may use the
          same compiled body.
        </p>
        <CodeBlock lang="text" title="one possible shared instance" code={sharedCode} />
        <p>
          This is an optimization boundary, not a new assignability rule. If tomorrow <code>Meters</code> gets a
          different ordering implementation, only its observation fingerprint changes. Celsius does not quietly become
          meters because the linker found identical instructions.
        </p>

        <H2>An associated type is another observation</H2>
        <p>
          Traits and typeclasses already move generic code in this direction: ask for operations instead of peeking at a
          concrete implementation. Facet keeps the idea and removes some of the surrounding special cases. A facet may
          contain operations and compile-time values, including types.
        </p>
        <CodeBlock lang="text" title="iterator facet" highlight="1-4,6-17" code={capability} />
        <p>
          <code>Item</code> does the job usually assigned to an associated type. The generic does not learn the rest of{" "}
          <code>I</code>'s biography. Its compiler summary can say exactly which pieces crossed the abstraction boundary.
        </p>
        <CodeBlock lang="text" title="drain's observed surface" code={drainSummary} />
        <p>
          That smaller surface is also an incremental-build boundary. Add a debug formatter to the iterator type and{" "}
          <code>drain</code> has no reason to recheck or regenerate. Change <code>Item</code> or <code>next</code> and it
          does.
        </p>

        <H2>Type constructors can be ordinary compile-time functions</H2>
        <p>
          The earlier{" "}
          <a href="/articles/typeclasses-with-the-grain">Typeclasses with the grain</a>{" "}
          article had to build higher-kinded joints out of TypeScript phantom slots because the host language has no
          direct way to pass <code>Maybe</code> around before choosing its item type. I do not want Facet to grow a
          second miniature language of kinds to fix that.
        </p>
        <p>
          The compile-time world already has values and functions. Let a function return a type and a type constructor
          becomes ordinary staged computation.
        </p>
        <CodeBlock lang="text" title="type families are compile-time functions" code={typeFamilies} />
        <p>
          <code>Option</code> takes one type. <code>Result(String)</code> returns another compile-time function waiting
          for the success type. <code>Array</code> takes a type and a number. The parameter categories differ because
          their values differ, not because the language needs unrelated generic syntaxes for each case.
        </p>
        <p>
          Higher-kinded abstraction then becomes a facet over a compile-time function. <code>F</code> is passed before
          its element type is known, but the checker does not need to invent a permanent kind term for it.
        </p>
        <CodeBlock lang="text" title="mapping over a type family" highlight="1-7,9-20" code={mapFamily} />
        <CodeBlock lang="text" title="what the checker needs to know about F" code={noKinds} />
        <p>
          There are hard questions here—termination of compile-time functions, equality of closures, error reporting
          when a family returns something other than a type. I would rather solve those as staging problems than make
          every programmer learn another algebra solely so a generic may accept <code>F&lt;_&gt;</code>.
        </p>

        <H2>Const generics stop being a separate feature too</H2>
        <p>
          A matrix family accepts a type and two natural numbers. Nothing especially profound happens when a number
          participates in type construction; it is one more compile-time argument.
        </p>
        <CodeBlock lang="text" title="matrix.facet" highlight="1-5,7-15" code={constGeneric} />
        <p>
          The compiler still has to decide which values are available at compile time and how aggressively to
          specialize. The language surface no longer needs a different conceptual box for “generic over a type” and
          “generic over a constant.” Both are functions whose results happen to describe runtime data.
        </p>

        <H2>A type family can make a memory decision</H2>
        <p>
          This is where the abstraction machinery meets the memory work from Slab. Generic representation choices often
          depend on a few facts about an element: size, alignment, whether moving it is trivial, perhaps one constant
          capacity. Facet lets a family observe those properties directly and nothing else.
        </p>
        <CodeBlock lang="text" title="batch.facet" highlight="1-10" code={memoryFamily} />
        <CodeBlock lang="text" title="two family evaluations" code={memoryDecision} />
        <p>
          The first result can live inline because the observed layout is small enough. The second becomes indirect.
          Neither decision needs access to methods, display names, domain tags, or unrelated trait implementations.
          That matters for caching: changing <code>Display(UserId)</code> cannot possibly alter <code>Batch(UserId, 8)</code>.
        </p>
        <p>
          Representation introspection has to be an explicit facet. If a module wants to hide layout, callers do not get
          to run this family over its private representation. Abstraction should be able to say “you may call these
          operations, but you may not build a cache key out of my field offsets.”
        </p>

        <H2>A hidden representation should actually stay hidden</H2>
        <p>
          Consider a queue package. Its public type and operations survive while the concrete storage stays behind the
          package boundary.
        </p>
        <CodeBlock lang="text" title="queue.facet" code={abstractQueue} />
        <p>
          Code using <code>QueueOps</code> can be checked and compiled without importing <code>Rep</code>. A generic
          draining loop depends on the exported operations and item type.
        </p>
        <CodeBlock lang="text" title="generic code over an abstract queue" code={abstractionUse} />
        <p>
          Now the implementation swaps a ring buffer for chunked storage. That edit should not shake every generic that
          has ever accepted a queue.
        </p>
        <CodeBlock lang="diff" title="private representation edit" code={hiddenEdit} />
        <p>
          This sounds obvious when written as prose. Compilers routinely lose the benefit by making downstream caches
          depend on a larger interface fingerprint than the caller actually used. Facet turns “what did you observe?”
          into a first-class summary instead of hoping later dependency analysis rediscovers it.
        </p>

        <H2>Monomorphization and erasure are lowering choices</H2>
        <p>
          I do not want programmers choosing a language-wide camp between C++-style duplication and one universal
          erased representation. A generic body already tells the compiler which facts could change its machine code.
          Use that footprint to choose a lowering.
        </p>
        <CodeBlock lang="text" title="four generic lowering modes" code={specializationModes} />
        <DataTable
          head={["Observed by the generic", "Natural lowering", "Code multiplicity"]}
          rows={codegenFootprint}
          caption="The generic parameter stays semantically precise even when the backend can share its implementation."
        />
        <p>
          A function that never observes <code>T</code> can erase it. A function whose only type dependence is a scalar
          ABI can share code by shape. Operations may travel through a compact facet table when sharing wins, while a
          constant controlling a loop bound may justify specialization. These are performance choices over one checked
          program, not different generic semantics.
        </p>
        <p>
          There will be heuristics. A tiny comparator may be worth inlining into several specialized bodies; a large
          parser may be better shared with two operation cells. The useful part is that the heuristic receives a small
          explicit input: the observation footprint, not an opaque full type graph.
        </p>

        <H2>The cache key can finally match the code</H2>
        <p>
          For <code>minimum</code>, a code-generation cache does not need the entire type argument. It needs the pieces
          that reached the generated instructions.
        </p>
        <CodeBlock lang="text" title="generic code-generation key" code={genericCacheKey} />
        <p>
          Add a formatter to meters and the cached minimum remains usable.
        </p>
        <CodeBlock lang="diff" title="an unrelated facet arrives" code={incrementalEdit} />
        <p>
          Change hashing for a user ID and hash-based functions move while ordering and encoding code stay put.
        </p>
        <CodeBlock lang="diff" title="one facet changes" code={hashEdit} />
        <p>
          This is the type-level version of Slab's storage bands. The runtime stopped dragging cold fields through a hot
          loop. The compiler stops dragging cold type information through a generic dependency graph.
        </p>

        <H2>Check the generic once, then forget the working state</H2>
        <p>
          <a href="/articles/make-the-type-checker-forget">Make the type checker forget</a>{" "}
          argued for solver islands: infer a function with a rich local graph, export a closed summary, throw the
          temporary machinery away. Generics fit that model unusually well. Type-check the body against abstract facets
          once, then preserve a compact list of observations for later instantiations.
        </p>
        <CodeBlock lang="text" title="closed generic summary" code={compilerSummary} />
        <FlowSequence
          steps={compilerFlow}
          caption="A generic is checked against abstract requirements once; later instantiations bind only the observations that survived into its summary."
        />
        <p>
          Instantiating <code>minimum&lt;Meters&gt;</code> should not reopen the original inference graph. The compiler
          binds three observations, finds or creates the matching code instance, and moves on. A thousand nominal types
          can therefore produce far fewer than a thousand type-checking or code-generation problems when their observed
          surfaces coincide.
        </p>

        <H2>Abstraction controls which observations exist</H2>
        <p>
          The dangerous version of this language would let any generic inspect anything about any type. That is macro
          reflection wearing a nicer coat, and it destroys the very abstraction and caching story the design is trying
          to buy. A module must choose which facets are public.
        </p>
        <CodeBlock lang="text" title="public and private type facets" code={publicSurface} />
        <p>
          Consumers may compare, hash, and encode a <code>UserId</code>. They cannot branch on its byte size or enumerate
          its fields because those observations are absent. The module can later replace <code>U64</code> with a pair of
          words without invalidating code whose contracts never exposed layout.
        </p>
        <p>
          Sometimes representation knowledge is worth the tighter code. Make that request visible in the generic
          contract instead of letting optimizer magic pierce the boundary behind the programmer's back.
        </p>
        <CodeBlock lang="text" title="representation is an explicit observation" code={layoutGeneric} />
        <p>
          The first function stays representation-agnostic. The second asks the caller to reveal layout because its raw
          copy path depends on that fact. You can now see the optimization budget in the signature: more observation can
          buy tighter code, and it also creates a larger dependency surface.
        </p>

        <H2>The hard part is coherence, not syntax</H2>
        <p>
          Facets create several ways to get into trouble. Two modules may offer competing implementations for the same
          operation. A compile-time family may accidentally depend on a facet its public summary forgot to record.
          Dynamic loading complicates decisions that looked static during compilation. Aggressive code sharing can
          interact badly with debugging if ten semantic types all point at one machine function.
        </p>
        <p>
          I would keep implementation selection lexical and explicit: a generic receives one facet implementation from
          its environment, and that choice becomes an observation when the body uses it. Compile-time functions must be
          pure and their reads tracked by the same dependency system. Debug info can preserve semantic instantiation
          names even when the machine body is shared. None of those rules are glamorous, but this whole language only
          works if “observed” has one boring, auditable meaning from the type checker down to the cache.
        </p>
        <p>
          The piece I am least sure about is automatic switching between facet tables and specialization. The semantics
          are identical, but code size, branch prediction, inlining, and incremental-build behavior can pull in
          different directions. I would expose diagnostics showing the chosen lowering and let performance-sensitive
          code pin a choice when measurement earns it. Hiding that decision completely would make the language pleasant
          right up until the first binary-size regression.
        </p>
        <p>
          The original <code>minimum</code> still looks almost insultingly small at the end of all this. Three semantic
          types enter it with different names. The checker keeps those names long enough to prevent nonsense, then the
          compiler notices that the function only asked three modest questions and reuses one body. That seems like a
          better default for abstraction: preserve every distinction the program means, and carry only the distinctions
          the next piece of code can actually see.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
