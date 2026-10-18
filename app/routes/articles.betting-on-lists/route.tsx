import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, DataTable, H2, MemoryBoxes, Prose } from "../../components";

export const article = {
  title: "Betting on lists",
  description:
    "Blot's lists put adding, removing, and iterating first. Dense leaves and shared tree branches make that a different bet from a contiguous array.",
  published: "2026-10-18T00:16:00Z",
  author: "Still Brook",
  tags: ["software"],
  image: {
    src: "/images/articles/betting-on-lists-journal.webp",
    alt: "A branching brass specimen stand holds four wooden seed trays beneath a magnifying lens, with a fifth tray detached beside it.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const editing = `
  import * as list from "std/list"

  const revise = fn (last: U32) => do:
    let original: List U32 = [10, 20, 30, 40]
    let longer = [...original, last]
    let shorter = list.splice 1 2 [] longer

    let total = 0
    for value in shorter:
      total := self + value

    return (original, shorter, total)
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          Collect some diagnostics, discard the ones that no longer apply, then walk what remains.
          A lot of the collection code I want to write has that shape. The size emerges as the
          program runs. Things arrive, things leave, and eventually somebody needs to read them
          in order.
        </p>
        <p>
          Those are the operations I want Blot&apos;s lists to be good at: adding, removing, and
          iterating. The language keeps <code>List</code> and <code>Array</code> separate, with
          different storage and different interfaces. That gives the implementation room to take
          each job seriously.
        </p>

        <H2>A tree with dense leaves</H2>
        <p>
          Blot&apos;s{" "}
          <a href="https://github.com/mewhhaha/blot2/blob/6b2196569faabf715013d28d8e5565f854ddca86/zig-native/src/runtime/list_runtime.zig#L1-L69">
            runtime list
          </a>{" "}
          is a persistent AVL tree. Branches connect smaller sequences; the elements live together
          in dense leaves. A leaf grows through allocation sizes up to a limit of 244 storage
          words. For <code>U32</code>, that means up to 244 elements. A packed record uses several
          words, so fewer records fit. Small lists start with small leaves.
        </p>
        <p>
          This puts nearby elements next to each other in memory while leaving room to rearrange
          larger pieces through the tree. There is a branch structure to maintain, but the walk
          between individual elements within a leaf is a walk through contiguous storage. The
          tradeoff is already visible: some overhead between chunks buys flexibility around them.
        </p>
        <p>
          Both lists and arrays have immutable value semantics. Keeping an earlier value keeps
          its contents. Underneath that promise, Blot can reuse storage when ownership proves
          nobody else needs the old version. Persistence describes what the program can observe;
          ownership decides how much copying is necessary.
        </p>

        <H2>Adding at the edges</H2>
        <p>
          The ordinary spellings are <code>[...values, item]</code> and{" "}
          <code>[item, ...values]</code>. The library also exposes <code>list.append</code> and{" "}
          <code>list.prepend</code>. An exclusively owned end edit can reuse the leaf&apos;s spare
          capacity and the tree nodes leading to it. Growth may still allocate a larger leaf or
          another branch, and the tree must remain balanced.
        </p>
        <p>
          When an older version remains shared, the runtime copies the affected leaf and tree
          path. Unchanged subtrees remain shared. That makes the size of the edited path relevant
          instead of requiring every existing element to move on every append.
        </p>
        <MemoryBoxes
          title="Two list roots share the unchanged left leaf and point to different right leaves after an append."
          boxes={[
            { id: "old", label: "earlier root", fields: [
              { name: "left", pointsTo: "prefix" },
              { name: "right", pointsTo: "old-tail" },
            ] },
            { id: "new", label: "appended root", fields: [
              { name: "left", pointsTo: "prefix" },
              { name: "right", pointsTo: "new-tail" },
            ] },
            { id: "prefix", label: "shared leaf", fields: [{ name: "values", value: "0 … 243" }] },
            { id: "old-tail", label: "earlier tail", fields: [{ name: "values", value: "244, 245" }] },
            { id: "new-tail", label: "new tail", fields: [{ name: "values", value: "244, 245, 246" }] },
          ]}
          caption="A schematic two-leaf list with its earlier version retained. Appending copies the right leaf and root; both versions still use the same left leaf."
        />
        <p>
          The sharing costs something too: ownership checks, tree navigation, and copies when
          versions diverge. I would measure a private builder separately from a builder that
          saves every intermediate result. They ask quite different things of the same append
          expression.
        </p>

        <H2>Removing pieces</H2>
        <p>
          The useful operation for a known range is{" "}
          <a href="https://github.com/mewhhaha/blot2/blob/6b2196569faabf715013d28d8e5565f854ddca86/std/list.blot#L32-L66">
            <code>list.splice</code>
          </a>. Give it a start, a deletion count, a replacement list, and the original list.
          An empty replacement deletes the range. A zero deletion count inserts at that position.
        </p>
        <AnnotatedCode
          lang="text"
          title="Add, remove, then walk"
          code={editing}
          notes={[
            { line: 5, note: "Append the runtime argument to the list." },
            { line: 6, note: "Starting at zero-based position 1, remove two elements." },
            { line: 9, note: "Read the remaining elements in sequence." },
            { line: 12, note: "Return the earlier value alongside the edited one." },
          ]}
          caption="With last set to 50, the shorter list contains 10, 40, 50 and the total is 100. The original still contains all four starting values."
        />
        <p>
          The implementation builds that edit from slices and concatenations. Whole subtrees can
          survive; partial boundary leaves are copied, and boundary paths are rebuilt. A small
          slice also gets its own boundary storage, so retaining one element does not require
          retaining its large discarded leaf or the original root.
        </p>
        <p>
          Removing by a condition has a different cost. <code>list.filter</code> must visit the
          elements and evaluate the predicate to discover what survives. Knowing where to cut
          and searching for what to remove are separate workloads. For several known edits,{" "}
          <code>list.splice_many</code> accepts ordered, nonoverlapping ranges expressed in the
          original list&apos;s coordinates.
        </p>

        <H2>The walk matters</H2>
        <p>
          Efficient edits would be a poor bargain if every later read paid heavily for them.
          Blot&apos;s direct list loops consume a leaf before finding the next one. The{" "}
          <a href="https://github.com/mewhhaha/blot2/blob/6b2196569faabf715013d28d8e5565f854ddca86/zig-native/src/backend/list_traversal.zig">
            private tree walk
          </a>{" "}
          remembers pending right subtrees and visits each tree edge at most once. Sequential
          traversal can use that knowledge instead of searching from the root for every element.
        </p>
        <p>
          Small, flat scalar records and tuples can also store their fields directly in the
          leaves. That avoids a separate heap object per row for eligible layouts. Reference-bearing
          and more complicated values keep their boxed representation. Element shape matters
          alongside collection size.
        </p>
        <p>
          An explicit cursor has another obligation: copying it must preserve its position, and
          later collection edits must preserve its snapshot. Some private cursor uses can be
          optimized, but a cursor that escapes needs those guarantees. A fast direct-loop result
          therefore does not establish the cost of every iterator pipeline.
        </p>

        <H2>Leave arrays their job</H2>
        <p>
          Blot&apos;s arrays keep contiguous storage and constant-time indexing. They suit a known
          size, repeated positional reads, or a calculation that updates particular slots. An
          indexed update can reuse exclusively owned local storage; an observable earlier array
          must remain intact. Immutability applies to both collection types.
        </p>
        <DataTable
          head={["Operation", "List", "Array"]}
          rows={[
            ["Grow at an end", "Reuse owned storage or copy an edited path", "Runtime append copies the contents"],
            ["Slice or join", "Share whole subtrees; copy boundaries", "Copy contiguous storage"],
            ["Traverse", "Dense leaves with tree transitions", "One contiguous sequence"],
            ["Read by index", "No public indexing", "Constant-time access"],
          ]}
          caption={
            <>
              The runtime choices in the{" "}
              <a href="https://github.com/mewhhaha/blot2/blob/6b2196569faabf715013d28d8e5565f854ddca86/compiler/guide.md#lists-arrays-and-libraries">
                current implementation
              </a>, pinned to revision 6b21965. Constant evaluation uses a separate representation.
            </>
          }
        />
        <p>
          Repeated runtime array appends pay for copying the growing prefix. If the final size is
          known, allocate it directly. If it emerges during filtering or generation, a list can
          collect the result before one explicit <code>Array.from_list</code> conversion. That
          conversion copies, so doing it repeatedly inside a loop would undo much of the point.
        </p>
        <p>
          My bet is that growing, cutting, and walking deserve a collection designed around
          them. The measurements I care about follow those operations: bytes copied while
          building, storage retained after a cut, and time per element for the next traversal.
          Run them with and without saved versions, and with the actual element types. That is
          where this choice has to earn its place.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
