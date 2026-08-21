const variants = {
  note: { label: "Note", accent: "text-zinc-500" },
  tip: { label: "Tip", accent: "text-orange-700 dark:text-orange-400" },
  caution: { label: "Caution", accent: "text-amber-700 dark:text-amber-400" },
} as const;

type CalloutProps = {
  variant?: keyof typeof variants;
  /** Overrides the variant label. */
  title?: string;
  children: React.ReactNode;
};

/** An aside for remarks that support the text without interrupting it. */
export function Callout({ variant = "note", title, children }: CalloutProps) {
  const { label, accent } = variants[variant];
  return (
    <aside className="rounded-xl border border-zinc-950/10 bg-zinc-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-900 dark:inset-ring dark:inset-ring-white/5">
      <p className={`font-mono text-xs uppercase tracking-widest ${accent}`}>{title ?? label}</p>
      <div className="mt-2 [&>*+*]:mt-3">{children}</div>
    </aside>
  );
}
