import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "A language made of links",
  description:
    "A follow-up experiment: make relationships between values a first-class part of the language, then let mutation invalidate only the links it actually touches.",
  published: "2026-08-11T16:37:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Master_link_pliers.jpg/1280px-Master_link_pliers.jpg",
    alt: "A pair of bicycle master-link pliers lies beside a short section of chain and a removable connecting link.",
    credit: {
      author: "Armchair",
      license: "CC0 1.0",
      href: "https://commons.wikimedia.org/wiki/File:Master_link_pliers.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const packet = `
  relation SameLength(declared: Nat, bytes: Bytes) =
    declared == bytes.len

  type Packet = {
    length: Nat
    body: Bytes

    link size: SameLength(length, body)
  }
`;

const image = `
  type Image = {
    width: Nat
    height: Nat
    channels: Nat
    pixels: Bytes

    link packed:
      pixels.len == width * height * channels
  }
`;

const readExactly = `
  fn readExactly(cursor: &mut Cursor, n: Nat)
    -> Result<bytes: Bytes, ReadError>
    ensures Ok(bytes) => bytes.len == n

  fn decode(cursor: &mut Cursor) -> Result<Packet, ReadError> {
    let length = try cursor.readU16().toNat()
    let body = try readExactly(cursor, length)

    return Packet { length, body }
  }
`;

const checkedConstructor = `
  fn Packet.fromParts(length: Nat, body: Bytes)
    -> Result<Packet, BadLength>
  {
    if body.len != length {
      return Err(BadLength)
    }

    return Ok(Packet { length, body })
  }
`;

const editPacket = `
  fn truncate(packet: &mut Packet, n: Nat) {
    edit packet {
      packet.body = packet.body.take(n)
      packet.length = packet.body.len
    }
  }
`;

const editFailure = `
  error: cannot finish edit of packet

    open link: size
    required: packet.length == packet.body.len

    packet.body changed here:
      packet.body = packet.body.take(n)

    packet.length was not updated
`;

const splitContract = `
  fn splitAt(bytes: Bytes, n: Nat)
    -> (left: Bytes, right: Bytes)
    ensures {
      left.len + right.len == bytes.len
      left.len == min(n, bytes.len)
    }
`;

const writeFootprint = `
  fn markSeen(packet: &mut Packet)
    writes { packet.lastSeen }
  {
    packet.lastSeen = Clock.now()
  }
`;

const editFlow = [
  {
    label: "Enter",
    title: "Start with a valid value",
    detail: "Every declared link on the packet is closed.",
  },
  {
    label: "Write",
    title: "Change one endpoint",
    detail: "Only links that mention that field become open obligations.",
  },
  {
    label: "Repair",
    title: "Update the related field",
    detail: "New facts from assignments and function contracts feed the checker.",
  },
  {
    label: "Exit",
    title: "Close the links",
    detail: "The value may leave the edit scope only when its obligations hold again.",
  },
] as const;

const comparisonAttributes = ["Invariant lives on", "What callers carry", "Mutation", "Natural use"] as const;

const comparisonEntities = [
  {
    name: "Indexed type",
    values: [
      "The value's type",
      "An index such as n in Vector<n, A>",
      "Often changes the indexed type or updates dependent fields together",
      "Algorithms whose behavior genuinely depends on the index",
    ],
  },
  {
    name: "Refinement",
    values: [
      "A logical predicate narrowing a value or record",
      "A refined type and whatever facts the checker exposes",
      "The predicate has to remain provable after updates",
      "General lightweight verification with solver-friendly logic",
    ],
  },
  {
    name: "Tether link",
    values: [
      "A named edge or hyperedge between ordinary values",
      "Ordinary field types plus local relationship facts",
      "Only links incident to changed endpoints are reopened",
      "Cross-field invariants in parsers, buffers, views, and stateful code",
    ],
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="8 min read">
      <Prose>
        <p>
          The last article ended in a slightly annoying place. I had a syntax sketch for{" "}
          <a href="/articles/the-type-between-the-fields">relationship types</a>: keep fields ordinary, then put the
          invariant on the edge between them. A packet could say that its declared length and its byte count agree
          without turning the byte string into <code>Bytes&lt;n&gt;</code>.
        </p>
        <p>
          That works as an article-sized idea. It is also the easy part. The interesting question is what kind of
          language you get if you stop treating relationships as a decoration on records and make the compiler care
          about them everywhere.
        </p>
        <p>
          Call the language <strong>Tether</strong> for this sketch. I would keep almost everything else boring: a
          compiled, eager, expression-oriented language with algebraic data types, local type inference, explicit
          public signatures, immutable bindings by default, and scoped mutation. The experiment is one thing: values
          are nodes, relationships are typed links, and the checker knows which links a mutation can break.
        </p>

        <H2>A record is a small graph</H2>
        <p>
          The packet from the previous article becomes the first piece of syntax. The fields still have types you
          would expect in an ordinary systems language. The extra declaration is a named proposition whose endpoints
          are fields in the same value.
        </p>
        <CodeBlock lang="text" title="packet.tether" highlight="1-2,8" code={packet} />
        <p>
          I am using <code>link</code> rather than hiding the predicate in one field&apos;s type because the compiler
          needs to remember its shape. <code>size</code> depends on <code>length</code> and <code>body</code>. That
          dependency is useful information when one of those fields changes.
        </p>
        <p>
          Links do not have to be binary. An image has a perfectly ordinary width, height, channel count, and byte
          buffer. The interesting fact only exists because this record puts all four values together.
        </p>
        <CodeBlock lang="text" title="image.tether" highlight="7-8" code={image} />
        <p>
          So the internal model is really a hypergraph. Fields are nodes. Every link stores a predicate plus the set
          of nodes it mentions. That sounds like compiler bookkeeping, because it is. I want the language feature to
          earn its keep in bookkeeping rather than in prettier theorem syntax.
        </p>

        <H2>Construction should usually prove itself</H2>
        <p>
          The first version of relationship types needed an explicit <code>prove</code> while decoding a packet. I
          would remove that from the common path. Functions can publish small postconditions, and constructing a
          linked record asks the checker whether the facts already in scope close every link.
        </p>
        <CodeBlock lang="text" title="decode.tether" highlight="1-3,7-10" code={readExactly} />
        <p>
          <code>readExactly</code> says that a successful result has exactly the requested length. After the call, the
          checker has a relationship between <code>length</code> and <code>body</code>, so the <code>Packet</code>{" "}
          literal does not need another comparison and does not need a hand-written proof term.
        </p>
        <p>
          When the fact really comes from untrusted data, write the check. Flow-sensitive typing can learn from the
          branch in the same way a null check or tagged-union match teaches many existing type checkers something
          about the path that follows.
        </p>
        <CodeBlock lang="text" title="checked-constructor.tether" highlight="5-7,10" code={checkedConstructor} />
        <p>
          After the early return, <code>body.len == length</code> is true on the remaining path. That is enough to
          construct the packet. The check belongs at the boundary; the relationship belongs to the value afterward.
        </p>

        <H2>The mutation rule is the language</H2>
        <p>
          This is the part I would actually build Tether to test. Most type-system sketches become much less cute the
          moment a program wants to update two related fields. If every intermediate assignment must preserve every
          invariant, simple edits become impossible. If invalid values can float around indefinitely, the invariant
          is mostly documentation.
        </p>
        <p>
          My rule would be a scoped hole. An <code>edit</code> block may temporarily break links on the value it owns.
          The compiler tracks which links become invalid as their endpoints are written, and the closing brace is a
          proof boundary.
        </p>
        <CodeBlock lang="text" title="truncate.tether" highlight="2-5" code={editPacket} />
        <FlowSequence
          steps={editFlow}
          caption="Mutation opens only the obligations attached to fields that actually changed."
        />
        <p>
          Change <code>body</code> and the <code>size</code> link becomes open. Change <code>length</code> to the new
          byte count and the checker can close it. If the function forgets the second assignment, the error can be
          about the relationship that broke instead of some huge inferred type that happens to contain the same fact.
        </p>
        <CodeBlock lang="text" title="compiler output" code={editFailure} />
        <p>
          More importantly, changing an unrelated field should do nothing to <code>size</code>. The compiler already
          has the endpoint set for every link. It does not need to re-prove the entire record because a timestamp
          changed.
        </p>

        <H2>Functions need footprints as well as types</H2>
        <p>
          Local invalidation stops being local once you call a function through a mutable reference. If the callee may
          rewrite the whole packet, every relationship could be stale when it returns. Tether therefore needs a small
          notion of write footprint alongside ordinary function types.
        </p>
        <CodeBlock lang="text" title="footprint.tether" highlight="2" code={writeFootprint} />
        <p>
          A call to <code>markSeen</code> preserves <code>size</code> without proving it again because the write set
          does not intersect either endpoint. A helper that receives only <code>&amp;mut packet.body</code> would reopen
          links mentioning <code>body</code> for the duration of that borrow. A function that gets unrestricted mutable
          access has to return with the affected links closed.
        </p>
        <p>
          There is an old idea hiding underneath this. Separation logic&apos;s frame rule is about local reasoning: a
          proof about the piece of state an operation touches can be carried out while unrelated state is framed around
          it. The details are different, but that instinct is exactly what I want here. The compiler should know that
          changing one corner of a value does not make every fact about the rest of it suspicious. Software
          Foundations has a readable treatment of the{" "}
          <a href="https://softwarefoundations.cis.upenn.edu/slf-current/Rules.html">reasoning rules and frame rule</a>.
        </p>

        <H2>Relationships should cross function boundaries</H2>
        <p>
          Once links exist only inside records, programmers will immediately reinvent them in function comments. A
          split operation has relationships between its input and both outputs even though there is no record that owns
          all three values.
        </p>
        <CodeBlock lang="text" title="split.tether" highlight="3-6" code={splitContract} />
        <p>
          Tether should put those postconditions into the caller&apos;s local relationship graph. The returned byte
          strings remain plain <code>Bytes</code>. The caller also learns that their lengths add back to the original
          length and that the left side has the requested capped length. Keep both values around and those facts are
          available to later checks. Drop one endpoint and the relationship can disappear with it.
        </p>
        <p>
          This is where I would resist making every proof first-class by default. Most code wants to use the fact, not
          store a certificate object for it. The compiler can erase solver facts completely. An explicit witness value
          can exist as an escape hatch for generic proof-heavy code, but making every ordinary call traffic in witness
          terms would recreate the surface area I was trying to avoid.
        </p>

        <H2>This is not new logic</H2>
        <p>
          A sufficiently expressive refinement type system can already state these predicates. Jhala and Vazou&apos;s{" "}
          <a href="https://arxiv.org/abs/2010.07763">refinement types tutorial</a> is a good map of the territory:
          ordinary types are narrowed by logical predicates, with automation doing as much of the checking as is
          practical. Idris attacks the problem from a dependent-type direction, and its documentation even shows that
          dependent record fields can be{" "}
          <a href="https://idris2.readthedocs.io/en/stable/tutorial/typesfuns.html#dependent-records">
            updated together when they depend on each other
          </a>.
        </p>
        <p>
          Tether is a language-design opinion on top of that territory. It says the dependency graph itself deserves
          to be visible to the source language and compiler because mutation, diagnostics, and API boundaries all care
          about which values participate in a fact.
        </p>
        <Compare
          attributes={comparisonAttributes}
          entities={comparisonEntities}
          caption="The underlying propositions overlap. The proposed difference is where the dependency is made explicit and how updates use it."
        />
        <p>
          Indexed types remain better when the index is part of the algorithm. Matrix dimensions, protocol states,
          and vectors whose length controls recursion genuinely want that information in the type. I would not make a
          matrix library worse just to avoid writing <code>Matrix&lt;m, n&gt;</code>.
        </p>
        <p>
          Tether is aimed at the less glamorous invariants that pile up in systems code: cached counts, source ranges,
          payload lengths, image buffers, offsets into mapped files, and values imported from foreign APIs. These facts
          are important, but callers often do not want them promoted into permanent type parameters.
        </p>

        <H2>Keep the solver aggressively boring</H2>
        <p>
          A prototype should not begin by trying to prove arbitrary programs. Equality, ordering, integer ranges, and
          linear arithmetic already cover the examples that motivated the language. Library functions can expose
          trusted or separately checked postconditions such as <code>take(xs, n).len &lt;= n</code>. Anything beyond
          the automatic fragment can require an explicit proof function.
        </p>
        <Callout variant="note" title="Named links are also error-message handles">
          <p>
            A failed proof should start with <code>size</code>, <code>inBounds</code>, or whatever the programmer
            called the relationship. The predicate comes next, then the writes that invalidated it. If the compiler
            instead dumps an SMT query or a page of generated types, the source construct has failed one of its main
            jobs.
          </p>
        </Callout>
        <p>
          Internally, I would lower each link to a predicate plus an endpoint set. SSA conversion gives each write a
          new value. A write invalidates the links that mention the old endpoint; assignments, branches, and function
          postconditions add facts; the end of an <code>edit</code> asks the solver to discharge the open obligations.
          Successful proof evidence is erased, so a <code>Packet</code> at runtime is still just a length and some
          bytes.
        </p>

        <H2>The first real program should be boring too</H2>
        <p>
          I would not test this language with red-black trees or a theorem about addition. I would write a medium-sized
          binary parser and serializer, then an image buffer library. Those programs are full of values that are
          ordinary on their own and constrained only because a format or data structure placed them next to something
          else.
        </p>
        <p>
          The useful measurement would not be “how many proofs did Tether verify?” It would be how often application
          code still has to repeat a check, how many public signatures acquire type-level plumbing, how far an
          invariant failure is reported from the write that caused it, and whether an ordinary edit feels ordinary.
        </p>
        <p>
          The previous article&apos;s pitch was to put a type on the edge between two fields. The language version is a
          little stronger: make that edge something the compiler can preserve, invalidate, repair, and explain. If
          Tether is worth building, it will not be because <code>link</code> is cute syntax. It will be because local
          relationships can stay local even after the program starts changing things.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
