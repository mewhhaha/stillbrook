import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, H2, Prose } from "../../components";

export const article = {
  title: "The type between the fields",
  description:
    "Relationship types let a record state why two ordinary values belong together without turning either value into a globally indexed type.",
  published: "2026-08-11T09:10:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-type-between-the-fields-journal.webp",
    alt: "A loose row of speckled eggs and a notched brass gauge sit beside eggs held in a divided cloth case.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ordinaryPacket = `
  type Packet = {
    length: U16
    body: Bytes
  }
`;

const indexedPacket = `
  type Packet<n: Nat> = {
    length: Nat<n>
    body: Vector<n, Byte>
  }

  fn decode(input: Bytes) -> exists n. Packet<n>
`;

const relationshipPacket = `
  relationship LengthMatches(
    declared: Nat,
    actual: Nat,
  ) = declared == actual

  type Packet = {
    length: U16
    body: Bytes

    relationship lengthMatches:
      LengthMatches(length, body.length)
  }
`;

const decodePacket = `
  fn decode(input: Bytes) -> Result<Packet, DecodeError> {
    let length = input.readU16()
    let body = input.readBytes(length)

    prove LengthMatches(length, body.length)

    return Packet { length, body }
  }
`;

const resizePacket = `
  fn truncate(packet: Packet, n: Nat) -> Packet {
    let body = packet.body.take(n)

    return Packet {
      length: body.length,
      body,
    }
  }
`;

const otherRelationships = `
  type Image = {
    width: Nat
    height: Nat
    pixels: Bytes
    relationship packed:
      pixels.length == width * height * 4
  }

  type Slice = {
    start: Nat
    end: Nat
    source: Bytes
    relationship ordered: start <= end
    relationship inBounds: end <= source.length
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          A packet arrives with a length field and some bytes. The first type you write is almost embarrassingly
          ordinary:
        </p>
        <CodeBlock lang="text" title="packet" code={ordinaryPacket} />
        <p>
          Everybody reading it can see the missing fact. <code>length</code> is supposed to agree with{" "}
          <code>body.length</code>, but the record says nothing about that agreement. So the dependently typed
          instinct is to move the length into the type of the body. Idris uses exactly this shape for its standard{" "}
          <a href="https://idris2.readthedocs.io/en/stable/tutorial/introduction.html">
            <code>Vect n a</code>
          </a>{" "}
          example: <code>n</code> is an index, and the vector carries its length in its type.
        </p>
        <p>
          That is a good representation when length is part of what a vector <em>is</em>. I am less convinced it
          should be the automatic answer whenever one value happens to constrain another. A packet body is still
          bytes when nobody cares about the header. The interesting fact appears only after those bytes are placed
          next to a declared length.
        </p>

        <H2>The index escapes the record</H2>
        <p>
          Give the packet a type-level length and the missing invariant becomes explicit:
        </p>
        <CodeBlock lang="text" title="An indexed packet" highlight="1-5,7" code={indexedPacket} />
        <p>
          Now <code>body</code> cannot have the wrong length. But <code>n</code> has become part of the packet&apos;s
          identity, so code that does not care about it still has to quantify over it, infer it, hide it, or carry
          an existential package around. Idris has{" "}
          <a href="https://idris2.readthedocs.io/en/stable/tutorial/typesfuns.html#dependent-pairs">
            dependent pairs
          </a>{" "}
          for exactly the case where an index is only discovered at runtime: a value like{" "}
          <code>(n ** Vect n Int)</code> packages the number with the vector whose type mentions it.
        </p>
        <p>
          None of that is a flaw in dependent types. It is the correct cost when callers need the index. The cost
          feels odd when the program only wanted to remember that two fields agree. Decode a packet, put it in a
          queue, log it, encrypt its body byte-for-byte, then send it elsewhere; most of those operations have no
          use for a type parameter naming the payload length.
        </p>
        <p>
          The invariant belongs to the pair. That suggests a different place to put the type information: on the
          edge between the values that participate in it.
        </p>

        <H2>Put a type on the edge</H2>
        <p>
          Imagine that a record can contain a named relationship alongside its fields. The fields keep their
          ordinary types, while the relationship names a proposition over them:
        </p>
        <CodeBlock lang="text" title="The same packet with a relationship" highlight="1-4,10-11" code={relationshipPacket} />
        <p>
          <code>LengthMatches</code> is a type whose inhabitants witness equality between the declared length and
          the length computed from the byte string. The compiler can erase that witness after checking it, just as
          many proof terms disappear in dependently typed programs. What changes is the surface area: the relation
          lives inside <code>Packet</code>, and <code>Bytes</code> does not acquire an index merely because one record
          wants to compare its length with something else.
        </p>
        <p>
          This is close to refinement typing. Jhala and Vazou describe{" "}
          <a href="https://arxiv.org/abs/2010.07763">refinement types</a> as ordinary types narrowed by logical
          predicates, and dependent refinements have been used to express relationships such as vector bounds.
          A sufficiently expressive refinement system could encode the packet above today. I am not claiming new
          type theory here. The design question is whether the relationship deserves its own named slot in the data
          model rather than being smuggled into one endpoint&apos;s top-level type.
        </p>
        <p>
          That distinction starts to matter once a record has several invariants. An image might relate width,
          height, pixel format, and byte count. A slice relates two offsets to each other and then relates the upper
          offset to a source buffer. Encoding every one of those facts as another index on the container can turn a
          fairly boring runtime object into a long type-level parameter list.
        </p>
        <CodeBlock lang="text" title="Relationships stay local to the records that need them" code={otherRelationships} />

        <H2>Check once at the boundary</H2>
        <p>
          A relationship type cannot make untrusted bytes truthful. The parser still has to establish the fact when
          data crosses into the typed world. That can be a runtime check, a consequence of an operation the checker
          already understands, or an explicit proof for a harder predicate.
        </p>
        <CodeBlock lang="text" title="Decoding establishes the relationship" highlight="5,7" code={decodePacket} />
        <p>
          In this example, <code>readBytes(length)</code> already promises to return exactly that many bytes or fail,{" "}
          so the proof may be discharged without generating another comparison. A parser that reads an independently
          delimited body would perform the equality check there instead. Either way, callers receive an ordinary{" "}
          <code>Packet</code> after the boundary rather than an unchecked pair of values that must be compared again
          at every use.
        </p>
        <p>
          Mutation makes the model more interesting. Write a new <code>body</code> and the old relationship witness
          is invalid, because it mentioned the previous body. The language can respond the same way a borrow checker
          responds when an alias stops being usable: make the record temporarily incomplete until the relationship is
          re-established, or require an update that preserves all affected relationships.
        </p>
        <CodeBlock lang="text" title="Changing one endpoint means rebuilding the relation" code={resizePacket} />
        <p>
          I have not worked out which mutation rule would feel best in a real language. Requiring every intermediate
          expression to satisfy every record invariant may be too strict for ordinary construction, while letting a
          broken relationship float arbitrarily far would defeat the point. A small scoped builder, where
          relationships must hold again when the value leaves the scope, seems plausible but needs actual use before
          I would trust it.
        </p>

        <H2>Some properties really are intrinsic</H2>
        <p>
          This idea does not replace indexed types. If an algorithm&apos;s behavior genuinely depends on vector length,
          then <code>Vector&lt;n, A&gt;</code> gives the function exactly the handle it needs. Matrix multiplication is the
          obvious case: the dimensions participate in the operation&apos;s type, so hiding them inside a record relation
          would make the API worse.
        </p>
        <p>
          Relationship types fit the other class of invariant, where ordinary values become constrained because a
          particular structure puts them together. File offsets, protocol headers, cached counts, AST source spans,
          image dimensions, and foreign-memory views are full of these local agreements. The values remain useful on
          their own; the structure is what gives the agreement meaning.
        </p>
        <Callout variant="note" title="Keep the logic boring">
          <p>
            Equality, ordering, integer ranges, and small arithmetic expressions already cover a large share of the
            examples I care about. Once arbitrary user code participates in automatic proof search, error messages and
            compile times become a language-design problem of their own. Harder relationships can fall back to named
            proof functions instead of asking a solver to become a theorem prover in the editor loop.
          </p>
        </Callout>
        <p>
          The packet is still the example I keep coming back to because the runtime object never needed to become
          exotic. It has a number and a byte string. The extra thing is one erased piece of evidence connecting them,
          sitting in the record exactly where the two values first became each other&apos;s problem.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
