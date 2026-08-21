"use client";

const oneYear = 60 * 60 * 24 * 365;

/**
 * Toggles between light and dark and persists the choice as a cookie override.
 * Without a cookie the site follows the system preference; the first click
 * flips away from whatever is currently showing. The icon swap is pure CSS,
 * driven by the same dark variant as the rest of the page.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    document.cookie = `theme=${next}; path=/; max-age=${oneYear}; samesite=lax`;
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark mode"
      className="rounded-full border border-zinc-950/10 p-2 text-zinc-600 transition-colors hover:text-zinc-950 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4 dark:hidden">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="hidden size-4 dark:block">
        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
      </svg>
    </button>
  );
}
