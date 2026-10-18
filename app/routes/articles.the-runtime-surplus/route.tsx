import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, ChoiceOverload, CodeBlock, Divider, H2, Prose } from "../../components";

export const article = {
  title: "The runtime surplus",
  description:
    "WebAssembly has an engine surplus because runtimes can compete independently while useful contracts, packages, debugging, and deployment require ecosystem agreement.",
  published: "2026-07-11T17:41:00Z",
  author: "Mira Voss",
  tags: ["software", "web"],
  image: {
    src: "/images/articles/the-runtime-surplus-journal.webp",
    alt: "A traveler faces a shed crowded with engines beside a greenhouse and a water wheel.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const pluginContract = `
  package example:thumbnail@1.0.0;

  world thumbnailer {
    export resize: func(
      image: list<u8>,
      width: u32,
    ) -> result<list<u8>, string>;
  }
`;

const runtimes = [
  "Wasmtime",
  "Wasmer",
  "WasmEdge",
  "WAMR",
  "wazero",
  "wasmi",
  "Chicory",
  "GraalWasm",
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          You wanted a safe plugin system. The ecosystem asked whether you prefer Cranelift, LLVM, an
          interpreter, ahead-of-time compilation, just-in-time compilation, pure Go, pure Java, Rust,
          C++, edge, embedded, or universal.
        </p>
        <p>
          People joke that WebAssembly has more runtimes than users. It isn&apos;t literally true —
          browsers run enormous amounts of Wasm without asking anyone to install Wasmtime — but
          outside the browser the joke lands, because picking an engine has somehow become the first
          step of every tutorial.
        </p>
        <ChoiceOverload
          request="I need a safe plugin system."
          options={runtimes}
          caption="The user asked for plugins; onboarding answered with engine procurement."
        />

        <H2>Engines are the easy hard part</H2>
        <p>
          A community-maintained{" "}
          <a href="https://github.com/appcypher/awesome-wasm-runtimes">
            catalogue of WebAssembly runtimes
          </a>{" "}
          needs a contents page with more than thirty names, including projects already marked
          unmaintained. I lost most of an evening to that list once, comparing engines for a plugin I
          never got around to writing. The layer is attractive to build: one team can own parsing,
          validation, compilation, sandboxing, and host calls without asking anyone&apos;s permission,
          then publish a benchmark.
        </p>
        <p>
          Many of the differences are legitimate. <a href="https://wazero.io/">wazero</a>{" "}
          stays pure Go so it never touches CGO, <a href="https://chicory.dev/">Chicory</a>{" "}
          exists because some teams need everything on the JVM, and the{" "}
          <a href="https://github.com/bytecodealliance/wasm-micro-runtime">WebAssembly Micro Runtime</a>{" "}
          squeezes into embedded devices and edge boxes. Those projects answer host constraints —
          where the runtime has to live — rather than fighting over the same user.
        </p>
        <p>
          Here is the asymmetry, I think. A runtime team can compete on its own schedule, but stable
          interfaces, package conventions, debugger behavior, and portable host guarantees all require
          agreement, and agreement is slow. So the ecosystem produces engines faster than it produces
          the boring shared layer that would make the engines interchangeable.
        </p>

        <H2>The contract is the product</H2>
        <p>This is closer to what you actually wanted:</p>
        <CodeBlock lang="text" title="plugin.wit" highlight="3-8" code={pluginContract} />
        <p>
          The{" "}
          <a href="https://component-model.bytecodealliance.org/design/wit.html">
            WebAssembly Interface Type language
          </a>{" "}
          describes the contract and nothing else: the component says what it exports and what it
          needs, and the host decides how that contract gets run. Your plugin shouldn&apos;t care
          whether the engine beneath it was written in Rust, Go, Java, or regret.
        </p>
        <p>
          WASI is the same move applied to the environment. <a href="https://wasi.dev/roadmap">WASI 0.3</a>{" "}
          shipped on June 11, 2026 with native asynchronous functions, streams, and futures, and its
          roadmap currently lists support in Wasmtime 43 and later plus the JavaScript component tooling
          in <code>jco</code>. A month in, that is the list. The useful common surface matures more
          slowly than the engines beneath it — as far as I can tell, it always has.
        </p>
        <p>
          What you actually care about, as a plugin author, is whether files, clocks, streams, and
          errors mean the same thing everywhere, and whether the module can be tested, signed,
          debugged, and upgraded. Which code generator lowered your <code>i32.add</code> is the host
          operator&apos;s problem.
        </p>

        <Divider />

        <H2>Hide the engine</H2>
        <p>
          If you own a host, the constraints you already have will mostly pick the runtime for you — a
          Go binary wants wazero, a JVM application wants Chicory, a microcontroller wants WAMR, a
          component platform probably wants{" "}
          <a href="https://docs.wasmtime.dev/introduction.html">Wasmtime</a>. Then stop advertising
          the choice. Publish the capabilities, the resource limits, the upgrade policy, the contract
          your users can rely on.
        </p>
        <p>
          If you publish a component, publish its WIT world and what it is compatible with. If you
          write a tutorial, start with the useful plugin and leave the runtime matrix out — a reader
          who has to become a runtime historian before calling <code>resize</code> has already lost
          the portability the whole stack was promising.
        </p>
        <p>
          The browser people quietly solved this years ago. Chrome, Firefox, and Safari run Wasm
          through entirely different engines, and nobody opening a tab knows or cares which one they
          got. I would like the server side to feel like that. The last plugin tutorial I read spent
          its first three paragraphs comparing engines, and the <code>resize</code> function — the
          part I came for — sat below the fold.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
