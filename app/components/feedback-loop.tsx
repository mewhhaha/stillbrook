import { Figure } from "./figure";

export type LoopStep = {
  title: string;
  /** A short line under the title. */
  detail?: React.ReactNode;
};

type FeedbackLoopProps = {
  /** Three to five stages in order; the last one feeds the first. */
  steps: readonly LoopStep[];
  /** What the closing edge carries back, for example "budget recovers". */
  returnLabel: string;
  caption?: React.ReactNode;
};

/**
 * An ordered cycle — stages that feed back into the first one, where the
 * return edge is the point. Renders as FlowSequence's quiet stepper with
 * one addition: an arc from the last stage back to the first, labeled
 * with what travels along it. If the stages never loop, use FlowSequence;
 * a loop drawn only to look dynamic is a FlowSequence in a costume.
 */
export function FeedbackLoop({ steps, returnLabel, caption }: FeedbackLoopProps) {
  const first = steps[0];
  const last = steps[steps.length - 1];
  return (
    <Figure caption={caption}>
      <div style={{ "--steps": steps.length } as React.CSSProperties}>
        <ol className="grid gap-6 sm:grid-cols-[repeat(var(--steps),minmax(0,1fr))] sm:gap-4">
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
              <div className="pb-1 sm:mt-3 sm:pb-0">
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{step.title}</p>
                {step.detail ? (
                  <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">{step.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <div
          aria-hidden="true"
          className="relative mt-4 hidden h-9 sm:block"
          style={{ marginInline: "calc(100% / (var(--steps) * 2) - 0.5rem)" }}
        >
          <div className="absolute inset-0 rounded-b-xl border-x border-b border-zinc-950/10 dark:border-white/10" />
          <span className="absolute -top-1 left-0 -translate-x-1/2 text-[10px] leading-none text-zinc-400 dark:text-zinc-500">
            ▲
          </span>
          <span className="absolute inset-x-0 -bottom-2 mx-auto w-fit bg-white px-2 font-mono text-xs text-zinc-500 dark:bg-zinc-950">
            {returnLabel}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-600 sm:sr-only dark:text-zinc-400">
          <span aria-hidden="true">↺ </span>
          After &quot;{last.title}&quot;: {returnLabel} — back to &quot;{first.title}&quot;.
        </p>
      </div>
    </Figure>
  );
}
