import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, H2, Prose } from "../../components";

export const article = {
  title: "The facts live beside the values",
  description:
    "Rel is a sketch of a language where ordinary values keep ordinary types while the checker carries temporary facts about how those values relate.",
  published: "2026-08-14T18:18:00Z",
  author: "Mira Voss",
  tags: ["software"],
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const packetShape = `
  type Packet = {
    length: Nat
    body: Bytes
  }

  fact Sized(p: Packet) =
    p.length == p.body.len
`;

const decodePacket = `
  fn readExact(input: Cursor, n: Nat)
    -> bytes: Bytes
    gives bytes.len == n

  fn decode(input: Cursor) -> p: Packet
    gives Sized(p)
  {
    let length = input.readU16().toNat()
    let body = readExact(input, length)

    return Packet { length, body }
  }
`;

const callers = `
  fn inspect(p: Packet) {
    print(p.length, p.body)
  }

  fn send(p: Packet)
    needs Sized(p)
  {
    socket.writeU16(p.length)
    socket.write(p.body)
  }

  let packet = decode(input)

  inspect(packet)  // only needs Packet
  send(packet)     // Sized(packet) is known here
`;

const mutation = `
  var packet = decode(input)

  packet.body = packet.body.take(8)

  send(packet)
  // error: missing fact Sized(packet)

  packet.length = packet.body.len

  send(packet) // okay
`;

const mutationError = `
  error: send needs Sized(packet)

    required:
      packet.length == packet.body.len

    this fact was known after decode(input)
    and forgotten when packet.body changed
`;

const split = `
  fn split(bytes: Bytes, n: Nat)
    -> (left: Bytes, right: Bytes)
    gives {
      left.len + right.len == bytes.len
      left.len == min(n, bytes.len)
    }
`;

const branchFact = `
  fn sendIfValid(packet: Packet) {
    if packet.length == packet.body.len {
      send(packet)
    }

    // Sized(packet) is no longer assumed here.
  }
`;

const checkerContext = `
  values
    packet : Packet
    left   : Bytes
    right  : Bytes

  facts
    Sized(packet)
    left.len + right.len == packet.body.len
    left.len <= 8
`;

const witness = `
  let proof = witness Sized(packet)

  // proof is an ordinary value now.
  // Most code never needs to do this.
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          I keep moving the same invariant around. First it lived in a vector index. Then{" "}
          <a href="/articles/the-type-between-the-fields">it moved onto the relationship between two fields</a>.
          Tether made that relationship a{" "}
          <a href="/articles/a-language-made-of-links">named link the compiler could invalidate</a>, and the next
          version let individual data structures{" "}
          <a href="/articles/let-the-data-structure-invent-types">mint types of their own</a>. Each step made the
          fact more local, which left me wondering why the fact had to live inside the data structure at all.
        </p>
        <p>
          A packet can have a length field and a byte string before anyone has checked that they agree. Logging that
          packet is fine. Printing it is fine. The agreement matters at a few specific operations, such as sending it
          on a wire that trusts the header. Encoding &ldquo;valid packet&rdquo; as a permanent top-level type makes every
          operation participate in a distinction many of them do not care about.
        </p>
        <p>
          So here is another language sketch. Call it <strong>Rel</strong>; the name is dull on purpose. Values have
          ordinary types. The type checker also carries a changing set of facts about relationships between the values
          currently in scope.
        </p>

        <H2>A fact does not have to be a field</H2>
        <p>
          The packet type in Rel is boring. The relationship gets a name, but declaring the relationship does not make
          every <code>Packet</code> satisfy it.
        </p>
        <CodeBlock lang="text" title="packet.rel" highlight="1-4,6-7" code={packetShape} />
        <p>
          <code>Sized</code> is a proposition the checker understands. It is not stored in the record and it is not a
          hidden type parameter. A raw parser can produce a <code>Packet</code> without proving anything. A checked
          parser can publish the extra fact in its function contract.
        </p>
        <CodeBlock lang="text" title="decode.rel" highlight="1-3,5-6,12" code={decodePacket} />
        <p>
          The postcondition on <code>readExact</code> gives the checker <code>body.len == length</code>. That is enough
          to establish <code>Sized(p)</code> when the packet is returned. There is no proof term in the runtime object;
          the caller receives one value and one piece of compile-time knowledge about it.
        </p>
        <p>
          Callers then say whether they care about that knowledge. An inspector accepts any packet. The sender asks for
          the relationship because it is about to serialize the header and body as one message.
        </p>
        <CodeBlock lang="text" title="callers.rel" highlight="5-6,15-16" code={callers} />
        <p>
          I like this more than inventing <code>UncheckedPacket</code> and <code>CheckedPacket</code> for every stage.
          The value did not change after <code>decode</code>. What changed was what the scope knew about it.
        </p>

        <H2>Facts have a lifetime</H2>
        <p>
          This becomes useful once the value changes. Rel treats assignments as new value identities under the hood.
          A write throws away facts that mention the old value unless the checker can derive an equivalent fact for the
          new one.
        </p>
        <CodeBlock lang="text" title="mutation.rel" highlight="3,5-6,9,11" code={mutation} />
        <p>
          After the body is truncated, the old equality is gone. The packet still has type <code>Packet</code>, so code
          that only inspects it keeps working. <code>send</code> is the place that complains. Updating the length gives
          the checker enough information to recover the equality.
        </p>
        <CodeBlock lang="text" title="compiler output" code={mutationError} />
        <p>
          Branches work the same way. A successful comparison adds a fact to the branch where it holds, and leaving
          that branch drops the fact again.
        </p>
        <CodeBlock lang="text" title="branch.rel" highlight="2-4,7" code={branchFact} />
        <p>
          This is close to the direction in{" "}
          <a href="/articles/numbers-are-sets">Numbers are sets</a>, where a branch narrows the possible values of a
          number. Rel keeps that temporary knowledge in a separate fact context instead of trying to turn every useful
          branch condition into a larger algebraic type.
        </p>

        <H2>Function types can move relationships too</H2>
        <p>
          Relationships get more interesting when the values are not fields of the same record. Splitting a byte string
          creates two new values and several useful facts connecting them to the input.
        </p>
        <CodeBlock lang="text" title="split.rel" highlight="2-7" code={split} />
        <p>
          Neither result needs to become <code>Bytes&lt;n&gt;</code>. The caller gets ordinary byte strings plus whatever
          relationships the function promised. Keep both values and the facts remain available. Drop one value and
          facts that mention it can disappear with it.
        </p>
        <p>
          At any line the checker is carrying two fairly different things. One is the familiar map from names to
          ordinary types. The other is a small graph of facts over the current value identities.
        </p>
        <CodeBlock lang="text" title="A debugging view of the checker" code={checkerContext} />
        <p>
          Function calls check their <code>needs</code> facts and add their <code>gives</code> facts. Comparisons add
          facts to the successful path. Mutation invalidates facts incident to the changed value. Scope exit removes
          the rest. That is most of the language feature.
        </p>
        <p>
          When a program really needs to store a proof, Rel can reify one explicitly. That is the move from{" "}
          <a href="/articles/witness-me">A value can carry proof</a>, kept as an escape hatch instead of the default
          representation for every checked relationship.
        </p>
        <CodeBlock lang="text" title="Reifying a fact" code={witness} />

        <H2>The compiler should forget almost all of this</H2>
        <p>
          A function body might accumulate dozens of equalities while parsing a header or walking a buffer. Most of
          them are implementation debris. Rel should export only the facts written in the public <code>needs</code> and{" "}
          <code>gives</code> clauses, then throw the local graph away when the function closes.
        </p>
        <p>
          That follows the argument in{" "}
          <a href="/articles/make-the-type-checker-forget">Make the type checker forget</a>: richer local reasoning is
          easier to tolerate when the compiler promises not to turn every temporary inference into global state. It
          also fits <a href="/articles/the-proof-budget">The proof budget</a>. Equality, ordering, bounds, and linear
          arithmetic cover a lot of useful relationships without asking an editor to become an interactive theorem
          prover.
        </p>
        <p>
          The part I have not settled is higher-order code. A generic function that never looks inside a packet should
          probably preserve facts about that packet automatically, even when it accepts callbacks. There is a sensible
          frame rule hiding in there, but I do not yet know what its surface syntax should be. I would rather leave that
          hole visible than invent three keywords and pretend the problem went away.
        </p>
        <p>
          At runtime, a packet in Rel is still a number beside some bytes. In the editor, <code>send(packet)</code> is
          accepted after <code>decode</code>, rejected after the body changes, and accepted again once the length agrees.
          The extra thing lives only in the checker, for exactly as long as the program has reason to know it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
