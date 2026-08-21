import { Figure } from "./figure";

type DataTableProps = {
  head: readonly React.ReactNode[];
  rows: readonly (readonly React.ReactNode[])[];
  /** Per-column alignment; numbers read best right-aligned. Defaults to left. */
  align?: readonly ("left" | "right")[];
  caption?: React.ReactNode;
};

/**
 * A quiet table for short enumerable facts: hairline row rules, no vertical
 * lines, tabular numerals on right-aligned columns. Wide tables scroll inside
 * their own container instead of stretching the page.
 */
export function DataTable({ head, rows, align, caption }: DataTableProps) {
  const alignment = (i: number) => (align?.[i] === "right" ? "text-right font-mono text-sm tabular-nums" : "text-left");
  return (
    <Figure caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {head.map((cell, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`border-b border-zinc-950/20 px-3 py-2 font-semibold text-zinc-950 first:pl-0 last:pr-0 dark:border-white/20 dark:text-zinc-50 ${alignment(i)}`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border-b border-zinc-950/5 px-3 py-2 text-zinc-700 first:pl-0 last:pr-0 dark:border-white/5 dark:text-zinc-300 ${alignment(ci)}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
