import { tokenizeLines, type Language, type Token, type TokenType } from "./highlight";
import { CopyButton } from "./copy-button";

const tokenClassNames: Record<TokenType, string | undefined> = {
  plain: undefined,
  comment: "italic text-zinc-500",
  string: "text-amber-200",
  keyword: "text-orange-300",
  literal: "text-amber-300",
  number: "text-amber-300",
  function: "text-zinc-50",
  type: "text-sky-300",
  property: "text-sky-300",
  tag: "text-orange-300",
  attribute: "text-amber-200",
  punctuation: "text-zinc-500",
  inserted: "text-emerald-300",
  deleted: "text-red-300",
};

type CodeBlockProps = {
  code: string;
  lang?: Language;
  /** Filename or short label shown in the header bar. */
  title?: string;
  /** 1-indexed lines to emphasize, e.g. "3" or "2,5-7". */
  highlight?: string;
  lineNumbers?: boolean;
};

/**
 * A server-rendered code block: tokenized at request time, so readers get
 * colored code as plain HTML. The only client JavaScript is the copy button.
 * Grammars are split per language and dynamically imported, so a grammar
 * only loads the first time an article uses its language.
 * Template literals are dedented, so snippets can sit at natural JSX indentation.
 */
export async function CodeBlock({ code, lang = "text", title, highlight, lineNumbers = false }: CodeBlockProps) {
  const text = dedent(code);
  const lines = await tokenizeLines(text, lang);
  const emphasized = parseHighlight(highlight);
  const gutterWidth = `${String(lines.length).length}ch`;
  return (
    <figure className="group overflow-hidden rounded-xl bg-zinc-950 dark:bg-zinc-900 dark:inset-ring dark:inset-ring-white/5">
      {title ? (
        <figcaption className="flex items-baseline gap-4 border-b border-zinc-800 px-5 py-3">
          <span className="font-mono text-xs text-zinc-400">{title}</span>
          <span className="ml-auto flex items-baseline gap-4">
            {lang === "text" ? null : (
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-600">{lang}</span>
            )}
            <CopyButton text={text} />
          </span>
        </figcaption>
      ) : null}
      <div className="relative">
        {title ? null : (
          <span className="absolute right-3 top-3 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <CopyButton text={text} />
          </span>
        )}
        <pre className="overflow-x-auto py-4 font-mono text-sm leading-6 text-zinc-200">
          <code className="block w-max min-w-full">
            {lines.map((tokens, index) => (
              <Line
                key={index}
                tokens={tokens}
                number={lineNumbers ? index + 1 : undefined}
                gutterWidth={gutterWidth}
                emphasized={emphasized.has(index + 1)}
              />
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}

function Line({
  tokens,
  number,
  gutterWidth,
  emphasized,
}: {
  tokens: Token[];
  number?: number;
  gutterWidth: string;
  emphasized: boolean;
}) {
  const diff = tokens.length === 1 ? tokens[0].type : undefined;
  const treatment = emphasized
    ? "border-l-2 border-orange-400 bg-orange-400/10 pl-[18px]"
    : diff === "inserted"
      ? "bg-emerald-400/10 pl-5"
      : diff === "deleted"
        ? "bg-red-400/10 pl-5"
        : "pl-5";
  return (
    <span className={`block min-h-[1lh] pr-5 ${treatment}`}>
      {number === undefined ? null : (
        <span
          style={{ width: gutterWidth }}
          aria-hidden="true"
          className="mr-5 inline-block select-none text-right tabular-nums text-zinc-600"
        >
          {number}
        </span>
      )}
      {tokens.map((token, index) => {
        const className = tokenClassNames[token.type];
        return className ? (
          <span key={index} className={className}>
            {token.value}
          </span>
        ) : (
          token.value
        );
      })}
    </span>
  );
}

function dedent(raw: string): string {
  const lines = raw.replace(/^\n/, "").trimEnd().split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => (/^[ \t]*/.exec(line) ?? [""])[0].length);
  const margin = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(margin)).join("\n");
}

function parseHighlight(spec: string | undefined): Set<number> {
  const lines = new Set<number>();
  if (!spec) return lines;
  for (const part of spec.split(",")) {
    const [start, end = start] = part.split("-").map((value) => Number.parseInt(value, 10));
    if (Number.isNaN(start)) continue;
    const last = Number.isNaN(end) ? start : end;
    for (let line = start; line <= last; line += 1) lines.add(line);
  }
  return lines;
}
