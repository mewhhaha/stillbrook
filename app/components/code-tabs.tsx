"use client";

import { Children, useId, useState } from "react";

type CodeTabsProps = {
  labels: readonly string[];
  /** One panel per label, in the same order — typically CodeBlock elements. */
  children: React.ReactNode;
};

/**
 * Tabbed panels for showing variants of the same snippet (pnpm/npm, before/after).
 * Panels arrive pre-rendered from the server; this client island only toggles them.
 */
export function CodeTabs({ labels, children }: CodeTabsProps) {
  const panels = Children.toArray(children);
  const [active, setActive] = useState(0);
  const id = useId();
  const focusTab = (index: number) => {
    const next = (index + labels.length) % labels.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Alternatives" className="flex gap-1">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") focusTab(index + 1);
              if (event.key === "ArrowLeft") focusTab(index - 1);
            }}
            className={`rounded-t-lg px-3.5 py-2 font-mono text-xs transition-colors ${index === active ? "bg-zinc-950 text-zinc-200 dark:bg-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== active}
          className="[&>figure]:rounded-tl-none"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
