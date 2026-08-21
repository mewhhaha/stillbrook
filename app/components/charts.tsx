import { Figure } from "./figure";

/** Categorical slots from the validated chart palette in styles.css. Assigned in order, never cycled. */
const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

function defaultFormat(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

/** Rounds a maximum up to a 1/2/5 step so gridlines land on friendly numbers. */
function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) {
    if (value <= step * power) return step * power;
  }
  return 10 * power;
}

type BarChartProps = {
  /** One-sentence summary of what the chart shows, for assistive tech. */
  title: string;
  data: readonly { label: string; value: number }[];
  /** Formats the value shown at the end of each bar. */
  format?: (value: number) => string;
  /** Upper bound for the scale; defaults to a rounded step above the largest value. */
  max?: number;
  caption?: React.ReactNode;
};

/**
 * A horizontal single-series bar chart, rendered on the server with no
 * JavaScript. Every bar carries a direct value label, so color never has to
 * be read; a visually hidden table repeats the data for assistive tech.
 */
export function BarChart({ title, data, format = defaultFormat, max, caption }: BarChartProps) {
  const top = max ?? niceCeil(Math.max(...data.map((d) => d.value)));
  return (
    <Figure caption={caption}>
      <div role="img" aria-label={title}>
        <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 border-l border-zinc-300 pl-px dark:border-zinc-700">
          {data.map((d) => (
            <div key={d.label} className="contents">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{d.label}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3.5 shrink-0 rounded-r"
                  style={{ width: `${Math.max((d.value / top) * 100, 0.5)}%`, background: SERIES[0] }}
                />
                <span className="font-mono text-xs tabular-nums text-zinc-500">{format(d.value)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* sr-only sits on a wrapper because a table ignores the recipe's 1px
          width (it acts as a min-width there) and stretches the page sideways. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <th scope="row">{d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

type LineChartProps = {
  /** One-sentence summary of what the chart shows, for assistive tech. */
  title: string;
  /** Category labels along the x axis, one per data point. */
  labels: readonly string[];
  /** Up to four series; values align with `labels` by index. */
  series: readonly { name: string; values: readonly number[] }[];
  format?: (value: number) => string;
  /** Upper bound for the y scale; defaults to a rounded step above the data. */
  yMax?: number;
  caption?: React.ReactNode;
};

const WIDTH = 640;
const HEIGHT = 300;
const PAD = { top: 12, right: 16, bottom: 28, left: 44 };

/**
 * A small multi-series line chart (one y axis, up to four series), rendered
 * as static SVG. Series identity is carried by a legend and per-point
 * tooltips, never by color alone; a visually hidden table repeats the data.
 */
export function LineChart({ title, labels, series, format = defaultFormat, yMax, caption }: LineChartProps) {
  const top = yMax ?? niceCeil(Math.max(...series.flatMap((s) => [...s.values])));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (labels.length === 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const everyNth = Math.max(1, Math.ceil(labels.length / 8));

  return (
    <Figure caption={caption}>
      {series.length > 1 ? (
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          {series.map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: SERIES[si] }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className={t === 0 ? "stroke-zinc-300 dark:stroke-zinc-700" : "stroke-zinc-950/10 dark:stroke-white/10"}
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              dy="0.32em"
              textAnchor="end"
              fontSize={11}
              className="fill-zinc-500 font-mono tabular-nums"
            >
              {format(t)}
            </text>
          </g>
        ))}
        {labels.map((label, i) =>
          i % everyNth === 0 || i === labels.length - 1 ? (
            <text
              key={label}
              x={x(i)}
              y={HEIGHT - PAD.bottom + 18}
              textAnchor="middle"
              fontSize={11}
              className="fill-zinc-500 font-mono"
            >
              {label}
            </text>
          ) : null,
        )}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={SERIES[si]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={SERIES[si]} className="stroke-white dark:stroke-zinc-950" strokeWidth={2}>
                <title>{`${s.name} — ${labels[i]}: ${format(v)}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
      {/* Wrapper for the same reason as BarChart's: sr-only cannot shrink a table. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Label</th>
              {series.map((s) => (
                <th key={s.name} scope="col">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.name}>{format(s.values[i])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}
