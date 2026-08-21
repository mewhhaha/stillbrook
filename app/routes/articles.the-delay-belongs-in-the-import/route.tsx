import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, CodeBlock, H2, MemoryBoxes, Prose } from "../../components";

export const article = {
  title: "The delay belongs in the import",
  description:
    "Python 3.15's explicit lazy imports make deferred module loading visible at the line that moves work, side effects, and failures to first use.",
  published: "2026-08-16T06:45:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Electrical_Relays.jpg/1280px-Electrical_Relays.jpg",
    alt: "Several electrical relays are mounted side by side on a rail, with their terminals and labels visible.",
    credit: {
      author: "Tomas Castelazo",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Electrical_Relays.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const lazyImport = `
  import sys

  lazy import json

  print("json" in sys.modules)  # False
  payload = json.dumps({"ready": True})
  print("json" in sys.modules)  # True
`;

const beforeFirstUse = [
  {
    id: "globals",
    label: "module globals",
    fields: [
      { name: "json", pointsTo: "proxy" },
      { name: "sys", value: "module" },
    ],
  },
  {
    id: "proxy",
    label: "LazyImportType",
    fields: [
      { name: "target", value: "json" },
      { name: "state", value: "unresolved" },
    ],
  },
  {
    id: "modules",
    label: "sys.modules",
    fields: [{ name: "json", value: "absent" }],
  },
] as const;

const cliImports = `
  import argparse

  lazy from .report import build_report
  lazy from .serve import run_server

  parser = argparse.ArgumentParser()
  parser.add_argument("command", choices=["report", "serve"])
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="5 min read">
      <Prose>
        <p>
          In 2022 Python had a lazy-import proposal that tried hard to hide the laziness. Start the interpreter with a
          flag, keep writing ordinary imports, and let the runtime defer top-level modules until somebody touched the
          imported name. <a href="https://peps.python.org/pep-0690/">PEP 690</a> called the goal transparent. It was
          rejected.
        </p>
        <p>
          Three years later, <a href="https://peps.python.org/pep-0810/">PEP 810</a> was accepted for Python 3.15 with
          a conspicuous extra word: <code>lazy import json</code>. The performance idea barely needs explaining. The word
          does. A lazy import moves module execution, import errors, and import-time side effects from the import line to
          first use. I want that timing decision sitting in the source where a reviewer can see it.
        </p>

        <H2>The name arrives before the module</H2>
        <p>
          Python&apos;s{" "}
          <a href="https://docs.python.org/3.15/reference/simple_stmts.html#lazy-imports">
            current 3.15 documentation
          </a>{" "}
          makes the split unusually easy to inspect. The import statement binds a name immediately, but the target
          module does not enter <code>sys.modules</code> until the name is first used. The temporary value is a{" "}
          <code>types.LazyImportType</code> proxy.
        </p>
        <CodeBlock lang="python" title="The binding exists before json is loaded" highlight="3,5-7" code={lazyImport} />
        <p>
          Before the call to <code>json.dumps</code>, the importing module already has something named <code>json</code>.
          It just has not paid for the real module yet.
        </p>
        <MemoryBoxes
          title="Before the first use, the importing module owns a proxy while json is still absent from sys.modules."
          boxes={beforeFirstUse}
          caption="PEP 810 stores laziness in the imported binding. Accessing json resolves the proxy, loads the module, and replaces the binding with the real object."
        />
        <p>
          That implementation detail matters because the earlier proposal put more of the trick in dictionaries. PEP 690
          wanted lazy placeholders to be unobservable, so module dictionary lookup had to notice them and resolve them
          before Python or an extension could get hold of one. Even iteration over a dictionary needed special handling
          so a lazy object would not leak out halfway through the walk.
        </p>
        <p>
          PEP 810 gives up on that particular kind of transparency. The proxy type exists, debuggers can encounter it,
          and the normal dictionary stays a normal dictionary. After the first access, the binding behaves like an eager
          import again. That is a much smaller magic trick.
        </p>

        <H2>Python programmers were already moving the imports</H2>
        <p>
          The accepted PEP is responding to code people already write. Its authors counted roughly 3,500 imports across
          730 standard-library files outside tests and found about 17 percent placed inside functions or methods
          specifically to defer execution. Moving an import down into the function works, but it hides part of the module&apos;s
          dependency list and makes one refactor capable of pulling the cost back into startup.
        </p>
        <p>
          The command-line case is the obvious one. A tool may have a report generator, a local server, an exporter, and
          several optional backends, while <code>--help</code> needs almost none of them. PEP 810 keeps those dependencies
          at module scope and lets the entry point say which ones can wait:
        </p>
        <CodeBlock lang="python" title="cli.py" highlight="3-4" code={cliImports} />
        <p>
          I have not benchmarked the 3.15 implementation against a large production CLI, so I would start with an import
          profile rather than converting a package by taste. The PEP&apos;s useful contribution is that the optimization can
          now stay beside the dependency instead of being encoded as a tour of function bodies.
        </p>

        <H2>The side effect moved too</H2>
        <p>
          Laziness becomes risky when an import is doing more than making names available. Plenty of Python modules
          register plugins, install codecs, configure logging, populate registries, or probe the environment in top-level
          code. Mark one of those imports lazy and the registration happens later. Never touch the imported name and it
          may never happen at all.
        </p>
        <p>
          The accepted PEP says this directly: errors and side effects occur at first use. Python&apos;s grammar then puts a
          useful fence around one awkward case. A <code>lazy import</code> inside <code>try</code>, <code>except</code>,
          or <code>finally</code> is a syntax error. If loading is deferred until some unrelated call hours later, the
          original exception handler cannot honestly promise to catch the <code>ImportError</code> anymore.
        </p>
        <p>
          The current documentation compensates for that moved failure with a traceback that includes both the point of
          first use and the original import statement. Good. But the traceback cannot restore an initialization order a
          package was quietly relying on. A module whose import is part of application startup should probably remain
          eager until that work has a less surprising home.
        </p>

        <H2>The global switch is a probe</H2>
        <p>
          Python 3.15 also has <code>-X lazy_imports=all</code>, <code>PYTHON_LAZY_IMPORTS</code>, and a filter API that can
          force selected imports back to eager loading. The{" "}
          <a href="https://docs.python.org/3.15/whatsnew/3.15.html#pep-810-explicit-lazy-imports">
            3.15 release documentation
          </a>{" "}
          presents these as broader controls around the same mechanism. They are useful for finding how much startup work
          a program can skip and for testing an application&apos;s assumptions. I would be cautious about treating the global
          mode as the final design of a library, because it removes the best property the new syntax bought: you can no
          longer tell from the import line when the module body is supposed to run.
        </p>
        <p>
          The compatibility hook points in the other direction. A module can list names in <code>__lazy_modules__</code>
          so Python 3.15 treats ordinary imports of those modules as lazy while older interpreters ignore the declaration.
          That gives maintainers a migration bridge without asking every downstream application to flip its whole import
          graph at once.
        </p>
        <p>
          The relay in the header sits idle until a control signal arrives, and nobody mistakes that delay for an ordinary
          wire. I want the same courtesy from an import. Run the CLI with <code>--help</code> and the report backend can stay
          absent from <code>sys.modules</code>; choose <code>report</code> and it appears when the name is touched. The work
          moved in time, so the source should say so.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
