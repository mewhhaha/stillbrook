import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The page is the work unit",
  description:
    "Go 1.26's Green Tea garbage collector gets faster by queuing heap pages instead of individual objects, letting physical locality shape a graph traversal that used to fight the CPU.",
  published: "2026-08-09T06:10:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Magnetic_core.jpg",
    alt: "A microscope photograph shows black ferrite memory cores threaded by red and green wires in a regular grid.",
    credit: {
      author: "H.J. Sommer III, Professor of Mechanical Engineering, Penn State University",
      license: "CC BY 2.5",
      href: "https://commons.wikimedia.org/wiki/File:Magnetic_core.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const traversal = [
  ["Work list entry", "One reachable object", "One heap page with reachable objects"],
  ["Order", "Approximately depth-first", "FIFO pages so work can accumulate"],
  ["Scan inside a page", "Whichever object the graph reaches next", "Seen, unscanned objects in memory order"],
  ["Repeated work-list entry", "An object enters once", "A page may return when new objects become reachable"],
  ["Vector path", "Irregular object-sized fragments", "Regular page metadata and same-size object slots"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          Draw a garbage collector on a whiteboard and it looks tidy. Start from the roots, follow a pointer,
          mark the object, follow its pointers, repeat. If you are thinking about graph correctness, that traversal
          is almost offensively ordinary. Put the same graph back into real memory and the picture gets uglier:
          every arrow can throw the CPU onto another part of the heap.
        </p>
        <p>
          That is the problem Go&apos;s Green Tea collector attacks. Go 1.26 leaves the definition of reachability
          alone and changes the unit of work underneath the graph walk, from an individual object to a heap page.
          The processor cares where the next bytes live even when the language does not.
        </p>
        <p>
          You can see the whole bet in one comparison. The old collector follows the graph as soon as it discovers
          work. Green Tea is willing to leave reachable objects waiting for a moment so that nearby work can pile up
          on the same page.
        </p>
        <DataTable
          head={["Mechanism", "Previous mark loop", "Green Tea"]}
          rows={traversal}
          caption="The reachability algorithm stays a graph flood; Green Tea changes how discovered work is queued and scanned."
        />

        <H2>The graph has terrible locality</H2>
        <p>
          The Go team&apos;s <a href="https://go.dev/blog/greenteagc">Green Tea write-up</a> spends a surprising amount
          of time on this distinction because the old collector was already doing the obvious algorithm well. Its
          mark phase keeps a work list of objects and scans each object for pointers. A discovered child becomes more
          object work. That is a sensible graph walk and a rotten memory-access plan when parent and child happened to
          be allocated far apart.
        </p>
        <p>
          Modern processors hide memory latency by caching nearby bytes and prefetching predictable streams while
          keeping many operations in flight. Pointer chasing denies them that pattern. The next address depends on
          data you have only just loaded, the object at that address may be small, and its next pointer may jump
          somewhere else again. The collector keeps arriving at a cache line, touching a little of it, and leaving.
          What a waste.
        </p>
        <p>
          Parallel marking makes the queue itself part of the problem. More workers can drain graph work faster, but
          they also contend on the machinery that shares that work, while each worker still performs the same
          unpredictable heap reads. Faster cores do not rescue a traversal that spends its time waiting for memory;
          adding cores can make the shared scheduling pressure more visible.
        </p>
        <p>
          A pointer tells the collector what must eventually be visited. It says nothing about the order the cache
          would prefer. Green Tea finally treats those as separate decisions.
        </p>

        <H2>Let the page fill up</H2>
        <p>
          Green Tea marks the target object when it follows a pointer, but the work list holds the object&apos;s page.
          While that page waits in a FIFO queue, other pointers may discover more objects on it. When the collector
          returns to the page, it compares the page&apos;s seen and scanned metadata and walks the outstanding objects in
          address order. One trip can now cover several nearby objects instead of bouncing away after the first one.
        </p>
        <p>
          There is a cost hidden in that patience. New pointers can make an already-scanned page eligible again, so a
          page may cycle through the queue more than once. Some heaps also expose only one useful object per page at a
          time, which leaves Green Tea paying bookkeeping costs without harvesting much locality. The implementation
          has a special case for single-object scans, and the Go team still calls out workloads that gain little or
          nothing. I cannot infer from the published benchmark set how often those heap shapes dominate outside the
          deployments they measured.
        </p>
        <p>
          The result that changed my intuition is their density threshold. In testing, scanning only about 2% of a
          page in one pass could already beat the object-at-a-time graph flood. You do not need a perfectly packed
          page for locality to pay; a modest amount of nearby work can cover the extra accumulation machinery.
        </p>
        <p>
          Once work arrives in regular page-sized batches, another door opens. Go allocates small objects of the same
          size together, and the collector already has compact metadata for seen versus scanned slots plus a
          pointer/scalar bitmap. Green Tea can combine those bitmaps for a whole page, then use wide vector registers
          on newer x86 processors to identify active pointer words in straight-line chunks. The old loop offered the
          vector unit a sequence of unrelated object shapes and addresses. There was little regular work to widen.
        </p>
        <p>
          That vector path moved from prototype to default runtime quickly. The original
          <a href="https://github.com/golang/go/issues/73581"> implementation issue</a> tracks the page-based design,
          its density tradeoffs, and the SIMD work. By the <a href="https://go.dev/doc/go1.26">Go 1.26 release</a>,
          Green Tea was enabled by default, with the release notes saying GC-heavy real programs can see roughly a
          10–40% reduction in collector overhead and newer amd64 machines can gain further from vector scanning.
          Those are workload-dependent numbers, which is exactly what a locality optimization should produce.
        </p>
        <p>
          At the bottom of those release notes sits the compatibility escape hatch:{" "}
          <code>GOEXPERIMENT=nogreenteagc</code>. Go 1.26 still lets a build select the previous collector when a
          workload regresses, and the note says that opt-out is expected to disappear in Go 1.27. For one release,
          the old object work list survives as a build flag beside the page queue that replaced it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
