import { Figure } from "./figure";

type ChoiceOverloadProps = {
  /** The simple ask, quoted verbatim: "I need a safe plugin system." */
  request: string;
  /** The pile of interchangeable answers the asker is confronted with. */
  options: readonly string[];
  caption?: React.ReactNode;
};

/**
 * One plain request facing a wall of options — for when the point is the
 * mismatch between how simple the need is and how many interchangeable
 * answers the ecosystem offers. The punchline belongs in the caption; the
 * figure itself stays quiet: the request as a line, the options as chips.
 */
export function ChoiceOverload({ request, options, caption }: ChoiceOverloadProps) {
  return (
    <Figure caption={caption}>
      <div className="mx-auto max-w-lg">
        <p className="text-center text-sm italic text-zinc-700 dark:text-zinc-300">&ldquo;{request}&rdquo;</p>
        <ul role="list" className="mt-4 flex flex-wrap justify-center gap-2">
          {options.map((option) => (
            <li
              key={option}
              className="rounded-full border border-zinc-950/10 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-400"
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </Figure>
  );
}
