import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Goose keeps the address",
  description:
    "Goose lets an array grow around stable references by giving storage a stricter shape. The interesting part is what that shape asks of the rest of the program.",
  published: "2026-10-18T00:10:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/goose-keeps-the-address-journal.webp",
    alt: "A goose stands beside a compartmented brass trough containing colored stones and a crank at one end.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const stableItem = `
  struct Item { score: i64 }

  fn main() {
      var entries: Item[>..] = [];
      let saved: Item& = entries.push(Item { 7 });
      entries.push(Item { 12 });
      saved.score = 9;
  }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Growing an array can become a surprisingly social operation. Eventually an element arrives,
          the storage moves, and everyone holding an address into the old allocation needs to hear about it. A handle
          table can keep the peace. So can an extra pointer per object. Wouter van Oortmerssen&apos;s{" "}
          <a href="https://github.com/aardappel/goose">Goose</a>{" "}
          caught my attention by arranging the storage so the existing elements can stay where they are.
        </p>
        <p>
          The small example I would start with is an array of records. Keep a reference to the first
          record, append another, then update the first through that reference. It is an ordinary thing
          to want when building a graph or collecting work that refers to earlier work.
        </p>
        <AnnotatedCode
          lang="text"
          title="A reference survives a push"
          code={stableItem}
          notes={[
            { line: 4, note: "[>..] declares a grow-only array." },
            { line: 5, note: "push returns a reference to the inserted record." },
            { line: 7, note: "The earlier record is still at the address saved points to." },
          ]}
          caption={
            <>
              A smaller adaptation of Goose&apos;s{" "}
              <a href="https://github.com/aardappel/goose/blob/2ba7ca43f76cce3155e5ee292ba0815febd5294a/samples/02_memory.goose">
                memory example
              </a>.
            </>
          }
        />
        <p>
          The useful promise here is very specific: appending to this container preserves the address
          already handed out. That lets a reader understand the last assignment without following a
          separate identity scheme through the program.
        </p>
        <p>
          The promise lasts while the owning storage is alive. A reference still cannot escape into
          some longer-lived object and survive its owner. That boundary matters when drawing the graph:
          the arrows may cross between records, but they need storage that outlives their use.
        </p>

        <H2>Leave room at the end</H2>
        <p>
          Goose&apos;s{" "}
          <a href="https://github.com/aardappel/goose/blob/2ba7ca43f76cce3155e5ee292ba0815febd5294a/docs/goose_spec.md#12-memory-model">
            memory model
          </a>{" "}
          separates the native call stack from data stacks backed by reserved virtual address space.
          Pages are committed as needed. Each data stack has a bump pointer, and at most one live
          resizable value occupies its growing end. Two simultaneously growing containers need separate
          stacks. The compiler works out how many stacks the program requires.
        </p>
        <p>
          I picture a long workbench with an empty stretch beyond the current project. Adding another
          piece uses that stretch. Placing somebody else&apos;s project immediately after it would spoil
          the arrangement, which explains why the rule about one growing value matters. Stable addresses
          follow from keeping that room available.
        </p>
        <p>
          The{" "}
          <a href="https://github.com/aardappel/goose/blob/2ba7ca43f76cce3155e5ee292ba0815febd5294a/docs/tutorial.md#4-where-values-live">
            tutorial&apos;s account of storage
          </a>{" "}
          follows the idea through allocation and cleanup: growth advances a pointer; leaving the owning
          scope restores the earlier position. Locals with separate lifetimes can reuse storage. The
          large reservation is address space, so its size should not be mistaken for resident memory.
        </p>
        <p>
          That makes temporary work especially easy to imagine. Parse a chunk, build the intermediate
          values needed for that chunk, finish, and leave the scope. I like being able to point at a
          closing brace and explain why a whole batch of storage becomes available again.
        </p>

        <H2>The shape reaches into the algorithm</H2>
        <p>
          The same specification limits recursion: a function in a recursive cycle cannot keep a
          nonfixed local alive across a call back into that cycle. Storage that must survive the descent
          belongs outside the cycle and is passed in. Arrays whose elements have variable sizes also
          require sequential traversal; direct random indexing needs a separately maintained index.
        </p>
        <p>
          Those restrictions would affect how I wrote a tree builder. A recursive routine that creates
          its own growing buffer before visiting children would need another arrangement. Keeping the
          output pool in the caller might improve the design. Sometimes it would just be extra work.
          Either outcome belongs in an evaluation of the language alongside the pleasant append example.
        </p>
        <p>
          For less orderly lifetimes, the{" "}
          <a href="https://github.com/aardappel/goose/blob/2ba7ca43f76cce3155e5ee292ba0815febd5294a/docs/tutorial.md#11-when-lifetimes-really-are-not-nested">
            reusable-pool tutorial
          </a>{" "}
          describes slots that remain valid values of their declared type after release. Reusing a slot
          can make an old reference observe a different record. Memory remains type safe, while logical
          identity becomes the program&apos;s responsibility. A stale enemy handle can still select the
          wrong enemy.
        </p>
        <p>
          Before choosing Goose for a larger tool, I would build one representative parser or graph
          pass and count the accommodations: extra index tables, buffers moved outside recursive calls,
          and places that need explicit identity checks. I would measure resident memory and iteration
          time too. The address staying put is a good starting point; the next question is how naturally
          the rest of my program fits around it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
