import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, Compare, H2, Prose } from "../../components";

export const article = {
  title: "Warnings are build policy",
  description:
    "Cargo 1.97 can deny warnings for local packages without smuggling CI policy through RUSTFLAGS into every rustc invocation.",
  published: "2026-08-10T06:14:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/3/33/Lighting_control_panel.JPG",
    alt: "An open outdoor-lighting control panel shows breakers, relays, terminal blocks, and neatly routed wiring inside a metal enclosure.",
    credit: {
      author: "Dmitry G",
      license: "CC BY-SA 3.0",
      href: "https://commons.wikimedia.org/wiki/File:Lighting_control_panel.JPG",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const ciBefore = `
  env:
    RUSTFLAGS: -D warnings

  steps:
    - run: cargo test --workspace
`;

const ciAfter = `
  env:
    CARGO_BUILD_WARNINGS: deny

  steps:
    - run: cargo test --workspace
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          A Rust CI job that refuses warnings has had a wonderfully blunt spell available for years:{" "}
          <code>RUSTFLAGS=&quot;-D warnings&quot;</code>. It works, which is why you keep seeing it. The odd part is what the
          command says underneath: take a repository policy about diagnostics and inject a raw compiler argument into
          the environment.
        </p>
        <p>
          Cargo 1.97 finally gives that policy a name of its own. Set <code>build.warnings = &quot;deny&quot;</code> in Cargo
          configuration, or <code>CARGO_BUILD_WARNINGS=deny</code> in CI, and Cargo raises adjustable warnings to
          errors for local packages. That sounds like a small convenience. I think the important bit is that Cargo
          now knows whose warnings you meant.
        </p>
        <CodeBlock lang="yaml" title="CI before Cargo 1.97" code={ciBefore} highlight="2-3" />
        <p>
          The old spelling asks <code>rustc</code> for strictness. Cargo&apos;s own documentation says
          <a href="https://doc.rust-lang.org/cargo/reference/config.html#buildrustflags"> <code>RUSTFLAGS</code> is
          passed to every compiler invocation</a> when you are building for the host without an explicit target,
          including build scripts and proc macros. Cargo even warns that these low-level flags can conflict with
          settings it manages itself. A warning policy should not need that escape hatch.
        </p>

        <H2>A compiler flag cannot see ownership</H2>
        <p>
          The distinction Cargo can make is mundane and useful. Its new
          <a href="https://doc.rust-lang.org/cargo/reference/config.html#buildwarnings"> <code>build.warnings</code>{" "}
          setting</a> changes lint warnings for local packages. Registry dependencies do not suddenly become your
          cleanup project, and non-lint diagnostics stay whatever they were. If several local crates warn, Cargo&apos;s
          docs point to <code>--keep-going</code> when you want the run to expose more than the first failing crate.
        </p>
        <p>
          That ownership boundary already exists elsewhere in Cargo. The manifest documentation explains that lint
          settings on a package apply to that package, while Cargo suppresses ordinary lints from non-path
          dependencies with mechanisms such as <code>--cap-lints</code>. Build-script warnings follow a similar local
          bias: Cargo normally displays <code>cargo::warning</code> output for path dependencies you are actively
          working on and hides dependency noise unless you ask for very verbose output.
        </p>
        <p>
          <code>RUSTFLAGS</code> cannot express any of that intent because it is an opaque string delivered below the
          package graph. Cargo&apos;s{" "}
          <a href="https://doc.rust-lang.org/cargo/reference/build-cache.html">build-cache documentation</a> points out
          that the variable is shared with every <code>rustc</code> invocation in the ordinary host build. I have not
          measured how much needless recompilation a CI-only <code>-D warnings</code> causes across real caches, and I
          would not pretend the cost is always large. The stranger part is simpler: Cargo has to carry a policy flag
          through compilers that cannot decide whether the crate in front of them belongs to you.
        </p>
        <p>
          This problem has been sitting in public for a while. A 2017{" "}
          <a href="https://github.com/rust-lang/cargo/issues/3591">Cargo issue about warning control</a> shows people
          reaching for <code>RUSTFLAGS</code> to quiet development warnings and, in the other direction, asking for a
          clean way to turn warnings into CI errors without making dependencies part of the bargain. That workaround
          stayed in circulation for nine years before Cargo got a first-class build setting.
        </p>

        <H2>There are three different decisions here</H2>
        <p>
          Rust projects already gained a first-class <code>[lints]</code> table in manifests. That solves a different
          problem. If <code>unsafe_code = &quot;forbid&quot;</code> is part of the package&apos;s contract, putting it in{" "}
          <code>Cargo.toml</code> makes sense because developers, CI, and downstream builds should all see the same
          choice. “CI fails on any warning” is often an environment rule instead: useful at the gate, irritating while
          you are halfway through a refactor.
        </p>
        <Compare
          attributes={["Lives in", "Controls", "Scope", "Good fit"]}
          entities={[
            {
              name: "[lints]",
              values: [
                "Cargo.toml",
                "Named rustc and Clippy lint levels",
                "The package that declares or inherits them",
                "Source policy that should travel with the crate",
              ],
            },
            {
              name: "build.warnings",
              values: [
                ".cargo/config.toml or CARGO_BUILD_WARNINGS",
                "The effective level of adjustable warnings",
                "Local packages in this build",
                "Environment policy such as a warning-free CI gate",
              ],
            },
            {
              name: "RUSTFLAGS",
              values: [
                "Environment or Cargo config",
                "Raw rustc command-line flags",
                "Compiler invocations selected by Cargo's target mode",
                "Low-level compiler options with no first-class Cargo setting",
              ],
            },
          ]}
          caption="The mechanisms answer different questions, and Cargo 1.97 added one specifically for build-wide warning strictness."
        />
        <p>
          The new setting is deliberately coarse. It offers <code>warn</code>, <code>allow</code>, or <code>deny</code>{" "}
          for warnings as a class, leaving named lint policy to the manifest. I like the boundary. Cargo can enforce
          the build&apos;s tolerance while source files and <code>[lints]</code> keep describing which diagnostics are
          meaningful in the first place.
        </p>
        <p>
          Cargo&apos;s own{" "}
          <a href="https://doc.rust-lang.org/nightly/cargo/CHANGELOG.html#cargo-197-2026-07-09">1.97 changelog</a>{" "}
          describes <code>build.warnings</code> as useful for enforcing a warning-free CI build and explicitly calls it
          a replacement for <code>-Dwarnings</code>. The feature became stable on July 9, 2026. Cargo&apos;s config
          reference marks 1.97 as the minimum version for this setting, so repositories supporting older Cargo cannot
          rely on it yet.
        </p>
        <CodeBlock lang="yaml" title="CI with Cargo 1.97" code={ciAfter} highlight="2-3" />
        <p>
          The resulting diff is almost comically small. One environment variable disappears and another takes its
          place. The useful change is the label on the wire: <code>CARGO_BUILD_WARNINGS=deny</code> reaches Cargo as
          build policy, and Cargo can apply it only to the packages the build actually owns.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
