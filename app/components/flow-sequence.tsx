import { Figure } from "./figure";

export type FlowStep = {
  /** Small tag above the title, for example "Then" or "Intent". */
  label?: string;
  title: string;
  /** A short line or a few short items shown under the title. */
  detail?: React.ReactNode;
  items?: readonly string[];
};

type FlowSequenceProps = {
  /** Two to five stages in order. */
  steps: readonly FlowStep[];
  caption?: React.ReactNode;
};

/**
 * An ordered progression — a pipeline, a before/now/next arc, a request
 * moving through stages. Renders as a quiet stepper: numbered dots on a
 * connecting hairline, not boxes with arrows. Reach for it when order is
 * the point; if the stages have no direction, use Compare instead.
 *
 * Give each step at most two text levels — a title plus one of label,
 * detail, or items. A number followed by three tiers of text reads as
 * noise, not sequence.
 */
export function FlowSequence({ steps, caption }: FlowSequenceProps) {
  return (
    <Figure caption={caption}>
      <ol className="grid gap-6 sm:grid-cols-[repeat(var(--steps),minmax(0,1fr))] sm:gap-4" style={{ "--steps": steps.length } as React.CSSProperties}>
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 sm:block">
            <div className="flex flex-col items-center sm:flex-row sm:items-center" aria-hidden="true">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-orange-600/40 bg-white font-mono text-xs text-orange-700 dark:bg-zinc-950 dark:text-orange-400">
                {i + 1}
              </span>
              {i < steps.length - 1 ? (
                <span className="mt-1 w-px grow bg-zinc-950/10 sm:-mr-4 sm:ml-2 sm:mt-0 sm:h-px sm:w-auto dark:bg-white/10" />
              ) : null}
            </div>
            <div className="pb-2 sm:mt-3 sm:pb-0">
              {step.label ? (
                <p className="font-mono text-xs uppercase tracking-wide text-zinc-500">{step.label}</p>
              ) : null}
              <p className={`text-sm font-semibold text-zinc-950 dark:text-zinc-50 ${step.label ? "mt-1" : ""}`}>
                {step.title}
              </p>
              {step.detail ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.detail}</p> : null}
              {step.items ? (
                <ul className="mt-1.5 space-y-0.5 font-mono text-xs text-zinc-500">
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  );
}
