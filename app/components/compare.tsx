import { Figure } from "./figure";

export type CompareEntity = {
  /** Column heading, for example "Frontier" or "Production". */
  name: string;
  /** Values aligned with the `attributes` labels by index. */
  values: readonly React.ReactNode[];
};

type CompareProps = {
  /** Row labels, for example ["Examples", "Rhythm", "Success"]. */
  attributes: readonly string[];
  /** Two to four entities to contrast across the same attributes. */
  entities: readonly CompareEntity[];
  caption?: React.ReactNode;
};

/**
 * A contrast of two to four things across the same named attributes — the
 * honest form of the "two cards side by side" figure. Renders as a quiet
 * table: entities as columns, attributes as rows, so the eye can compare
 * along a row instead of jumping between boxes.
 */
export function Compare({ attributes, entities, caption }: CompareProps) {
  return (
    <Figure caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <td className="border-b border-zinc-950/20 dark:border-white/20" />
              {entities.map((entity) => (
                <th
                  key={entity.name}
                  scope="col"
                  className="border-b border-zinc-950/20 px-3 py-2 text-left align-bottom font-mono text-xs uppercase tracking-widest text-orange-700 dark:border-white/20 dark:text-orange-400"
                >
                  {entity.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attribute, ai) => (
              <tr key={attribute}>
                <th
                  scope="row"
                  className="border-b border-zinc-950/5 py-2 pr-3 text-left align-top text-sm font-normal text-zinc-500 dark:border-white/5"
                >
                  {attribute}
                </th>
                {entities.map((entity) => (
                  <td
                    key={entity.name}
                    className="border-b border-zinc-950/5 px-3 py-2 align-top text-zinc-800 dark:border-white/5 dark:text-zinc-200"
                  >
                    {entity.values[ai]}
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
