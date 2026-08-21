import { Figure } from "./figure";

export type NumberLinePoint = {
  value: number;
  label: string;
  /** Which side of the axis carries the label; defaults to alternating. */
  side?: "above" | "below";
};

type NumberLineProps = {
  /** One-sentence summary of what the line shows, for assistive tech. */
  title: string;
  /** Up to five marked values. */
  points: readonly NumberLinePoint[];
  /** Bracketed spans under the axis, for a cluster too tight to label point by point. */
  ranges?: readonly { from: number; to: number; label: string }[];
  /** A boundary worth drawing, for example a safe-integer limit. */
  threshold?: { value: number; label: string };
  /** Lower bound of the axis; defaults to a little below the smallest value. */
  min?: number;
  /** Upper bound of the axis; defaults to a little above the largest value. */
  max?: number;
  /** Formats the value printed under each marker. */
  format?: (value: number) => string;
  caption?: React.ReactNode;
};

const WIDTH = 640;
const HEIGHT = 150;
const PAD = { left: 28, right: 28 };
const AXIS_Y = 92;

function defaultFormat(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

/**
 * Marked values on one axis, rendered as static SVG. Reach for it when the
 * intuition is where values sit relative to each other or to a boundary —
 * a gap between two timings, an identifier past a safe-integer cliff. It
 * shows position, not quantity per category; bars comparing categories
 * belong in BarChart. Labels alternate above and below the axis, so keep
 * them to a few words and the points to five.
 */
export function NumberLine({ title, points, ranges = [], threshold, min, max, format = defaultFormat, caption }: NumberLineProps) {
  const values = [
    ...points.map((p) => p.value),
    ...ranges.flatMap((r) => [r.from, r.to]),
    ...(threshold ? [threshold.value] : []),
  ];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = (hi - lo || Math.abs(hi) || 1) * 0.08;
  const domainMin = min ?? lo - pad;
  const domainMax = max ?? hi + pad;
  const x = (v: number) => PAD.left + ((v - domainMin) / (domainMax - domainMin)) * (WIDTH - PAD.left - PAD.right);
  const ordered = [...points].sort((a, b) => a.value - b.value);

  return (
    <Figure caption={caption}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="w-full">
        <line
          x1={PAD.left - 12}
          x2={WIDTH - PAD.right + 12}
          y1={AXIS_Y}
          y2={AXIS_Y}
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth={1.5}
        />
        {threshold ? (
          <g>
            <line
              x1={x(threshold.value)}
              x2={x(threshold.value)}
              y1={AXIS_Y - 62}
              y2={AXIS_Y + 34}
              strokeDasharray="4 4"
              className="stroke-zinc-400 dark:stroke-zinc-500"
            />
            <text
              x={x(threshold.value)}
              y={AXIS_Y - 70}
              textAnchor="middle"
              fontSize={11}
              className="fill-zinc-500 font-mono"
            >
              {threshold.label}
            </text>
          </g>
        ) : null}
        {ranges.map((r) => (
          <g key={r.label}>
            <path
              d={`M ${x(r.from)} ${AXIS_Y + 14} v 8 H ${x(r.to)} v -8`}
              fill="none"
              className="stroke-zinc-400 dark:stroke-zinc-500"
            />
            <line
              x1={x(r.from)}
              x2={x(r.to)}
              y1={AXIS_Y}
              y2={AXIS_Y}
              strokeWidth={5}
              strokeLinecap="round"
              style={{ stroke: "var(--chart-1)" }}
              opacity={0.45}
            />
            <text
              x={(x(r.from) + x(r.to)) / 2}
              y={AXIS_Y + 38}
              textAnchor="middle"
              fontSize={12}
              className="fill-zinc-700 dark:fill-zinc-300"
            >
              {r.label}
            </text>
            <text
              x={(x(r.from) + x(r.to)) / 2}
              y={AXIS_Y + 54}
              textAnchor="middle"
              fontSize={11}
              className="fill-zinc-500 font-mono tabular-nums"
            >
              {`${format(r.from)}–${format(r.to)}`}
            </text>
          </g>
        ))}
        {ordered.map((p, i) => {
          const above = p.side ? p.side === "above" : i % 2 === 0;
          const labelY = above ? AXIS_Y - 38 : AXIS_Y + 26;
          const valueY = above ? AXIS_Y - 22 : AXIS_Y + 42;
          return (
            <g key={p.label}>
              <line
                x1={x(p.value)}
                x2={x(p.value)}
                y1={above ? AXIS_Y - 14 : AXIS_Y}
                y2={above ? AXIS_Y : AXIS_Y + 14}
                className="stroke-zinc-950/20 dark:stroke-white/20"
              />
              <circle cx={x(p.value)} cy={AXIS_Y} r={5} style={{ fill: "var(--chart-1)" }} className="stroke-white dark:stroke-zinc-950" strokeWidth={2}>
                <title>{`${p.label}: ${format(p.value)}`}</title>
              </circle>
              <text x={x(p.value)} y={labelY} textAnchor="middle" fontSize={12} className="fill-zinc-700 dark:fill-zinc-300">
                {p.label}
              </text>
              <text x={x(p.value)} y={valueY} textAnchor="middle" fontSize={11} className="fill-zinc-500 font-mono tabular-nums">
                {format(p.value)}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Wrapper for the same reason as the charts': sr-only cannot shrink a table. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <tbody>
            {ordered.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{format(p.value)}</td>
              </tr>
            ))}
            {ranges.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label} (range)</th>
                <td>{`${format(r.from)} to ${format(r.to)}`}</td>
              </tr>
            ))}
            {threshold ? (
              <tr>
                <th scope="row">{threshold.label} (boundary)</th>
                <td>{format(threshold.value)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
