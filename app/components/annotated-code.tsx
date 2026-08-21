import { tokenizeLines, type Language, type Token, type TokenType } from "./highlight";
import { Figure } from "./figure";

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

export type CodeNote = {
  /** 1-indexed line the note explains. */
  line: number;
  note: React.ReactNode;
};

type AnnotatedCodeProps = {
  code: string;
  lang?: Language;
  /** Filename or short label shown in the header bar. */
  title?: string;
  /** Up to five notes, each anchored to one line. */
  notes: readonly CodeNote[];
  caption?: React.ReactNode;
};

/**
 * A snippet with numbered notes anchored to its lines: the anatomy of one
 * piece of code, told in the author's voice. Reach for it where the prose
 * would otherwise decode the block line by line in a dense paragraph — the
 * notes carry those facts instead, and the paragraph gets to say something
 * the figure cannot. Keep it to five notes; past that the snippet is a
 * walkthrough and deserves sections. For reviewer-voice commentary on a
 * change, use DiffReview.
 */
export async function AnnotatedCode({ code, lang = "text", title, notes, caption }: AnnotatedCodeProps) {
  const text = dedent(code);
  const lines = await tokenizeLines(text, lang);
  const noteIndexByLine = new Map(notes.map((n, i) => [n.line, i + 1]));
  return (
    <Figure caption={caption}>
      <div className="overflow-hidden rounded-xl bg-zinc-950 dark:bg-zinc-900 dark:inset-ring dark:inset-ring-white/5">
        {title ? (
          <div className="flex items-baseline gap-4 border-b border-zinc-800 px-5 py-3">
            <span className="font-mono text-xs text-zinc-400">{title}</span>
            {lang === "text" ? null : (
              <span className="ml-auto font-mono text-[11px] uppercase tracking-widest text-zinc-600">{lang}</span>
            )}
          </div>
        ) : null}
        <pre className="overflow-x-auto py-4 font-mono text-sm leading-6 text-zinc-200">
          <code className="block w-max min-w-full">
            {lines.map((tokens, index) => (
              <AnnotatedLine key={index} tokens={tokens} marker={noteIndexByLine.get(index + 1)} />
            ))}
          </code>
        </pre>
      </div>
      <ol className="mt-3 space-y-1.5">
        {notes.map((n, i) => (
          <li key={n.line} className="flex gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            <NoteBadge index={i + 1} />
            <span className="min-w-0">{n.note}</span>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

function NoteBadge({ index }: { index: number }) {
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-orange-600/40 bg-white font-mono text-[11px] text-orange-700 dark:bg-zinc-950 dark:text-orange-400">
      {index}
    </span>
  );
}

function AnnotatedLine({ tokens, marker }: { tokens: Token[]; marker?: number }) {
  const treatment = marker === undefined ? "pl-5" : "border-l-2 border-orange-400 bg-orange-400/10 pl-[18px]";
  return (
    <span className={`block min-h-[1lh] pr-5 ${treatment}`}>
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
      {marker === undefined ? null : (
        <span
          aria-hidden="true"
          className="ml-4 inline-flex size-5 -translate-y-px items-center justify-center rounded-full border border-orange-400/50 bg-zinc-950 align-middle font-mono text-[11px] leading-none text-orange-400"
        >
          {marker}
        </span>
      )}
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
