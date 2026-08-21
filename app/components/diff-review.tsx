import { Figure } from "./figure";

export type DiffReviewLine = {
  /** "add" renders with a +, "del" with a -, "ctx" is unchanged context. */
  type: "add" | "del" | "ctx";
  text: string;
};

export type DiffReviewComment = {
  /** 1-based index into `lines`; the comment renders under that line. */
  line: number;
  author: string;
  text: React.ReactNode;
};

type DiffReviewProps = {
  /** Filename shown in the header, for example "badge.ts". */
  file?: string;
  lines: readonly DiffReviewLine[];
  comments?: readonly DiffReviewComment[];
  caption?: React.ReactNode;
};

const LINE_STYLE = {
  add: "bg-green-600/10 text-green-900 dark:bg-green-400/10 dark:text-green-200",
  del: "bg-red-600/10 text-red-900 dark:bg-red-400/10 dark:text-red-200",
  ctx: "text-zinc-600 dark:text-zinc-400",
} as const;

const LINE_SIGN = { add: "+", del: "-", ctx: " " } as const;

/**
 * A code diff with inline review comments, the way a pull request renders
 * one. Use it when the essay's point lives in the conversation about a
 * change — what the reviewer saw, where, and what they said — rather than
 * in the change alone.
 */
export function DiffReview({ file, lines, comments = [], caption }: DiffReviewProps) {
  return (
    <Figure caption={caption}>
      <div className="overflow-hidden rounded-xl border border-zinc-950/10 dark:border-white/10">
        {file ? (
          <p className="border-b border-zinc-950/10 bg-zinc-50 px-4 py-2 font-mono text-xs text-zinc-500 dark:border-white/10 dark:bg-zinc-900">
            {file}
          </p>
        ) : null}
        <div className="overflow-x-auto bg-white py-2 dark:bg-zinc-950">
          {lines.map((line, i) => {
            const attached = comments.filter((c) => c.line === i + 1);
            return (
              <div key={i}>
                <pre className={`px-4 font-mono text-sm leading-6 ${LINE_STYLE[line.type]}`}>
                  <span className="mr-3 inline-block w-3 select-none text-zinc-400">{LINE_SIGN[line.type]}</span>
                  {line.text}
                </pre>
                {attached.map((comment, ci) => (
                  <div
                    key={ci}
                    className="mx-4 my-2 rounded-lg border border-orange-500/30 bg-orange-50/50 p-3 dark:bg-orange-400/5"
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <span
                        aria-hidden="true"
                        className="flex size-5 items-center justify-center rounded-full bg-orange-600 font-mono text-[10px] font-semibold text-white"
                      >
                        {comment.author.slice(0, 1).toUpperCase()}
                      </span>
                      {comment.author}
                    </p>
                    <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">{comment.text}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Figure>
  );
}
