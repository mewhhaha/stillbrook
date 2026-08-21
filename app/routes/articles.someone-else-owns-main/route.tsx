import { articleMeta, type ArticleMeta } from "../../article";
import { AnnotatedCode, ArticleLayout, CodeBlock, DataTable, FlowSequence, H2, Prose } from "../../components";

export const article = {
  title: "Someone else owns main",
  description:
    "Roc applications hand main! to a platform that owns startup, effects, allocation, and exit — a tenancy agreement written in checked syntax.",
  published: "2026-07-13T09:44:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/someone-else-owns-main.jpg",
    alt: "The inside of an old railway signal box, with rows of red, blue, black, and brown control levers in front of telephones and green cabinets.",
    credit: {
      author: "Malcolm Morley",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:Signal_box_inside.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const rocApp = `
  app [main!] { pf: platform "./echo-platform/main.roc" }

  import pf.Echo

  main! = |_args| {
      Echo.line!("Hello from Roc")
      Ok({})
  }
`;

const rocPlatform = `
  platform ""
      requires {} { main! : List(Str) => Try(_, [Exit(I8), ..]) }
      exposes [Echo]
      packages {}
      provides { "roc_main": main_for_host! }
      hosted { "roc_echo_line": Echo.line! }
`;

const ownershipRows = [
  ["Application", "Choose one platform; provide main!", "Domain logic and values permitted by that platform"],
  ["Platform module", "Require main!; expose Echo; adapt main! to roc_main", "The typed contract between Roc code and its host"],
  ["Zig host", "Own the OS entrypoint; allocate the runtime; run Roc", "Process arguments, diagnostics, hosted functions, and exit code"],
] as const;

const hostSequence = [
  {
    label: "Promise",
    title: "The application supplies main!",
    detail: "Its type is the requirement declared by the chosen platform.",
  },
  {
    label: "Adapt",
    title: "The platform exports roc_main",
    detail: "main_for_host! converts the application's Try result into an I8 exit code.",
  },
  {
    label: "Start",
    title: "The Zig process enters first",
    detail: "It reads arguments, installs diagnostics, and allocates the runtime arena.",
  },
  {
    label: "Dispatch",
    title: "The host invokes Roc",
    detail: "The runner registers Echo.line! and executes the compiled entrypoint.",
  },
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          A Roc program opens with a small act of submission. The first line picks a platform, and that choice
          dictates everything after it: what the application must provide, what it may import, which effects exist
          at all. The <code>main!</code> in the echo example below is not an entrypoint — it is a value the
          application hands over, typed to someone else&apos;s specification.
        </p>
        <CodeBlock lang="text" title="main.roc" highlight="1,3,5-8" code={rocApp} />
        <p>
          I think this is the most honest move in recent language design. Your program was always a guest — libc
          called your <code>main</code>, the JVM owned your threads, the browser owned your loop — and Roc simply
          writes the tenancy agreement in syntax the compiler checks. Even the <code>Ok({"{}"})</code> at the
          bottom is dictated from outside, since the platform demands a <code>Try</code> and its adapter decides
          what your success turns into.
        </p>

        <H2>The two headers meet at a type</H2>
        <p>
          Here is the landlord&apos;s side, from Roc&apos;s{" "}
          <a href="https://github.com/roc-lang/roc/blob/a06fe3fc58fc57037b811cf90e5dbfca7bb1a50f/src/echo_platform/platform/main.roc">
            echo platform at commit a06fe3f
          </a>
          . Six declarations, and none of them is build configuration — this is a division of power.
        </p>
        <AnnotatedCode
          lang="text"
          title="echo-platform/main.roc"
          code={rocPlatform}
          notes={[
            { line: 2, note: <>The application&apos;s debt: a <code>main!</code> that takes the argument list and returns a <code>Try</code> carrying an exit effect.</> },
            { line: 3, note: <>The application&apos;s entire visible world — nothing outside this list can be imported.</> },
            { line: 5, note: <>The adapted entrypoint, sent back across the boundary under the symbol <code>roc_main</code>.</> },
            { line: 6, note: <><code>Echo.line!</code> resolves to a function the host implements in Zig.</> },
          ]}
        />
        <p>
          Want to write a file from this application? You can&apos;t. No hosted symbol, no effect; the import
          does not exist to be written.
        </p>
        <DataTable
          head={["Owner", "Contract", "What stays inside"]}
          rows={ownershipRows}
          caption="The application, platform, and host each own a different boundary in the echo example."
        />
        <p>
          The adapter under that header also settles what your program&apos;s result means as process behavior:
          success becomes exit code zero, an explicit <code>Exit(code)</code> passes through, and other failures
          get printed before one is returned. A framework calls your callback after a conventional{" "}
          <code>main()</code> and hopes you behave — Roc puts the same split behind a checked interface.
        </p>

        <H2>The host has the actual keys</H2>
        <p>
          The other side of the contract is ordinary Zig, and the same commit lets you read it. The{" "}
          <a href="https://github.com/roc-lang/roc/blob/a06fe3fc58fc57037b811cf90e5dbfca7bb1a50f/src/echo_platform/echo_native.zig">
            native entrypoint
          </a>{" "}
          reads process arguments, sets up a 128 MiB fixed-buffer allocator, installs diagnostics, and calls into
          the{" "}
          <a href="https://github.com/roc-lang/roc/blob/a06fe3fc58fc57037b811cf90e5dbfca7bb1a50f/src/echo_platform/runner.zig">
            shared runner
          </a>
          , which registers <code>Echo.line!</code> and finally runs the compiled Roc code.
        </p>
        <FlowSequence
          steps={hostSequence}
          caption="Control crosses the application/platform contract before the host executes the Roc entrypoint."
        />
        <p>
          You can imagine where this goes — a browser host with its own scheduling, a server host whose allocator
          lives and dies with a request — though the echo example proves none of that, and I would not promise it
          on one pinned commit. What the source does establish is narrower: the host owns the process and its
          resources, and the application receives exactly the capabilities its platform wrote down.
        </p>

        <H2>A checked boundary can still become a kingdom</H2>
        <p>
          Now the uncomfortable part. Selecting a platform concentrates power in it: its API determines every
          available effect, its adapter defines process behavior, and its host joins your trusted computing base.
          Since two platforms need not even expose the same application type, replacing one is closer to changing
          frameworks than to swapping a library — the checking that makes the boundary safe also raises the cost
          of crossing to a different one.
        </p>
        <p>
          Whether a mature platform ecosystem makes that price tolerable is a question the echo example cannot
          answer. It does show precisely where the bill accumulates, down to the last line of the native
          entrypoint: Zig takes the code the runner returned and calls <code>std.process.exit(code)</code>. By
          then your function is long gone.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
