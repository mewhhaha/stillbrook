import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, CodeTabs, DataTable, DiffReview, H2, Prose } from "../../components";

export const article = {
  title: "The typed shadow",
  description:
    "Type inference keeps human source concise, while coding agents need a compiler-generated semantic shadow containing inferred types, symbol targets, and diagnostics.",
  published: "2026-07-13T09:26:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/the-typed-shadow-journal.webp",
    alt: "A bird holds a brass key beside a large lock, a transparent key, and a key-shaped chalk outline.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const humanSource = `
  declare const userIdBrand: unique symbol;

  type UserId = string & {
    readonly [userIdBrand]: true;
  };
  type Role = "admin" | "member";
  type User = {
    id: UserId;
    roles: ReadonlySet<Role>;
  };
  type UserIndex = {
    byId: ReadonlyMap<UserId, User>;
    admins: readonly User[];
  };

  export function indexUsers(
    users: readonly User[],
  ): UserIndex {
    const byId = new Map(
      users.map(user => [user.id, user] as const),
    );
    const admins = [...byId.values()].filter(
      user => user.roles.has("admin"),
    );
    return { byId, admins };
  }
`;

const semanticShadow = `
  snapshot: git:8bf2…  typescript: 6.0  strict: true
  selection: src/users.ts:16-25

  indexUsers
    input users: readonly User[]
    return: UserIndex

  19:11 byId
    inferred: Map<UserId, User>
    constructor: Map<UserId, User>

  22:11 admins
    inferred: User[]
  23:7 user
    contextual: User
  23:15 user.roles.has
    target: ReadonlySet<Role>.has
    signature: (value: Role) => boolean

  diagnostics: []
`;

const shadowExtractor = `
  import ts from "typescript";

  const program = ts.createProgram(files, options);
  const checker = program.getTypeChecker();

  function describe(node: ts.Node) {
    const type = checker.getTypeAtLocation(node);
    const symbol = checker.getSymbolAtLocation(node);

    return {
      span: [node.getStart(), node.getEnd()],
      type: checker.typeToString(
        type,
        node,
        ts.TypeFormatFlags.NoTruncation,
      ),
      symbol: symbol
        ? checker.getFullyQualifiedName(symbol)
        : null,
    };
  }

  const diagnostics = ts.getPreEmitDiagnostics(program);
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="6 min read">
      <Prose>
        <p>
          An agent patch I reviewed added a type to code that already had one. The generic arguments looked
          clearer spelled out, and the agent, handed a file in which no annotation appeared, had reconstructed
          the missing fact from tokens. Type inference is peak programming for humans because the checker
          carries repetitive facts outside the source. An agent given only that source has to guess the rest.
        </p>
        <DiffReview
          file="users.ts"
          lines={[
            { type: "del", text: "const byId = new Map(" },
            { type: "add", text: "const byId = new Map<string, User>(" },
            { type: "ctx", text: "  users.map(user => [user.id, user] as const)," },
            { type: "ctx", text: ");" },
          ]}
          comments={[
            {
              line: 2,
              author: "Mira Voss",
              text: (
                <>
                  Hover on the removed line shows <code>Map&lt;UserId, User&gt;</code> — the checker had
                  already proved the branded key. This annotation widens it to <code>string</code>, so the
                  map now accepts values that never passed through the <code>UserId</code> constructor.
                </>
              ),
            },
          ]}
          caption="The agent's patch as the review saw it, with the hover text the file never contained."
        />
        <p>
          Why did adding a type make the program less typed? The annotation replaced a compiler result with a
          developer claim, and the claim was broader. A human sees the difference through editor tooling. A
          text-only agent sees two plausible generic arguments.
        </p>

        <H2>Humans should not write the hover text</H2>
        <p>
          TypeScript&apos;s official{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/type-inference.html">
            inference documentation
          </a>{" "}
          describes types flowing from initializers, return values, and surrounding context. The callback
          parameter in <code>filter</code> does not need an annotation because the collection already determines
          it. Repeating <code>User</code> there adds another place where a refactor can lie.
        </p>
        <p>
          The older ideal is the principal type: infer the most general type justified by the expression rather
          than making the programmer restate it. Damas and Milner&apos;s{" "}
          <a href="https://dl.acm.org/doi/10.1145/582153.582176">
            principal type-schemes paper
          </a>{" "}
          formalized that idea for ML. TypeScript is a much messier language, but the human benefit survives.
          Inference is compression with the proof still attached.
        </p>
        <p>
          I haven&apos;t found a clean defect-rate study that isolates local annotation count from the rest of a
          language and team. My claim is narrower: when the compiler can derive a fact, copying that fact into
          editable source creates another version that can drift.
        </p>
        <Callout variant="note" title="Keep explicit types at seams">
          <p>
            Exported APIs, serialization boundaries, foreign calls, intentionally widened values, and ambiguous
            literals deserve annotations. Local variables and callback parameters should usually inherit the
            facts those seams already established.
          </p>
        </Callout>
        <p>
          The human file and the compiler&apos;s reading of it are different views of the same program:
        </p>
        <CodeTabs labels={["Human source", "Typed shadow"]}>
          <CodeBlock lang="ts" title="users.ts" highlight="19-24" code={humanSource} />
          <CodeBlock lang="text" title="users.semantic.txt" code={semanticShadow} />
        </CodeTabs>

        <H2>The agent lost the editor</H2>
        <p>
          Human programmers do not actually work from raw source alone — a whole semantic layer sits beside
          the file all day, answering questions the raw text cannot.
        </p>
        <DataTable
          head={["Editor request", "Human in editor", "Text-only agent"]}
          rows={[
            ["Hover", "✓", "—"],
            ["Completion", "✓", "—"],
            ["Go-to-definition", "✓", "—"],
            ["References", "✓", "—"],
            ["Signature help", "✓", "—"],
            ["Diagnostics", "✓", "—"],
          ]}
          caption="The semantic layer, request by request: available beside the file, absent from a plain file read."
        />
        <p>
          The{" "}
          <a href="https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/">
            Language Server Protocol
          </a>{" "}
          standardizes many of those requests, which means the semantic layer already has a transport. A coding
          agent that receives files through search and read tools can lose that entire layer.
        </p>
        <p>
          A declaration file only partly repairs the loss. It describes a module&apos;s public surface, while the
          mistake above lived in a local inference, a contextual callback type, and the exact signature selected
          at one call site. TypeScript&apos;s{" "}
          <a href="https://github.com/microsoft/TypeScript-wiki/blob/dc0678451da7aa431f23a4b074d87ae0a9463b33/Using-the-Compiler-API.md">
            compiler API
          </a>{" "}
          already exposes the whole <code>Program</code>, its source files, semantic diagnostics, and declaration
          emit. The missing piece is an agent-sized projection of that state.
        </p>
        <p>
          Recent agent work is moving in this direction. The{" "}
          <a href="https://arxiv.org/abs/2510.22907">
            compiler and language-server feedback paper
          </a>{" "}
          argues that diagnostics, symbol resolution, type information, references, and refactoring preconditions
          are supervision signals, then packages language-server sessions into replayable analysis bundles. The
          editor&apos;s invisible half becomes data an agent can inspect and compare after an edit.
        </p>

        <H2>Generate a shadow, not a mirror</H2>
        <p>
          A committed, fully annotated copy of every file would drift, consume context, and expose enormous
          implementation types that no reader chose as an interface. Generate the typed shadow from the exact
          compiler version, configuration, dependency graph, and source snapshot instead. Ask for the changed
          range plus its enclosing declarations.
        </p>
        <CodeBlock lang="ts" title="semantic-shadow.ts" highlight="3-4,7-18,21" code={shadowExtractor} />
        <p>
          Each record needs a source span, the inferred type at that use site, the resolved symbol or overload,
          and current diagnostics. Flow-sensitive languages should report the narrowed type where the identifier
          is read, not only the declaration type. Long types can keep a stable handle so the agent expands them
          on demand instead of receiving a page of conditional-type algebra before every edit.
        </p>
        <p>
          Snapshot identity matters too. A type computed against yesterday&apos;s lockfile can be more dangerous
          than no type, because it arrives with compiler authority attached. The semantic document should name
          the commit, compiler, options, and dependency state that produced it, then expire when any of those
          inputs change.
        </p>

        <H2>Let the checker steer the patch</H2>
        <p>
          Types become more useful when they constrain generation rather than decorate the prompt. A 2025{" "}
          <a href="https://arxiv.org/abs/2504.09246">
            type-constrained code generation study
          </a>{" "}
          integrated inference into decoding for TypeScript and cut compilation errors by more than half while
          improving functional correctness. The model needed no extra prose explaining assignability because the
          type system removed invalid continuations from the search.
        </p>
        <p>
          A practical agent can use a less invasive loop. Before editing, request the typed shadow for the symbols
          in the task and their callers. After applying a patch, ask the compiler for new diagnostics, changed
          public types, newly widened aliases, and the resolved targets of modified calls. The source remains the
          document humans review, while the checker supplies evidence for the agent&apos;s next move.
        </p>
        <p>
          I wrote a first exporter that described every identifier in a forty-line component. It produced several
          screens of mapped-type sludge and buried the one narrowed union I wanted. The current version emits only
          changed symbols and gives long types a query handle. One conditional type still expands into a page, and
          I have not decided whether the agent should see that page or the alias that named it.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
