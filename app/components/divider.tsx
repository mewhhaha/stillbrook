/** A quiet section break for shifts in topic that don't deserve a heading. */
export function Divider() {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className="flex select-none justify-center gap-4 py-2 text-zinc-400 dark:text-zinc-600"
    >
      <span>·</span>
      <span>·</span>
      <span>·</span>
    </div>
  );
}
