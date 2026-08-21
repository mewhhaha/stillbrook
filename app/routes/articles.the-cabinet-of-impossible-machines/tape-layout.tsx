import { Figure } from "../../components";

const tapeRegions = [
  { address: "0", name: "Halt flag", className: "bg-orange-500/10" },
  { address: "1", name: "Description bank", className: "bg-zinc-950/3 dark:bg-white/3" },
  { address: "2 …", name: "State width and transition cards", className: "bg-orange-500/5" },
  { address: "…", name: "Mutable data pointer", className: "bg-zinc-950/3 dark:bg-white/3" },
  { address: "…", name: "Data and tagged input bits", className: "bg-orange-500/5" },
] as const;

export function TapeLayout() {
  return (
    <Figure caption="The machine description and its working data occupy contiguous regions of one tape. A write crossing a region boundary can change what the next transition means.">
      <div className="overflow-x-auto [scrollbar-color:var(--color-zinc-300)_transparent] [scrollbar-width:thin] dark:[scrollbar-color:var(--color-zinc-700)_transparent]">
        <div className="grid min-w-[42rem] grid-cols-[2fr_4fr_7fr_4fr_6fr] border-y border-zinc-950/10 dark:border-white/10">
          {tapeRegions.map((region, index) => (
            <div
              key={region.name}
              className={`min-w-0 px-3 py-4 not-first:border-l not-first:border-zinc-950/10 dark:not-first:border-white/10 ${region.className}`}
            >
              <p className="font-mono text-xs tabular-nums text-orange-700 dark:text-orange-400">
                {region.address}
              </p>
              <p className="mt-1 break-words text-sm text-zinc-700 dark:text-zinc-300">{region.name}</p>
              {index === 1 ? (
                <p className="mt-1 text-xs text-zinc-500">Even or odd lane</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Figure>
  );
}
