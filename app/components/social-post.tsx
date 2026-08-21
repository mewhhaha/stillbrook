import { formatDate, type ArticleMeta } from "../article";
import { Figure } from "./figure";

export type SocialPostQuote = {
  author: string;
  handle: string;
  href: string;
  text: React.ReactNode;
  avatar?: string;
  verified?: boolean;
};

export type SocialPostMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  href?: string;
};

type SocialPostProps = {
  author: string;
  handle: string;
  href: string;
  publishedAt: ArticleMeta["published"];
  children: React.ReactNode;
  avatar?: string;
  verified?: boolean;
  media?: SocialPostMedia;
  quotedPost?: SocialPostQuote;
  replies?: string;
  likes?: string;
  views?: string;
  caption?: React.ReactNode;
};

/** A sourced X or Bluesky post rendered without third-party scripts. */
export function SocialPost({
  author,
  handle,
  href,
  publishedAt,
  children,
  avatar,
  verified = false,
  media,
  quotedPost,
  replies,
  likes,
  views,
  caption,
}: SocialPostProps) {
  let sourceUrl: URL;
  try {
    sourceUrl = new URL(href);
  } catch {
    throw new Error('social post URL "' + href + '" is not an absolute URL');
  }

  const xHosts = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com"]);
  const platform = xHosts.has(sourceUrl.hostname)
    ? "X"
    : sourceUrl.hostname === "bsky.app" || sourceUrl.hostname === "www.bsky.app"
      ? "Bluesky"
      : null;

  if (!platform) {
    throw new Error('social post URL "' + href + '" must point to X or Bluesky');
  }

  if (platform === "X" && !sourceUrl.pathname.includes("/status/")) {
    throw new Error('X post URL "' + href + '" does not contain a status ID');
  }

  const metrics = [
    replies ? { label: "Replies", value: replies } : null,
    likes ? { label: "Likes", value: likes } : null,
    views ? { label: "Views", value: views } : null,
  ].filter((metric): metric is { label: string; value: string } => metric !== null);

  return (
    <Figure caption={caption}>
      <article className="@container mx-auto flex max-w-[600px] flex-col gap-4 rounded-[min(4vw,var(--radius-xl))] border border-zinc-950/10 bg-white p-4 text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-50 sm:p-5">
        <header className="flex items-start gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              width={200}
              height={200}
              className="size-12 shrink-0 !rounded-full object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10 @lg:size-10"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 @lg:size-10"
            >
              {author.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate font-semibold">{author}</p>
              {verified ? (
                <div
                  role="img"
                  aria-label="Verified account"
                  className="flex size-4 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[0.625rem] font-semibold text-white"
                >
                  ✓
                </div>
              ) : null}
            </div>
            <p className="truncate text-base text-zinc-500 @lg:text-sm">{handle}</p>
          </div>
          <p aria-label={platform} className="shrink-0 text-xl font-medium">
            {platform === "X" ? "X" : "Bluesky"}
          </p>
        </header>

        <blockquote
          cite={href}
          className="flex flex-col gap-4 !font-sans text-pretty text-lg/7 [&_a]:underline [&_a]:decoration-zinc-500/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-zinc-500 @lg:text-base/6"
        >
          {children}
        </blockquote>

        {media ? (
          <a href={media.href ?? href} className="rounded-[min(3vw,var(--radius-lg))]">
            <img
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              className="h-auto w-full !rounded-[inherit] object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            />
          </a>
        ) : null}

        {quotedPost ? (
          <a
            href={quotedPost.href}
            className="flex flex-col gap-3 rounded-[min(3vw,var(--radius-lg))] border border-zinc-950/15 p-3 hover:bg-zinc-950/2 dark:border-white/20 dark:hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2">
              {quotedPost.avatar ? (
                <img
                  src={quotedPost.avatar}
                  alt=""
                  width={200}
                  height={200}
                  className="size-8 shrink-0 !rounded-full object-cover outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10 @lg:size-7"
                />
              ) : null}
              <div className="flex min-w-0 flex-1 items-baseline gap-1">
                <p className="truncate font-semibold">{quotedPost.author}</p>
                {quotedPost.verified ? (
                  <div
                    role="img"
                    aria-label="Verified account"
                    className="flex size-4 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[0.625rem] font-semibold text-white"
                  >
                    ✓
                  </div>
                ) : null}
                <p className="truncate text-base text-zinc-500 @lg:text-sm">
                  {quotedPost.handle}
                </p>
              </div>
            </div>
            <div className="line-clamp-5 text-pretty text-base/7 text-zinc-800 dark:text-zinc-200 @lg:text-sm/6">
              {quotedPost.text}
            </div>
          </a>
        ) : null}

        <footer className="flex flex-col gap-3">
          <p className="tabular-nums text-base text-zinc-500 @lg:text-sm">
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          </p>
          {metrics.length > 0 ? (
            <dl
              className={`grid gap-3 border-y border-zinc-950/10 py-3 text-zinc-500 dark:border-white/10 ${
                metrics.length === 2 ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-wrap items-baseline gap-x-1">
                  <dt className="order-2 text-base @lg:text-sm">{metric.label}</dt>
                  <dd className="order-1 tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                    {metric.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="text-base @lg:text-sm">
            <a
              href={href}
              className="flex min-h-11 w-full items-center justify-center rounded-full border border-zinc-950/20 px-4 py-2 font-semibold text-sky-700 hover:bg-sky-500/5 dark:border-white/25 dark:text-sky-400 dark:hover:bg-sky-400/5"
            >
              View post on {platform}
            </a>
          </div>
        </footer>
      </article>
    </Figure>
  );
}
