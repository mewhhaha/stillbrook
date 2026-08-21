"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be unavailable (permissions, insecure context); fail quietly.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors ${copied ? "text-emerald-300" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"}`}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
