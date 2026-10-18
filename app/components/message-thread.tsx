import { Figure } from "./figure";
import { KuwaharaImage } from "./kuwahara-image";

export type ThreadMessage = {
  from: string;
  text: React.ReactNode;
  /** Optional avatar image for the sender; falls back to their initial. */
  avatar?: string;
};

type MessageThreadProps = {
  /** Messages in order. The first sender sits left; everyone else sits right. */
  messages: readonly ThreadMessage[];
  caption?: React.ReactNode;
};

/** Per-sender name/avatar colors, assigned by first appearance. The chart
 * palette is CVD-validated and theme-aware, so names stay readable in both
 * modes. */
const SENDER_COLORS = [
  "var(--chart-1)",
  "var(--chart-6)",
  "var(--chart-2)",
  "var(--chart-5)",
  "var(--chart-8)",
  "var(--chart-3)",
] as const;

/**
 * A short exchange rendered like a group chat: an avatar circle where the
 * message comes from, the sender's name bolded in their color at the top of
 * the bubble, and the message below. Use it when the turn-taking itself
 * carries the point, and keep it to a few turns — a transcript is a quote,
 * not a log dump.
 */
export function MessageThread({ messages, caption }: MessageThreadProps) {
  const senders = [...new Set(messages.map((message) => message.from))];
  const colorOf = (from: string) => SENDER_COLORS[senders.indexOf(from) % SENDER_COLORS.length];
  const firstSender = messages[0]?.from;

  return (
    <Figure caption={caption}>
      <div role="log" className="mx-auto flex max-w-md flex-col gap-4">
        {messages.map((message, i) => {
          const left = message.from === firstSender;
          const firstOfRun = i === 0 || messages[i - 1].from !== message.from;
          const color = colorOf(message.from);
          return (
            <div
              key={i}
              className={`flex max-w-[88%] items-start gap-2.5 ${
                left ? "self-start" : "flex-row-reverse self-end"
              } ${firstOfRun ? "" : "-mt-3"}`}
            >
              {firstOfRun ? (
                message.avatar ? (
                  <KuwaharaImage src={message.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-medium text-white"
                    style={{ background: color }}
                  >
                    {message.from.slice(0, 1).toUpperCase()}
                  </span>
                )
              ) : (
                <span aria-hidden="true" className="size-8 shrink-0" />
              )}
              <div
                className={`rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800 ${
                  firstOfRun ? (left ? "rounded-tl-sm" : "rounded-tr-sm") : ""
                }`}
              >
                {firstOfRun ? (
                  <p className="text-sm font-semibold" style={{ color }}>
                    {message.from}
                  </p>
                ) : null}
                <p className={`text-base text-zinc-800 sm:text-sm dark:text-zinc-200 ${firstOfRun ? "mt-0.5" : ""}`}>
                  {message.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Figure>
  );
}
