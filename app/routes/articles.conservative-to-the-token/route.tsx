import { articleMeta, type ArticleMeta } from "../../article";
import {
  ArticleLayout,
  BarChart,
  CodeBlock,
  DataTable,
  H2,
  Prose,
} from "../../components";

export const article = {
  title: "Conservative to the token",
  description:
    "The agent harness primitives that survived the last year are the ones you can read off deprecation notices: a loop with no limits, a frozen tool set, a markdown file, and a transcript on disk.",
  published: "2026-07-25T13:40:00Z",
  author: "Mira Voss",
  tags: ["software"],
  image: {
    src: "/images/articles/conservative-to-the-token.jpg",
    alt: "A tool board in a ship's engine room where each wrench, socket and screwdriver hangs inside a painted outline, and roughly a third of the outlines are empty.",
    credit: {
      author: "Maxschiraldi",
      license: "CC BY-SA 4.0",
      href: "https://commons.wikimedia.org/wiki/File:Shadowboard-mmschiraldi.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const toolSurface = `
  // packages/coding-agent/src/core/tools/index.ts
  export type ToolName = "read" | "bash" | "edit" | "write" | "grep" | "find" | "ls";

  // packages/coding-agent/src/core/system-prompt.ts
  const tools = selectedTools || ["read", "bash", "edit", "write"];
`;

const startupCost = [
  { label: "Chrome DevTools MCP, 26 tools", value: 18000 },
  { label: "Playwright MCP, 21 tools", value: 13700 },
  { label: "pi: system prompt and four tools", value: 1000 },
  { label: "Browser tools as a CLI with a README", value: 225 },
] as const;

const deprecations = [
  [
    "Roots",
    "Pass directories or files through tool parameters, resource URIs, or server configuration",
  ],
  ["Sampling", "Integrate directly with LLM provider APIs"],
  [
    "Logging",
    "Log to stderr on stdio transports, and use OpenTelemetry for observability",
  ],
] as const;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <Prose>
        <p>
          The Philosophy section of{" "}
          <a href="https://github.com/earendil-works/pi">pi</a>&apos;s README is mostly a list of
          refusals: no MCP, no sub-agents, no permission popups, no plan mode, no built-in to-dos, no
          background bash. Read that and you brace for a tiny program. Then you clone the repository
          and count 437 source files and 102,286 lines, one of which —{" "}
          <code>agent-session.ts</code> — is 111 KB by itself.
        </p>
        <p>
          Both things are true at once, and the distance between them is the whole design. pi is
          conservative about exactly one resource, the tokens the model reads before it does
          anything. Everything underneath that line can be as large as it needs to be, because you
          are the only one paying for that part.
        </p>
        <CodeBlock lang="ts" code={toolSurface} highlight="5" />
        <p>
          Seven tools are implemented and four are switched on. Why write <code>grep</code> against
          ripgrep, teach it <code>.gitignore</code>, cap its lines at 500 characters, and then not
          tell the model it exists? You can turn it on for a read-only session with{" "}
          <code>pi --tools read,grep,find,ls</code>, and the rest of the time it stays quiet. The
          code gets written once and the description gets paid for on every single request.
        </p>

        <H2>The only scarce thing</H2>
        <p>
          Mario Zechner&apos;s figure for pi is that{" "}
          <a href="https://mariozechner.at/posts/2025-11-30-pi-coding-agent/">
            the system prompt and all four tool definitions together come in below 1,000 tokens
          </a>
          , on the theory that frontier models have been trained hard enough on coding work that
          they do not need ten thousand tokens explaining what a coding agent is. The comparison he
          keeps drawing is against MCP servers, which hand over a full catalogue whether or not the
          session will ever touch it.
        </p>
        <BarChart
          title="Context spent on tool definitions before the first message, in tokens."
          data={startupCost}
          caption={
            <>
              What each option costs before you have said anything. Zechner measured{" "}
              <a href="https://mariozechner.at/posts/2025-11-02-what-if-you-dont-need-mcp/">
                the two MCP servers and his own README-based browser tools
              </a>
              ; pi&apos;s bar is his &ldquo;below 1000 tokens&rdquo; claim taken at face value.
            </>
          }
        />
        <p>
          There is a harder reason the set has to stay frozen. Anthropic&apos;s{" "}
          <a href="https://platform.claude.com/docs/en/build-with-claude/prompt-caching">
            prompt cache
          </a>{" "}
          builds its prefix in the order tools, system, messages, and a change at any level
          invalidates that level and everything after it. Add one tool mid-session and the cache for
          the entire conversation is gone. The Claude Code team{" "}
          <a href="https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything">
            designed plan mode around this
          </a>
          : rather than removing tools on the way in, every tool stays present and entering and
          leaving the mode are themselves tool calls.
        </p>
        <p>
          Then Zechner benchmarked the thing he had been arguing against and it went the other way.
          Across 120 runs of terminal-control tasks his terminalcp tool hit a 100 percent success
          rate as an MCP server and as a plain CLI, with{" "}
          <a href="https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/">
            the MCP version finishing 23 percent faster
          </a>{" "}
          because every bash invocation was tripping a command-safety check that MCP calls skipped.
          He came away calling the protocol plumbing and went on counting catalogue sizes.
        </p>

        <H2>Read what the specs delete</H2>
        <p>
          If you want to know which primitives are load-bearing, skip the launch posts and read the
          deprecations. MCP&apos;s July 28, 2026 revision retires Roots, Sampling, and Logging, and{" "}
          <a href="https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577">
            the pull request says why
          </a>
          : they were identified as having low adoption relative to their implementation complexity.
          Three primitives, specified, implemented across four SDKs, retired for being hard to build
          and unloved.
        </p>
        <DataTable
          head={["Deprecated feature", "Official migration path"]}
          rows={deprecations}
          caption={
            <>
              From{" "}
              <a href="https://modelcontextprotocol.io/specification/draft/deprecated">
                the specification&apos;s own deprecation registry
              </a>
              . Earliest removal is the first revision released on or after July 28, 2027.
            </>
          }
        />
        <p>
          Every migration path in that table points at something that already existed before the
          protocol did. Meanwhile ACP, the editor-to-agent protocol Zed and JetBrains co-govern,
          published{" "}
          <a href="https://agentclientprotocol.com/protocol/v2/migration">a v2 draft</a> on July 20
          that removes <code>fs/read_text_file</code>, <code>fs/write_text_file</code> and the whole{" "}
          <code>terminal/*</code> family, telling agents to reach for MCP servers instead. Both
          specifications are cutting from opposite ends, and both have landed on a smaller surface
          than they shipped with.
        </p>

        <H2>What is left in the box</H2>
        <p>
          The surviving list is short. The loop runs until the model stops asking for tools and
          carries no step limit; pi&apos;s author says he never found a use for one. The tool set is
          four entries whose definitions never move mid-session. For project context you use a file
          you did not invent, since{" "}
          <a href="https://agents.md/">AGENTS.md</a> already sits in tens of thousands of
          repositories under Linux Foundation stewardship and pi looks for it by name alongside
          CLAUDE.md.
        </p>
        <p>
          The fourth piece is the one people skip. pi&apos;s transcript is JSONL, one object per
          line, every entry carrying a <code>parentId</code>, which makes the history a tree that
          branches in place rather than a log you replay into a database. Resume, fork, and an RPC
          mode that pipes the same events into another program all fall out of that file existing. I
          have not run pi for a month of real work, so the four-tool claim is his evidence rather
          than mine. The file, at least, you can open and read yourself.
        </p>
        <p>
          The crack in the design is compaction, which pi shipped without and now runs by default:
          hold back 16,384 tokens, keep roughly the last 20,000, hand everything older to another
          model call to summarize. That summary is lossy, and the model never sees the originals
          again. What got dropped is still sitting in the JSONL, in a file you will open exactly
          once, on the afternoon the agent confidently contradicts something you told it an hour
          earlier.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
