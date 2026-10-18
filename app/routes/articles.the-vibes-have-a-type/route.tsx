import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "Typed shaders, visible Vulkan",
  description:
    "vpipe’s typed triangle carries shader intent down to SPIR-V, and its particle example shows exactly where Vulkan still pokes through.",
  published: "2026-07-15T00:44:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-vibes-have-a-type-journal.webp",
    alt: "A craftsperson adjusts a triangular brass frame beneath a prism casting a rainbow beside a curved line on glass.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const trianglePipeline = `
  pipeline :: PipelineM Environment ()
  pipeline = do
    input <- vertexInput
      (vertexSource "positions" positions
        :: VertexSource Environment 'Triangles (V3 Float))
    fragments <- rasterize defaultRaster (fmap vertex input)
    drawColor defaultBlend
      (colorTarget "color" target
        :: ColorTarget Environment 'B8G8R8A8Srgb)
      (fmap unSmooth fragments)
   where
    vertex position =
      (vec4 (x position) (y position) (z position) (constant 1),
       Smooth (constant (V4 1 0 0 1) :: V (V4 Float)))
`;

const typedFacts = [
  [<code key="source">VertexSource Environment &apos;Triangles (V3 Float)</code>, "Triangle topology and three-float vertex input"],
  [<code key="target">ColorTarget Environment &apos;B8G8R8A8Srgb</code>, "Render-target format fixed in the environment"],
  [<code key="smooth">Smooth (V (V4 Float))</code>, "Perspective-correct interpolation for the color varying"],
  [<code key="pipeline">PipelineM Environment ()</code>, "A reusable pipeline waiting for concrete resources"],
] as const;

const sharedBufferAndFrame = `
  positions <- newBuffer context particleCount
    :: IO (Buffer '[Storage, Vertex] (V4 Float))

  let environment = ParticleEnvironment
        { particleStorage = storageBufferBinding positions
        , particleVertices = vertexBufferBinding positions
        , particleTarget = target
        }

  computePassFor preparedCompute environment
    (toInteger particleCount, 1, 1)
  renderTo target (render preparedGraphics environment)
`;

const maintenance5Setup = `
  enableMaintenance5 config =
    config
      { extraDeviceExtensions =
          KHR_MAINTENANCE_5_EXTENSION_NAME : extraDeviceExtensions config
      , vpipeLogicalDeviceBuilder = maintenance5DeviceBuilder
      }

  enabledMaintenance5 =
    (zero :: PhysicalDeviceMaintenance5FeaturesKHR)
      { maintenance5 = True }
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Try to find the shader in this triangle. There is no GLSL file anywhere in the example — the vertex
          transform is the ordinary Haskell function at the bottom of the block, and the things Vulkan will
          eventually demand (topology, vertex shape, interpolation, target format) live in the types wrapped
          around it.
        </p>
        <CodeBlock
          lang="haskell"
          title="examples/app/triangle/Main.hs (abridged)"
          highlight="1-9,11-14"
          code={trianglePipeline}
        />
        <p>
          At commit{" "}
          <a href="https://github.com/mewhhaha/vpipe/tree/22abaa741ebad6dd7f01054468d39e5f81639814">
            <code>22abaa7</code>
          </a>
          , <code>compilePipeline</code> lowers this description straight to SPIR-V. The pretty syntax works only
          because the public types hold on to enough Vulkan intent for pipeline creation and validation to happen
          later, and it is worth spelling out what they carry.
        </p>
        <DataTable
          head={["Typed declaration", "Information preserved"]}
          rows={typedFacts}
          caption="The small triangle pipeline exposes the facts needed below the Haskell surface."
        />
        <p>
          Each parameter closes off a familiar mismatch before any Vulkan object exists. Topology travels with the
          vertex source, the varying records its own interpolation mode, and the color expression has to fit the
          target&apos;s format. Resources are fields of the environment — no string lookups at frame-record time,
          which is exactly when you least want a typo discovered.
        </p>
        <p>
          Compilation still produces an artifact for a lower layer: SPIR-V plus the resource and stage information
          the runtime uses to build Vulkan objects. The types preserve intent through that handoff without
          creating a device or picking its queues.
        </p>

        <H2>One allocation crosses two passes</H2>
        <p>
          The particle example is where the resource story gets good. One buffer declares both{" "}
          <code>Storage</code> and <code>Vertex</code> roles, the environment takes two typed views of it, and an
          ordered frame writes through one view before rendering through the other.
        </p>
        <CodeBlock
          lang="haskell"
          title="examples/src/Vpipe/Examples/Particles.hs (abridged)"
          highlight="1-7,9-12"
          code={sharedBufferAndFrame}
        />
        <p>
          The frame tracker sees a compute write followed by a graphics vertex read and emits the required
          transition itself. Anyone who has hand-written buffer barriers knows how many ways there are to get that
          wrong; here the barrier is a consequence, derived from program order and the buffer&apos;s role list. No
          second position buffer, no host-side copy between the passes.
        </p>
        <p>
          The role list earns its keep elsewhere too. <code>Buffer &apos;[Storage, Vertex] (V4 Float)</code>{" "}
          rejects an accidental use as an index buffer, and the element type keeps the compute writer and the
          vertex reader on one representation, so the tracker reasons about a single allocation changing use
          rather than two handles that happen to alias.
        </p>
        <p>
          One caveat before the enthusiasm runs away: everything above comes from reading the source. No benchmark
          or physical-GPU run backs this article, and a heavier workload may want resource scheduling that the
          ordered-frame model does not offer.
        </p>

        <H2>Device policy still reaches the surface</H2>
        <p>
          Typed streams cannot conjure a capability the shader language does not express. The particle pipeline
          renders points, <code>PointSize</code> is missing from the current EDSL, and so the example requests{" "}
          <code>VK_KHR_maintenance5</code> — an entire device extension enlisted so that a point may legally be
          one pixel wide without a shader output saying so.
        </p>
        <CodeBlock
          lang="haskell"
          title="examples/src/Vpipe/Examples/Particles.hs (abridged)"
          highlight="1-6,8-11"
          code={maintenance5Setup}
        />
        <p>
          I like that the library is honest here. vpipe names buffer roles, formats, shader stages, pass order,
          and most synchronization consequences, and when an application needs a feature outside that surface, it
          hands over a logical-device builder instead of pretending the need away.
        </p>
        <p>
          The builder is plain Vulkan policy written in Haskell: it adds the extension name, enables the feature
          structure, carries the 1.2 timeline-semaphore and 1.3 synchronization feature chains, and creates queue
          records from the selected device&apos;s family union — below the typed shader description, still inside
          your application.
        </p>
        <p>
          The pretty frame ends after <code>renderTo</code>. Scroll further down the same source file and the
          feature chains and queue records are all still there, under a function frankly named{" "}
          <code>maintenance5DeviceBuilder</code> — a better boundary marker than one more claim that Vulkan has
          been abstracted away.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
