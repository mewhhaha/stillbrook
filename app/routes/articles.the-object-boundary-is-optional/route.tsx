import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The object boundary is optional",
  description:
    "Slab separates logical identity, storage bands, relationship facts, and compiler summaries so the same program structure can improve memory locality and shrink compilation work.",
  published: "2026-08-14T21:50:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/97/Bletchley_Park_1945_photo_of_punched_card_machines.jpg",
    alt: "Rows of punched-card processing machines fill a work room at Bletchley Park in 1945.",
    credit: {
      author: "UK Government",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Bletchley_Park_1945_photo_of_punched_card_machines.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ordinaryParticle = `
  type Particle = {
    position: Vec3
    velocity: Vec3
    mass: F32
    alive: Bool
    name: Text
    debugColor: U32
  }
`;

const slabParticle = `
  table Particle {
    band motion {
      position: Vec3
      velocity: Vec3
    }

    band state {
      mass: F32
      alive: Bool
    }

    band cold {
      name: Text
      debugColor: U32
    }
  }
`;

const integrate = `
  fn integrate(world: &mut World, dt: F32) {
    for p in world.Particle.motion {
      p.position += p.velocity * dt
    }
  }
`;

const loweredMotion = `
  Particle.motion

    position.x  [f32 f32 f32 f32 ...]
    position.y  [f32 f32 f32 f32 ...]
    position.z  [f32 f32 f32 f32 ...]
    velocity.x  [f32 f32 f32 f32 ...]
    velocity.y  [f32 f32 f32 f32 ...]
    velocity.z  [f32 f32 f32 f32 ...]

  Particle.state

    mass        [f32 f32 f32 f32 ...]
    alive       [bit bit bit bit ...]

  Particle.cold

    name        [Text Text Text Text ...]
    debugColor  [u32  u32  u32  u32  ...]
`;

const zippedBands = `
  fn kineticEnergy(world: &World) -> F32 {
    let total = 0.0

    for (motion, state) in world.Particle.{motion, state}
      where state.alive
    {
      total += 0.5 * state.mass * length2(motion.velocity)
    }

    return total
  }
`;

const regionAllocation = `
  region frame {
    let sparks = table Particle

    repeat 100_000 {
      sparks.add {
        motion.position = randomPosition()
        motion.velocity = randomVelocity()
        state.mass = 1.0
        state.alive = true
        cold.name = ""
        cold.debugColor = 0xffcc44
      }
    }

    integrate(sparks, dt)
  }

  // all spark storage dies with frame
`;

const cursorAndKey = `
  for row in world.Particle.motion {
    // row is a dense scan cursor. Cheap, temporary, not storable.
    row.position += row.velocity * dt
  }

  let key = world.Particle.pin(row)
  // key is stable and may escape this loop.
  // Pinning opts into generation tracking and one level of indirection.
`;

const keyLowering = `
  scan cursor
    row: u32

  stable key
    slot: u32
    generation: u16

  resolve(key):
    physical_row = slots[key.slot].row
    require slots[key.slot].generation == key.generation
`;

const packetBands = `
  table Packet {
    band wire {
      length: U16
      body: Bytes
    }

    fact Sized(p: Packet) =
      p.wire.length == p.wire.body.len
  }

  fn send(p: Packet)
    needs Sized(p)
  {
    socket.writeU16(p.wire.length)
    socket.write(p.wire.body)
  }
`;

const bandSummary = `
  summary integrate {
    reads  Particle.motion.velocity
    writes Particle.motion.position

    imports {
      schema Particle.motion
      Vec3 arithmetic
    }
  }
`;

const schemaEdit = `
  table Particle {
    band cold {
      name: Text
      debugColor: U32
  +   editorNote: Text
    }
  }

  cache integrate: reusable
  reason: no dependency on Particle.cold
`;

const genericBand = `
  fn damp<B>(rows: &mut B, amount: F32)
  where B is band {
    velocity: Vec3
  }
  {
    for row in rows {
      row.velocity *= amount
    }
  }

  damp(world.Particle.motion, 0.98)
  damp(world.Debris.motion, 0.98)
`;

const genericKey = `
  codegen key for damp

    fields:
      velocity: Vec3

    layout:
      columnar Vec3

    effects:
      write velocity

    relationships used:
      none

  // Nominal table names are absent from the key.
`;

const compilerIr = `
  table Expr {
    band core {
      op: Op
      ty: TypeId
    }

    band edges {
      left: Expr?
      right: Expr?
    }

    band source {
      file: FileId
      span: Span
    }
  }
`;

const typePass = `
  fn infer(ir: &mut Ir)
    reads  Expr.core.op, Expr.edges
    writes Expr.core.ty
  {
    for (core, edges) in ir.Expr.{core, edges} {
      core.ty = inferNode(core.op, edges.left, edges.right)
    }
  }
`;

const compilerLowering = `
  Expr.core.op      [u8  u8  u8  u8  ...]
  Expr.core.ty      [u32 u32 u32 u32 ...]
  Expr.edges.left   [u32 u32 u32 u32 ...]
  Expr.edges.right  [u32 u32 u32 u32 ...]

  // untouched by inference:
  Expr.source.file  [u32 u32 u32 u32 ...]
  Expr.source.span  [u64 u64 u64 u64 ...]
`;

const compileIsland = `
  check function integrate {
    load schema Particle.motion
    load imported function summaries

    infer ordinary types
    solve local relationship facts
    infer read/write bands
    lower to compact IR

    emit summary
    discard local solver state
  }
`;

const cacheKey = `
  function-cache-key = hash(
    source_body,
    public_signature,
    imported_band_schemas,
    imported_fact_contracts,
    target_abi,
  )
`;

const parallelFrontier = `
  changed:
    Particle.cold
    renderLabel()

  ready compiler work:
    check renderLabel
    lower renderLabel

  reused:
    integrate
    kineticEnergy
    collisionBroadphase
    particleGpuUpload
`;

const dataUnits = [
  ["Logical identity", "One struct value or object address", "One row shared by several bands"],
  ["Physical grouping", "Usually follows the object", "Each band chooses its own packed layout"],
  ["Stable reference", "Often the default pointer/reference", "Opt-in key; scans use dense row cursors"],
  ["Type-check dependency", "Frequently a whole type or module", "The exact bands and facts a function imports"],
  ["Compiler work unit", "Often file/module/pass shaped", "Closed function plus compact summaries"],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="12 min read">
      <Prose>
        <p>
          The last few articles kept moving information out of types. A vector length became a relationship between
          fields, Tether gave those relationships names, and <a href="/articles/the-facts-live-beside-the-values">Rel</a>{" "}
          finally let the checker carry facts beside ordinary values. I still left one assumption sitting there the
          whole time: if the source says something is one value, memory probably stores it as one thing too.
        </p>
        <p>
          That assumption is convenient and surprisingly expensive. A particle update wants positions and velocities.
          A debugger wants names. A serializer wants almost everything, once. Putting all of those fields in one object
          gives the programmer a pleasant rectangle and asks the memory system to drag that rectangle through every
          loop forever.
        </p>
        <p>
          So this sketch starts lower. Call the language <strong>Slab</strong>. It separates four decisions that most
          languages tend to bundle together: what has identity, which fields are usually accessed together, which facts
          relate those fields, and which compiler jobs depend on them. The syntax is less important than keeping those
          four things from collapsing back into one giant type.
        </p>

        <H2>A record should not pick the cache line</H2>
        <p>
          The ordinary particle is exactly what I would write first in almost any language:
        </p>
        <CodeBlock lang="text" title="particle" code={ordinaryParticle} />
        <p>
          Nothing is wrong with that as a description of one logical particle. The trouble starts when the same braces
          silently become an allocation strategy. The hottest loop now walks past mass, liveness, a string handle, and
          debugging data to reach the next velocity.
        </p>
        <p>
          Slab keeps the particle identity but removes the promise that its fields sit together. A table is a family of
          rows. Bands say which fields belong to one storage and access unit.
        </p>
        <CodeBlock lang="text" title="particle.slab" highlight="2-5,7-10,12-15" code={slabParticle} />
        <p>
          <code>motion</code>, <code>state</code>, and <code>cold</code> all have the same row count and the same row
          identity. They can live in completely different memory. A source-level particle is the row that joins them,
          not a blob containing them.
        </p>
        <DataTable
          head={["Decision", "Object-first language", "Slab"]}
          rows={dataUnits}
          caption="Slab keeps one logical entity while splitting the units used for storage and compilation."
        />

        <H2>The loop tells you what deserves to be near</H2>
        <p>
          The integration loop borrows one band. It cannot accidentally pull the cold fields into the hot path because
          those fields are not part of the borrowed view.
        </p>
        <CodeBlock lang="text" title="integrate.slab" highlight="2-4" code={integrate} />
        <p>
          A reasonable CPU lowering can turn that band into columns. The exact chunk width belongs to the target, so the
          language does not promise whether the backend chooses pure structure-of-arrays or small array-of-structures
          chunks. The useful promise is narrower: unrelated bands do not have to share the trip through cache.
        </p>
        <CodeBlock lang="text" title="One possible physical layout" code={loweredMotion} />
        <p>
          This is the runtime version of the idea in <a href="/articles/the-page-is-the-work-unit">The page is the work unit</a>.
          The graph of logical relationships tells you what must eventually be visited; physical grouping decides what
          the processor can visit cheaply together. Slab makes that second grouping available before the garbage
          collector has to recover it from an already scattered heap.
        </p>
        <p>
          Some loops really do need two bands. The row identity gives the compiler a cheap zip because row 417 in{" "}
          <code>motion</code> and row 417 in <code>state</code> are the same particle.
        </p>
        <CodeBlock lang="text" title="energy.slab" highlight="4-8" code={zippedBands} />

        <H2>Most pointers should never become pointers</H2>
        <p>
          Once data lives in dense tables, handing out machine addresses as the default identity would throw away a lot
          of the benefit. It pins representation decisions early, makes compaction awkward, and turns every traversal
          back into pointer chasing.
        </p>
        <p>
          Slab distinguishes a scan cursor from a stable key. The cursor is just a row number during a traversal. Code
          pays for a stable reference only when the identity actually escapes.
        </p>
        <CodeBlock lang="text" title="identity.slab" highlight="1-3,6-8" code={cursorAndKey} />
        <CodeBlock lang="text" title="Conceptual lowering" code={keyLowering} />
        <p>
          That split matters because stable identity has costs. Reusable slots need generations or another validity
          check, and compacting rows needs a mapping from stable slots to current physical rows. A render loop that only
          walks every particle should not inherit that indirection because some editor panel wants to keep one particle
          selected for ten minutes.
        </p>
        <p>
          Regions make the other common lifetime cheap. Temporary tables can allocate their bands in large chunks and
          disappear together, with no per-particle destructor walk required by the language model.
        </p>
        <CodeBlock lang="text" title="frame.slab" highlight="1-2,4-14,17" code={regionAllocation} />

        <H2>The facts survived the redesign</H2>
        <p>
          Splitting storage does not mean giving up the relationship work from the earlier articles. Facts attach to row
          identities and band fields, not to their byte addresses. A packet can still state that a length agrees with a
          body while letting the backend store small headers apart from large payload handles.
        </p>
        <CodeBlock lang="text" title="packet.slab" highlight="7-8,11-12" code={packetBands} />
        <p>
          The checker can keep <code>Sized(p)</code> exactly as Rel did. Change the body and that fact is forgotten.
          Repack the <code>wire</code> band, move the bytes to another arena, or choose a different column layout and the
          fact does not care, because its meaning was never tied to an address.
        </p>
        <p>
          This is where the design starts doing two jobs at once. Relationships tell the checker which values depend on
          each other. Bands tell the runtime which fields should travel together. Neither one has to pretend to be the
          other.
        </p>

        <H2>A function already describes its compiler dependency</H2>
        <p>
          The same band borrow that helps memory also tells the compiler what an implementation can possibly observe.{" "}
          <code>integrate</code> reads velocity and writes position. It does not depend on the spelling, layout, or even
          existence of <code>Particle.cold</code> as long as the row identity contract stays compatible.
        </p>
        <CodeBlock lang="text" title="Compiler summary" code={bandSummary} />
        <p>
          Now add an editor note to the cold band. A module-granularity incremental compiler may decide the whole
          particle definition changed. Slab can use the smaller summary it already had to keep the motion code cached.
        </p>
        <CodeBlock lang="diff" title="A cold-field edit" code={schemaEdit} />
        <p>
          This is the compiler side of locality. The runtime asks, “which bytes must this loop touch?” The incremental
          compiler asks, “which declarations must this function reconsider?” A language that can answer the first
          question precisely has already collected much of the information needed for the second.
        </p>

        <H2>Generic code can specialize to a band, not a biography</H2>
        <p>
          Nominal types are useful for meaning, but they are a noisy code-generation key. Two unrelated tables can have
          the same physical band shape and the same permitted operations. Slab can write a generic over that smaller
          surface.
        </p>
        <CodeBlock lang="text" title="damp.slab" highlight="1-5,11-12" code={genericBand} />
        <p>
          The backend does not have to monomorphize <code>damp</code> once for every table name. It can key machine code
          on the band ABI, effects, and relationship assumptions the function actually uses.
        </p>
        <CodeBlock lang="text" title="A smaller specialization key" code={genericKey} />
        <p>
          This needs discipline. A fact used by the generic belongs in that key, and a representation-specific intrinsic
          belongs there too. The point is not “deduplicate every generic.” It is to stop a nominal name from forcing a
          new copy when the generated code has no way to observe that name.
        </p>

        <H2>Then write the compiler in the same language</H2>
        <p>
          A compiler is an unusually good victim for this model because compilers manufacture enormous temporary graphs
          and then run passes that each care about a narrow slice of those graphs. An expression node is usually drawn
          as one object. Slab would make it one row with several bands.
        </p>
        <CodeBlock lang="text" title="ir.slab" highlight="2-5,7-10,12-15" code={compilerIr} />
        <p>
          Type inference needs operators, edges, and the destination type slot. It does not need source spans until it
          has an error to report. The pass can say that directly.
        </p>
        <CodeBlock lang="text" title="infer.slab" highlight="2-4,6-8" code={typePass} />
        <p>
          A compact lowering can keep the hot compiler state in flat arrays while leaving source locations in a cold
          band. This is the same trick as the particle loop, except the thing trying to stay in cache is the type
          checker.
        </p>
        <CodeBlock lang="text" title="Compiler IR in memory" code={compilerLowering} />
        <p>
          The earlier <a href="/articles/a-compiler-made-of-resumable-lanes">resumable-lanes compiler</a> had to flatten
          its semantic state into fixed-width tables before a GPU could work on it. Slab makes that representation
          ordinary enough that a CPU compiler benefits first. A wide backend becomes an option later, because passes
          already see dense bands instead of pointer-linked trees.
        </p>

        <H2>Keep the solver as local as the cache</H2>
        <p>
          Richer relationships could easily destroy compile time if every function joined one global proof problem. I
          would keep the rule from <a href="/articles/make-the-type-checker-forget">Make the type checker forget</a>:
          a function checks inside a private island, exports a closed summary, and discards the local graph.
        </p>
        <CodeBlock lang="text" title="One Slab checking island" code={compileIsland} />
        <p>
          The cache key can stay similarly small. It names the source body and only the schemas and contracts that were
          imported while checking it.
        </p>
        <CodeBlock lang="text" title="Incremental cache key" code={cacheKey} />
        <p>
          Editing a cold particle field should therefore produce a tiny rebuild frontier if the rest of the program
          never imported that band. The compiler does not need heroic dependency analysis after the fact; the language
          already made the access boundary explicit enough to record it during checking.
        </p>
        <CodeBlock lang="text" title="After one schema edit" code={parallelFrontier} />
        <p>
          This also gives the scheduler cleaner parallel work. Closed functions whose imported summaries are ready can
          be checked together, then lowered together. That is the part that connects back to{" "}
          <a href="/articles/the-compiler-on-the-wide-machine">The compiler on the wide machine</a>: parallelism gets
          easier when the language leaves fewer hidden dependencies for the compiler to discover.
        </p>

        <H2>The awkward parts are where the language would be decided</H2>
        <p>
          Bands are easy when rows are dense and move together. Optional components are harder. A sparse band wants a
          presence bitmap or its own row map, which makes zipping two bands less trivial. Stable keys need generations.
          Concurrent mutation needs a rule for who may reorder a table while another task holds a scan cursor.
        </p>
        <p>
          Layout inference can also become its own slow compiler pass if the language asks a global optimizer to guess
          which fields belong together. I would keep bands explicit in source for the first implementation and let the
          backend choose only the representation inside each band. If programmers hate writing the bands, that is useful
          evidence; hiding the cost behind whole-program profiling would only make incremental compilation harder to
          reason about.
        </p>
        <p>
          The other open question is separate compilation. A library should be able to publish a logical table schema
          without freezing every physical choice for every target. My current guess is that public band boundaries are
          ABI-visible while chunk width, column encoding, bit packing, and region placement remain backend choices.
          Crossing a dynamic-library boundary may need a boring canonical layout, which is probably fine.
        </p>
        <p>
          What I like about the sketch is the place it ends up. The particle in source still feels like one particle.
          The hot loop sees six float columns. The debugger can ask for the cold name band later. The type checker keeps
          relationship facts over row identities, and the incremental compiler caches a function against the two fields
          it actually touched. No single representation has to carry all of those jobs at once.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
