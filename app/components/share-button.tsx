"use client";

import { useEffect, useState } from "react";

type ShareButtonProps = {
  title: string;
};

type ShareState = "idle" | "copied" | "unavailable";

export function ShareButton({ title }: ShareButtonProps) {
  const [state, setState] = useState<ShareState>("idle");

  useEffect(() => {
    if (state === "idle") return;

    const timeout = window.setTimeout(() => setState("idle"), 2500);
    return () => window.clearTimeout(timeout);
  }, [state]);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("unavailable");
    }
  };

  const label = state === "copied" ? "Link copied" : state === "unavailable" ? "Unable to share" : "Share article";

  return (
    <button
      type="button"
      onClick={share}
      aria-label={label}
      aria-live="polite"
      title={label}
      className="relative rounded-full p-2 text-zinc-600 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      <span
        className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4">
        <path d="M15 8a3 3 0 10-2.83-4H12a3 3 0 00.17 1L7.5 7.33a3 3 0 100 5.34L12.17 15A3 3 0 1013 13a3 3 0 00-.17 1l-4.66-2.33a3.02 3.02 0 000-1.34L12.83 8A3 3 0 0015 8z" />
      </svg>
    </button>
  );
}
