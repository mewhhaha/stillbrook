type FigureProps = {
  caption?: React.ReactNode;
  children: React.ReactNode;
};

/** Wraps an image, demo, or diagram with a consistent caption treatment. */
export function Figure({ caption, children }: FigureProps) {
  return (
    <figure>
      {children}
      {caption ? (
        <figcaption className="mt-3 text-center font-mono text-xs text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
