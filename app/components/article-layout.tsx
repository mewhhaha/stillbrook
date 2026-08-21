import { Link } from "react-router";
import { articleUpdates } from "virtual:article-updates";
import { formatDate, formatDay, type ArticleMeta } from "../article";
import { FixationToggle } from "./fixation-toggle";
import { ReadingProgress } from "./reading-progress";
import { ShareButton } from "./share-button";
import { ThemeToggle } from "./theme-toggle";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The article's git history summary, when it has been touched after
 * publication. Same-day fixes stay quiet; a later commit to the route
 * folder or hero is what makes an article "updated" — there is no
 * hand-maintained field.
 */
function updateFor(article: ArticleMeta) {
  const update = articleUpdates[`${article.title} ${article.published}`];
  if (!update || update.commits < 2) return undefined;
  if (new Date(update.updated).getTime() - new Date(article.published).getTime() < DAY_MS) return undefined;
  return update;
}

type ArticleLayoutProps = {
  article: ArticleMeta;
  /** Short label like "4 min read" shown next to the date. */
  readingTime?: string;
  children: React.ReactNode;
};

/**
 * The shared shell for every article: reading progress, back link, theme
 * toggle, dateline, title, description, and a footer with author and tags.
 * Articles supply only their content (usually starting with a Prose block)
 * and any custom islands.
 */
export function ArticleLayout({ article, readingTime, children }: ArticleLayoutProps) {
  const update = updateFor(article);
  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-[calc(68ch+3rem)] px-6 py-16 sm:py-24">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <Link
            to="/"
            className="text-base text-orange-700 underline decoration-orange-300 underline-offset-4 sm:text-sm dark:text-orange-400 dark:decoration-orange-700"
          >
            ← All essays
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ShareButton title={article.title} />
            <FixationToggle />
            <ThemeToggle />
          </div>
        </div>
        <header className="mt-12 border-b border-zinc-950/10 pb-10 dark:border-white/10">
          <p className="font-mono text-base text-zinc-500 sm:text-sm">
            <time dateTime={article.published}>{formatDate(article.published)}</time>
            {readingTime ? <> · {readingTime}</> : null}
            {update ? (
              <>
                {" · "}
                <a
                  href={update.historyUrl}
                  className="underline decoration-zinc-300 underline-offset-4 hover:text-zinc-700 dark:decoration-zinc-700 dark:hover:text-zinc-300"
                >
                  Updated <time dateTime={update.updated}>{formatDay(update.updated)}</time>
                </a>
              </>
            ) : null}
          </p>
          <h1 className="mt-5 text-balance font-display text-4xl font-medium tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
            {article.title}
          </h1>
          <p className="mt-6 text-pretty text-lg text-zinc-600 sm:text-base dark:text-zinc-400">{article.description}</p>
        </header>
        {article.image ? (
          <figure className="mt-10">
            <img
              src={article.image.src}
              alt={article.image.alt}
              className="aspect-2/1 w-full rounded-[min(1.5vw,16px)] object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
            />
            <figcaption className="mt-2 text-right font-mono text-xs text-zinc-400 dark:text-zinc-600">
              <a
                href={article.image.credit.href}
                className="hover:text-zinc-600 dark:hover:text-zinc-400"
              >
                {article.image.credit.author}, {article.image.credit.license}
              </a>
            </figcaption>
          </figure>
        ) : null}
        <div className="mt-10">{children}</div>
        <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-zinc-950/10 pt-8 dark:border-white/10">
          <p className="text-base text-zinc-600 sm:text-sm dark:text-zinc-400">Written by {article.author}</p>
          <ul role="list" className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link
                  to={`/#tag-${tag}`}
                  className="block rounded-full border border-zinc-950/10 px-2.5 py-0.5 font-mono text-xs text-zinc-500 hover:border-orange-500 hover:text-orange-700 dark:border-white/10 dark:hover:text-orange-400"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </>
  );
}
