type ProseProps = {
  className?: string;
  children: React.ReactNode;
};

/** The article measure: typographic rhythm and a comfortable line length. */
export function Prose({ className, children }: ProseProps) {
  return <div className={className ? `prose ${className}` : "prose"}>{children}</div>;
}
