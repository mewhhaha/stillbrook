type PullQuoteProps = {
  attribution?: React.ReactNode;
  children: React.ReactNode;
};

/** A centered statement quote for the one line worth slowing down for. */
export function PullQuote({ attribution, children }: PullQuoteProps) {
  return (
    <figure className="border-y border-zinc-950/10 py-10 text-center dark:border-white/10">
      <blockquote className="mx-auto max-w-[28ch] text-balance font-display text-2xl font-medium italic text-zinc-950 sm:text-3xl dark:text-zinc-50">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="mt-4 font-mono text-sm text-zinc-500">— {attribution}</figcaption>
      ) : null}
    </figure>
  );
}
