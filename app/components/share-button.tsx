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

  let label = "Share article";
  if (state === "copied") label = "Link copied";
  if (state === "unavailable") label = "Unable to share";

  return (
    <button
      type="button"
      onClick={share}
      aria-label={label}
      aria-live="polite"
      title={label}
      className="journal-icon-button"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
        <path d="M15 8a3 3 0 10-2.83-4H12a3 3 0 00.17 1L7.5 7.33a3 3 0 100 5.34L12.17 15A3 3 0 1013 13a3 3 0 00-.17 1l-4.66-2.33a3.02 3.02 0 000-1.34L12.83 8A3 3 0 0015 8z" />
      </svg>
    </button>
  );
}
