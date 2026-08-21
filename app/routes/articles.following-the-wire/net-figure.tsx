import { Figure } from "../../components";

const WIRE = "stroke-zinc-400 dark:stroke-zinc-500";
const NODE = "stroke-zinc-300 dark:stroke-zinc-700";
const PORT = "fill-zinc-400 dark:fill-zinc-500";
const NAME = "fill-zinc-700 font-mono dark:fill-zinc-300";

/**
 * The essay's one worked interaction, drawn as the net it denotes: the active
 * pair (a a) ~ (42 out) before annihilation, and the single surviving wire
 * after. Triangles are constructor nodes, the apex is the principal port, and
 * the base corners are the auxiliary ports.
 */
export function AnnihilationNet() {
  return (
    <Figure caption="One annihilation: both nodes vanish and their corresponding auxiliary ports link pairwise, leaving 42 wired to out.">
      <div className="overflow-x-auto [scrollbar-color:var(--color-zinc-300)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:var(--color-zinc-700)_transparent]">
        <svg
          viewBox="0 0 640 190"
          role="img"
          aria-label="Before, two triangular nodes meet at their principal ports: the left node's two auxiliary ports are joined to each other by a wire named a, and the right node's auxiliary ports lead to 42 and out. After, both nodes are gone and one wire connects 42 to out."
          className="w-full min-w-[36rem]"
        >
        <text x={190} y={22} textAnchor="middle" fontSize={11} className="fill-zinc-500 font-mono">
          before
        </text>
        <text x={512} y={22} textAnchor="middle" fontSize={11} className="fill-zinc-500 font-mono">
          after
        </text>

        <polygon points="112,72 162,100 112,128" fill="none" strokeLinejoin="round" className={NODE} />
        <polygon points="268,72 218,100 268,128" fill="none" strokeLinejoin="round" className={NODE} />
        <line x1={162} y1={100} x2={218} y2={100} strokeWidth={1.5} style={{ stroke: "var(--chart-1)" }} />
        <text x={190} y={90} textAnchor="middle" fontSize={12} className="font-mono" style={{ fill: "var(--chart-1)" }}>
          ~
        </text>
        <circle cx={162} cy={100} r={2.5} style={{ fill: "var(--chart-1)" }} />
        <circle cx={218} cy={100} r={2.5} style={{ fill: "var(--chart-1)" }} />
        <path d="M 112 72 C 70 72 70 128 112 128" fill="none" className={WIRE} />
        <text x={62} y={104} textAnchor="middle" fontSize={12} className={NAME}>
          a
        </text>
        <line x1={268} y1={72} x2={292} y2={72} className={WIRE} />
        <line x1={268} y1={128} x2={292} y2={128} className={WIRE} />
        <text x={298} y={76} fontSize={12} className={NAME}>
          42
        </text>
        <text x={298} y={132} fontSize={12} className={NAME}>
          out
        </text>
        <circle cx={112} cy={72} r={2} className={PORT} />
        <circle cx={112} cy={128} r={2} className={PORT} />
        <circle cx={268} cy={72} r={2} className={PORT} />
        <circle cx={268} cy={128} r={2} className={PORT} />
        <text x={137} y={156} textAnchor="middle" fontSize={11} className="fill-zinc-500 font-mono">
          (a a)
        </text>
        <text x={243} y={156} textAnchor="middle" fontSize={11} className="fill-zinc-500 font-mono">
          (42 out)
        </text>

        <line x1={322} y1={100} x2={344} y2={100} className={WIRE} />
        <path d="M 338 95 L 346 100 L 338 105" fill="none" className={WIRE} />

        <path d="M 596 72 H 452 C 410 72 410 128 452 128 H 596" fill="none" className={WIRE} />
        <circle cx={596} cy={72} r={2} className={PORT} />
        <circle cx={596} cy={128} r={2} className={PORT} />
        <text x={602} y={76} fontSize={12} className={NAME}>
          42
        </text>
        <text x={602} y={132} fontSize={12} className={NAME}>
          out
        </text>
        </svg>
      </div>
    </Figure>
  );
}
