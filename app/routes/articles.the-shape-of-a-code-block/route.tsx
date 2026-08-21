import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, Callout, CodeBlock, CodeTabs, Divider, H2, Prose, PullQuote } from "../../components";

export const article = {
  title: "The shape of a code block",
  description:
    "How this journal renders code: a hand-rolled tokenizer on the server, and a copy button's worth of client JavaScript.",
  published: "2026-07-11T08:00:00Z",
  author: "Lena Hart",
  tags: ["craft", "web"],
  image: {
    src: "/images/articles/the-shape-of-a-code-block.jpg",
    alt: "Close-up of metal movable type letters sorted into the compartments of a wooden type case.",
    credit: {
      author: "Willi Heidelbach",
      license: "CC BY 2.5",
      href: "https://commons.wikimedia.org/wiki/File:Metal_movable_type.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

const scanSample = `
  function scan(code: string, rules: Rule[]): Token[] {
    const tokens: Token[] = [];
    let pos = 0;
    while (pos < code.length) {
      const match = firstMatch(rules, code, pos);
      if (!match) {
        push(tokens, "plain", code[pos]);
        pos += 1;
        continue;
      }
      push(tokens, match.type, match.value);
      pos += match.value.length;
    }
    return tokens;
  }
`;

const usageSample = `
  import { CodeBlock, CodeTabs } from "../../components";

  export function Example() {
    return (
      <CodeTabs labels={["pnpm", "npm"]}>
        <CodeBlock lang="sh" code={installWithPnpm} />
        <CodeBlock lang="sh" code={installWithNpm} />
      </CodeTabs>
    );
  }
`;

const pnpmSample = `
  pnpm add react-router
  pnpm dev
`;

const npmSample = `
  npm install react-router
  npm run dev
`;

const diffSample = `
  export const article = {
    title: "The shape of a code block",
    published: "2026-07-11T08:30:00Z",
  } as const satisfies ArticleMeta;
`;

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="3 min read">
      <Prose>
        <p>
          Publishing code on the web usually means shipping a highlighting library to every reader,
          and I&apos;ve never liked that trade — the snippet hasn&apos;t changed since I wrote it,
          so why should your browser tokenize it again? Articles here are server components. Each
          snippet is highlighted once, on the server, and arrives as plain colored HTML.
        </p>
        <H2>Painted on the server</H2>
        <p>
          The highlighter is a small scanner: an ordered list of regular expressions per language,
          tried at each position until one matches. That falls well short of a parser, and for
          snippets set in a journal it doesn&apos;t have to be one — color the comments and
          strings, pick out the keywords, and most of the meaning is already on the page.
        </p>
        <CodeBlock
          lang="ts"
          title="app/components/highlight.ts"
          lineNumbers
          code={scanSample}
        />
        <p>
          A block takes a filename and optional line numbers, plus a <code>highlight</code> prop
          for the lines the paragraph is actually talking about — below, the emphasis marks the
          tabs being wired up.
        </p>
        <CodeBlock lang="tsx" highlight="5-8" code={usageSample} />
        <H2>One shell, many shapes</H2>
        <p>
          When one instruction comes in flavors — pnpm and npm, say — the variants share a single
          block through tabs. The panels are rendered on the server like everything else; the only
          client code is the toggle itself.
        </p>
        <CodeTabs labels={["pnpm", "npm"]}>
          <CodeBlock lang="sh" code={pnpmSample} />
          <CodeBlock lang="sh" code={npmSample} />
        </CodeTabs>
        <p>Diffs get the same treatment, with added and removed lines tinted whole:</p>
        <CodeBlock lang="diff" code={diffSample} />
        <Callout variant="tip">
          <p>
            Snippets are written as template literals and dedented automatically, so they can sit at
            their natural indentation inside JSX. Keep backticks and dollar-brace sequences out of
            samples, or escape them — I forget this about once a month.
          </p>
        </Callout>
        <Divider />
        <PullQuote>Syntax highlighting is typography, not decoration.</PullQuote>
        <p>
          The rest of the shell — the dateline above, the footer below, the progress bar at the top
          of the window — comes from the same small component library every article uses. What
          varies is the writing, and the occasional interactive island when playing with a thing
          explains it better than reading about it would.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
