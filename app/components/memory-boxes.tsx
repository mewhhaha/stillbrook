import { Figure } from "./figure";

export type MemoryBox = {
  /** Stable identifier other boxes can point at. */
  id: string;
  /** Header line, for example "next: Closure". */
  label: string;
  fields: readonly {
    name: string;
    /** Shown as `name: value`; omit when the field is only a pointer. */
    value?: string;
    /** Id of the box this field references; drawn as an arrow. */
    pointsTo?: string;
  }[];
};

type MemoryBoxesProps = {
  /** One-sentence summary of what the diagram shows, for assistive tech. */
  title: string;
  boxes: readonly MemoryBox[];
  caption?: React.ReactNode;
};

const CH = 7.3;
const FIELD_H = 20;
const HEADER_H = 26;
const BOX_PAD_X = 10;
const BOX_GAP_Y = 24;
const COL_GAP = 64;
const MARGIN = 8;

/**
 * Records with named fields and pointer arrows between them, rendered as
 * static SVG. Reach for it when sharing or indirection is the point — two
 * closures holding one environment, a value boxed behind an erased type.
 * The schema is deliberately rigid: records, fields, arrows, nothing else.
 * If the picture needs free-form shapes or prose inside nodes, it is not a
 * memory diagram; write it as prose or find the form that fits. Keep field
 * names and values to a few words — SVG text does not wrap.
 */
export function MemoryBoxes({ title, boxes, caption }: MemoryBoxesProps) {
  const byId = new Map(boxes.map((b) => [b.id, b]));
  for (const box of boxes) {
    for (const field of box.fields) {
      if (field.pointsTo && !byId.has(field.pointsTo)) {
        throw new Error(`MemoryBoxes: field "${box.id}.${field.name}" points to unknown box "${field.pointsTo}"`);
      }
    }
  }

  // Column = pointer depth: a box sits one column right of the deepest box
  // that references it, so arrows always travel left to right.
  const depth = new Map(boxes.map((b) => [b.id, 0]));
  for (let pass = 0; pass < boxes.length; pass += 1) {
    for (const box of boxes) {
      for (const field of box.fields) {
        if (!field.pointsTo) continue;
        const wanted = (depth.get(box.id) ?? 0) + 1;
        if ((depth.get(field.pointsTo) ?? 0) < wanted) depth.set(field.pointsTo, wanted);
      }
    }
  }

  const columnCount = Math.max(...[...depth.values()]) + 1;
  const columns: MemoryBox[][] = Array.from({ length: columnCount }, () => []);
  for (const box of boxes) columns[depth.get(box.id) ?? 0].push(box);

  const fieldText = (f: MemoryBox["fields"][number]) => (f.value ? `${f.name}: ${f.value}` : f.name);
  const boxWidth = (b: MemoryBox) =>
    Math.max(b.label.length, ...b.fields.map((f) => fieldText(f).length + (f.pointsTo ? 2 : 0))) * CH + BOX_PAD_X * 2;
  const boxHeight = (b: MemoryBox) => HEADER_H + b.fields.length * FIELD_H;

  const colWidths = columns.map((col) => Math.max(...col.map(boxWidth)));
  const colX = colWidths.map((_, i) => MARGIN + colWidths.slice(0, i).reduce((a, w) => a + w + COL_GAP, 0));
  const colHeights = columns.map((col) => col.reduce((a, b) => a + boxHeight(b), 0) + (col.length - 1) * BOX_GAP_Y);
  const height = Math.max(...colHeights) + MARGIN * 2;
  const width = MARGIN * 2 + colWidths.reduce((a, w) => a + w, 0) + COL_GAP * (columnCount - 1);

  const position = new Map<string, { x: number; y: number; w: number; h: number }>();
  columns.forEach((col, ci) => {
    let y = MARGIN + (height - MARGIN * 2 - colHeights[ci]) / 2;
    for (const box of col) {
      position.set(box.id, { x: colX[ci], y, w: colWidths[ci], h: boxHeight(box) });
      y += boxHeight(box) + BOX_GAP_Y;
    }
  });

  const arrows = boxes.flatMap((box) =>
    box.fields.flatMap((field, fi) => {
      if (!field.pointsTo) return [];
      const from = position.get(box.id)!;
      const to = position.get(field.pointsTo)!;
      const y1 = from.y + HEADER_H + fi * FIELD_H + FIELD_H / 2;
      const y2 = to.y + HEADER_H / 2;
      const x1 = from.x + from.w;
      const x2 = to.x - 7;
      const bend = (x2 - x1) / 2;
      return [{ key: `${box.id}.${field.name}`, x1, y1, x2, y2, bend }];
    }),
  );

  return (
    <Figure caption={caption}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
        className="mx-auto w-full"
        style={{ maxWidth: width * 1.15 }}
      >
        <defs>
          <marker id="memory-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0.5 L7.5,4 L0,7.5 Z" className="fill-zinc-500 dark:fill-zinc-400" />
          </marker>
        </defs>
        {boxes.map((box) => {
          const p = position.get(box.id)!;
          return (
            <g key={box.id}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={8}
                className="fill-white stroke-zinc-300 dark:fill-zinc-900 dark:stroke-zinc-700"
              />
              <line
                x1={p.x}
                x2={p.x + p.w}
                y1={p.y + HEADER_H}
                y2={p.y + HEADER_H}
                className="stroke-zinc-200 dark:stroke-zinc-800"
              />
              <text
                x={p.x + BOX_PAD_X}
                y={p.y + HEADER_H / 2}
                dy="0.34em"
                fontSize={12}
                fontWeight={600}
                className="fill-zinc-950 font-mono dark:fill-zinc-50"
              >
                {box.label}
              </text>
              {box.fields.map((field, fi) => {
                const rowY = p.y + HEADER_H + fi * FIELD_H + FIELD_H / 2;
                return (
                  <g key={field.name}>
                    <text
                      x={p.x + BOX_PAD_X}
                      y={rowY}
                      dy="0.34em"
                      fontSize={12}
                      className="fill-zinc-600 font-mono dark:fill-zinc-400"
                    >
                      {fieldText(field)}
                    </text>
                    {field.pointsTo ? (
                      <circle cx={p.x + p.w - BOX_PAD_X} cy={rowY} r={2.5} className="fill-zinc-500 dark:fill-zinc-400" />
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}
        {arrows.map((a) => (
          <path
            key={a.key}
            d={`M ${a.x1 - BOX_PAD_X} ${a.y1} C ${a.x1 + a.bend} ${a.y1}, ${a.x1 + a.bend} ${a.y2}, ${a.x2} ${a.y2}`}
            fill="none"
            markerEnd="url(#memory-arrow)"
            className="stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth={1.25}
          />
        ))}
      </svg>
      <div className="sr-only">
        <p>{title}</p>
        <ul>
          {boxes.map((box) => (
            <li key={box.id}>
              {box.label}:{" "}
              {box.fields
                .map((f) => (f.pointsTo ? `${f.name} points to ${byId.get(f.pointsTo)!.label}` : fieldText(f)))
                .join("; ")}
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}
