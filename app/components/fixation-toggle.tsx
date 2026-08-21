"use client";

import { useSyncExternalStore } from "react";

const oneYear = 60 * 60 * 24 * 365;

const readCookie = () => /(?:^|;\s*)fixation=on/.test(document.cookie);

// The cookie only changes through toggle() below, so the store's listeners
// are notified manually after each write.
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Toggles fixation reading — weighted word beginnings that give the eye an
 * anchor per word — for the article's prose, and persists the choice as a
 * cookie so it follows the reader between essays.
 */
export function FixationToggle() {
  const on = useSyncExternalStore(subscribe, readCookie, () => false);

  const toggle = () => {
    const next = !on;
    document.documentElement.dataset.fixation = next ? "true" : "false";
    document.cookie = `fixation=${next ? "on" : "off"}; path=/; max-age=${oneYear}; samesite=lax`;
    for (const listener of listeners) listener();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="Toggle fixation reading"
      title="Fixation reading adds weighted fixation points to each word"
      className={`rounded-full p-2 transition-colors ${
        on
          ? "text-orange-700 dark:text-orange-400"
          : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4">
        <path
          fillRule="evenodd"
          d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
