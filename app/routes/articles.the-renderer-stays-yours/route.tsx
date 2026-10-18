import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, DataTable, H2, Prose } from "../../components";

export const article = {
  title: "The renderer stays yours",
  description:
    "Spirdo stops at compiled shader bytes and reflection, leaving pipeline creation, frame scheduling, and draw calls to the host renderer.",
  published: "2026-07-15T01:00:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-renderer-stays-yours-journal.webp",
    alt: "A fox directs a miniature theater beside a glass sphere containing a geometric wire frame.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const rendererHandoff = `
  vertexCounts <- requireShaderCounts
    "vertex shader" 1 gameVertexShader
  vertex <- createVertexShader
    (shaderSpirv gameVertexShader) vertexCounts

  fragmentCounts <- requireShaderCounts
    "fragment shader" 3 gameFragmentShader
  fragment <- createFragmentShader
    (shaderSpirv gameFragmentShader) fragmentCounts

  pipeline <- graphicsPipeline
    GraphicsDesc
      { gfxVertex = vertex
      , gfxFragment = fragment
      , gfxLayout = mesh3DLayout
      , gfxPrimitive = PrimTriangles
      , gfxTarget = TargetSwapchain
      , gfxDepth = DepthTestWrite
      }
`;

const typedInputs = `
  frameInputs =
    inputsFor tintShader
      ( uniform @"params"
          (Params (V4 1.0 0.45 0.2 1.0))
        <> sampledTexture @"tex"
          (TextureHandle 42)
          (SamplerHandle 7)
      )
`;

const ownershipRows = [
  ["Parse, type-check, and link WESL/WGSL", "Spirdo", "Successful shader compilation"],
  ["Emit SPIR-V and reflect bindings", "Spirdo", <code key="bundle">shaderSpirv / shaderPlan</code>],
  ["Translate reflected slots to renderer descriptors", "Adapter", <code key="counts">requireShaderCounts</code>],
  ["Create pipeline, meshes, and targets", "Slop", <code key="pipeline">graphicsPipeline</code>],
  ["Schedule frames and issue draws", "Slop", <code key="draw">drawModel</code>],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          Graphics libraries annex programs. You adopt one for a narrow job — loading a mesh, compiling a shader
          — and a year later your frame loop runs inside its scheduler and your types are its types. So here is
          what won me over in Spirdo&apos;s maintained example game — a function that does not exist:
          there is no Spirdo draw call anywhere in Crystal Run.
        </p>
        <p>
          At commit{" "}
          <a href="https://github.com/mewhhaha/spirdo/tree/8bfd82daa7aad879a9a17cbb465c28cf89c3e1c4">
            <code>8bfd82d</code>
          </a>, the library&apos;s product boundary is compiled SPIR-V plus reflected shader metadata. The window,
          the meshes, the pipeline, the frame loop, and every <code>drawModel</code> call belong to Slop, the
          host renderer. You can test the scope by imagining Slop deleted: shader compilation would survive
          untouched, and nothing would draw.
        </p>

        <DataTable
          head={["Work", "Owner", "Boundary artifact"]}
          rows={ownershipRows}
          caption="Crystal Run crosses from Spirdo into a small Slop adapter before pipeline creation."
        />

        <H2>The handoff is executable</H2>
        <p>
          Crystal Run&apos;s setup asks each typed shader for its SPIR-V bytes and its binding plan, a local
          adapter translates the plan into Slop&apos;s slot counts, and Slop builds the shader objects and the
          graphics pipeline from there.
        </p>
        <CodeBlock
          lang="haskell"
          title="examples/game/Game.hs (abridged)"
          highlight="1-9,11-19"
          code={rendererHandoff}
        />
        <p>
          The adapter is deliberately strict. <code>requireShaderCounts</code> rejects any descriptor group or
          resource class the Slop integration cannot actually submit, and that refusal matters: without it,
          renderer independence decays into a byte array plus an undocumented promise about which slot means
          “texture.”
        </p>
        <p>
          Spirdo&apos;s{" "}
          <a href="https://github.com/mewhhaha/spirdo/blob/8bfd82daa7aad879a9a17cbb465c28cf89c3e1c4/docs/architecture.md">
            architecture document
          </a>{" "}
          draws the same line the example does: parsing, imports, type checking, reflection, and SPIR-V emission
          end in a shader bundle, and pipeline policy begins in the host. After setup, the frame step clears the
          target and calls <code>drawModel</code> for the ground, pillars, crystals, and ship. Spirdo never
          reappears in the loop, because by then its outputs are ordinary renderer inputs.
        </p>

        <H2>Names cross with the bytes</H2>
        <p>
          What does cross the boundary, besides bytes? Names and types. The reflected interface rides in the type
          of an opaque <code>Shader</code>, so host code provides values by source name and resource kind, and{" "}
          <code>inputsFor</code> checks completeness, packs the uniform layout, and normalizes everything into
          binding order.
        </p>
        <CodeBlock lang="haskell" title="FrameInputs.hs" highlight="2-9" code={typedInputs} />
        <p>
          In this builder, <code>uniform @&quot;params&quot;</code> compiles only when the shader interface
          actually contains a uniform called <code>params</code>, and <code>sampledTexture @&quot;tex&quot;</code>{" "}
          carries the texture and sampler handles the renderer will recognize. Spirdo checks the shader-facing
          contract and never allocates a renderer object itself.
        </p>
        <p>
          Reflection cannot pick the host&apos;s descriptor convention, and the example is honest about that.
          Crystal Run passes group one for vertex uniforms and group three for fragment uniforms because
          SDL_gpu&apos;s SPIR-V ABI assigns those locations, and the adapter owns the translation out loud. The
          backend&apos;s numbering rule stays out of the shader source, and Spirdo stops short of pretending
          every renderer shares one layout.
        </p>
        <p>
          The narrowness is a real trade. A project with no renderer still owes itself buffers, passes,
          synchronization, presentation, and device policy, and Spirdo will bring none of them. Whether the
          boundary holds beyond the pinned examples I can&apos;t say — the adapters that would prove portability
          have not been written.
        </p>
        <p>
          The boundary even shows up as an error string. Feed the SDL adapter a shader with a storage buffer and
          it answers <code>renderer does not submit storage-buffer bindings</code> — Spirdo got the name right,
          and the renderer has not yet learned to carry the thing.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
