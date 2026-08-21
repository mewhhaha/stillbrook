import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "The engine stays home",
  description:
    "Porffor points toward JavaScript at the edge by compiling each program ahead of time into Wasm while leaving the engine, parser, and optimization work at build time.",
  published: "2026-07-12T23:06:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-engine-stays-home.jpg",
    alt: "A restored green-and-steel horizontal mill engine with a tall flywheel, standing in a museum engine house under a wooden roof.",
    credit: {
      author: "Daderot",
      license: "CC0",
      href: "https://commons.wikimedia.org/wiki/File:150_HP_horizontal_mill_engine,_Fitchburg_Steam_Engine_Co.,_Fitchburg,_MA,_c._1900_-_Stationary_steam_engine_collection_-_New_England_Wireless_%26_Steam_Museum_-_East_Greenwich,_RI_-_DSC06582.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const policySource = `
  export function chooseOrigin(plan, risk) {
    if (risk >= 80) return 2;
    if (plan === 0) return 1;
    return 0;
  }
`;

const workerAdapter = `
  import policyModule from "./policy.wasm";

  const imports = {
    "": {
      // Porffor's stable edge host contract belongs here.
    },
  };

  const policy = await WebAssembly.instantiate(
    policyModule,
    imports,
  );
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          I put the <a href="https://porffor.dev/">Porffor homepage</a> beside Cloudflare&apos;s{" "}
          <a href="https://developers.cloudflare.com/workers/runtime-apis/webassembly/">
            WebAssembly guide
          </a>{" "}
          and felt the pieces line up. The Workers documentation warns that compiling a language to Wasm
          often drags its runtime along, making the module larger and slower to start. Porffor begins with no
          interpreter or JIT and no fixed prelude shipped with every program.
        </p>
        <p>
          That is why I am excited. Porffor compiles one JavaScript or TypeScript program ahead of time, emits
          the Wasm itself, and leaves the language engine on the developer&apos;s machine. An edge host receives a
          specialized module instead of a small application strapped to a general-purpose JavaScript engine.
        </p>
        <p>
          The project calls itself experimental and warns people away from serious use. Good. Its gaps show
          where the architecture ends and the product work begins.
        </p>

        <H2>Pay for JavaScript once</H2>
        <p>
          The common way to run JavaScript inside Wasm is to compile an interpreter, place the source or
          bytecode beside it, and let that interpreter do the real work after deployment. Compatibility comes
          from carrying the machine that understands the language. Every tenant gets a copy of the same fixed
          machinery before their own code contributes a useful instruction.
        </p>
        <p>
          Porffor takes the expensive route during development. Its{" "}
          <a href="https://github.com/CanadaHonk/porffor/blob/a801f8c657cae5fcbc5fac388338e9e40b54b871/README.md#design">
            design notes
          </a>{" "}
          describe a from-scratch AOT compiler that writes final Wasm binaries without Binaryen and ships no
          constant runtime or prelude. Acorn supplies the parser. Porffor owns the value model, code generation,
          optimizer, built-ins, and binary assembly, aimed at exactly the fixed cost an edge platform wants to
          remove.
        </p>
        <Compare
          attributes={["Artifact", "Startup work", "Compatibility cost", "Host boundary"]}
          entities={[
            {
              name: "Engine in Wasm",
              values: [
                "Interpreter or runtime plus source or bytecode",
                "Start the engine, then load the program",
                "Broad semantics arrive with the embedded engine",
                "The interpreter's embedding API",
              ],
            },
            {
              name: "Porffor AOT",
              values: [
                "Specialized module with no fixed prelude",
                "Instantiate the finished program",
                "The compiler must implement every supported semantic",
                "Explicit imports and Porffor's value ABI",
              ],
            },
          ]}
          caption="The AOT column removes the fixed interpreter from the deployed artifact and moves compatibility work into the compiler."
        />

        <H2>A small policy at every edge</H2>
        <p>
          I started with the kind of function an edge service actually repeats all day: choose an origin from a
          subscription plan and a risk score. It has no filesystem, network, event loop, or package graph. It
          has three returns.
        </p>
        <CodeBlock lang="js" title="policy.js" highlight="2-4" code={policySource} />
        <p>
          The build command is already pleasantly literal: <code>porf wasm policy.js policy.wasm</code>. A
          JavaScript Worker can receive the request, read configuration, and pass two numbers to the compiled
          policy. The host keeps its network and storage capabilities, while Wasm runs the tenant-defined
          decision behind linear memory and an explicit import boundary.
        </p>
        <p>
          Cloudflare&apos;s{" "}
          <a href="https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/">
            JavaScript integration guide
          </a>{" "}
          already supports importing a <code>.wasm</code> module and instantiating it once in module scope, before
          requests arrive. Workers also gives startup a{" "}
          <a href="https://developers.cloudflare.com/workers/platform/limits/#worker-startup-time">
            one-second ceiling
          </a>{". "}
          Module size and initialization become operational concerns there. Why are we shipping a whole
          language engine to evaluate two comparisons?
        </p>

        <H2>The import object is the project</H2>
        <p>
          The attractive diagram ends at the boundary between the Wasm module and its host. I sketched the
          Worker side and reached the empty object immediately:
        </p>
        <CodeBlock lang="ts" title="worker-adapter.ts" highlight="3-7,9-12" code={workerAdapter} />
        <p>
          Porffor&apos;s current{" "}
          <a href="https://github.com/CanadaHonk/porffor/blob/a801f8c657cae5fcbc5fac388338e9e40b54b871/compiler/wrap.js#L503-L572">
            JavaScript wrapper
          </a>{" "}
          fills that namespace with printing and clock functions, instantiates the module, then decodes tagged
          values from linear memory into JavaScript values. That private bridge serves the CLI and playground.
          An edge adapter needs a stable version, plus error mapping, memory ownership, cancellation, and narrow
          host capabilities.
        </p>
        <Callout variant="caution" title="The module does not drop into Workers yet">
          <p>
            Porffor&apos;s README says its standalone Wasm output currently uses no import standard such as WASI
            and is mostly unusable on its own. Promise and <code>await</code> support still has known bugs, and
            variables cannot generally cross scopes except through arguments or globals. I have not deployed a
            Porffor module inside Workers; the project&apos;s own documentation says the clean path is still missing.
          </p>
        </Callout>
        <p>
          The absence of <code>eval</code> and <code>Function</code> bothers me less. AOT compilation has to reject
          source code that appears after compilation, and an edge policy language benefits from refusing that
          capability. Async and the host ABI block the useful subset today. Dynamic evaluation merely marks the
          boundary of the bet.
        </p>

        <H2>Start with kernels</H2>
        <p>
          Full Worker compatibility would require Porffor or an adapter to expose Fetch, streams, storage
          bindings, timers, and a large async surface before anyone could use the first module. A smaller target
          keeps those APIs in the host and compiles synchronous kernels: routing rules, validation, feature
          decisions, or tenant scoring. JavaScript remains the authoring language, while the deployment artifact
          behaves like a capability-limited plugin.
        </p>
        <p>
          Porffor is already probing adjacent deployments. Its repository contains an experimental{" "}
          <a href="https://github.com/CanadaHonk/porffor/blob/a801f8c657cae5fcbc5fac388338e9e40b54b871/runtime/lambda.js">
            Lambda path
          </a>{" "}
          that lowers JavaScript through C into a native bootstrap. The{" "}
          <a href="https://github.com/CanadaHonk/porffor/blob/a801f8c657cae5fcbc5fac388338e9e40b54b871/index.html">
            browser playground
          </a>{" "}
          imports the compiler, emits Wasm after an edit, instantiates it, and calls the result; the same
          build-first idea is visible there even though the host contract remains private.
        </p>
        <p>
          In my notes, <code>worker-adapter.ts</code> still ends at the empty import object. The policy function
          has three returns. The adapter owes a value contract, error mapping, memory rules, and a capability
          story. I keep the file because the remaining work has an address now: the seam between a tiny Wasm
          program and the edge host.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
