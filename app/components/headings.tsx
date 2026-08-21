type HeadingProps = {
  /** Overrides the slug derived from the heading text. */
  id?: string;
  children: React.ReactNode;
};

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

function slugify(node: React.ReactNode): string {
  return textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Anchored({ as: Tag, id, children }: HeadingProps & { as: "h2" | "h3" }) {
  const slug = id ?? slugify(children);
  if (!slug) return <Tag>{children}</Tag>;
  return (
    <Tag id={slug} className="group scroll-mt-20">
      {children}
      <a
        href={`#${slug}`}
        aria-label="Link to this section"
        className="ml-2 text-orange-400 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        #
      </a>
    </Tag>
  );
}

/** Section headings with hover-revealed anchor links. Typography comes from the prose styles. */
export function H2(props: HeadingProps) {
  return <Anchored as="h2" {...props} />;
}

export function H3(props: HeadingProps) {
  return <Anchored as="h3" {...props} />;
}
