import { Link } from "react-router";
import { articleUpdates } from "virtual:article-updates";
import { formatDay, type ArticleMeta } from "../article";
import { ArticleHero } from "./article-hero";
import { FixationToggle } from "./fixation-toggle";
import { ReadingProgress } from "./reading-progress";
import { ShareButton } from "./share-button";
import { SiteFooter, SiteHeader } from "./site-shell";

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
 * The shared shell for every article: site navigation, reading progress,
 * reading controls, dateline, title, description, and author and tags.
 * Articles supply only their content (usually starting with a Prose block)
 * and any custom islands.
 */
export function ArticleLayout({ article, readingTime, children }: ArticleLayoutProps) {
  const update = updateFor(article);
  return (
    <>
      <ReadingProgress />
      <SiteHeader />
      <main id="main" className="journal-container">
        <article className="mx-auto max-w-[50rem] pt-8 pb-14 sm:pt-11 sm:pb-24">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <Link to="/#archive" className="journal-link">
              ← All essays
            </Link>
            <div className="flex items-center gap-2">
              <ShareButton title={article.title} />
              <FixationToggle />
            </div>
          </div>
          <header className="mt-9 border-b border-ink/20 pb-8 sm:mt-14">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs text-muted">
              <time dateTime={article.published}>{formatDay(article.published)}</time>
              {readingTime && <span>· {readingTime}</span>}
              {update && (
                <span>
                  {"· "}
                  <a
                    href={update.historyUrl}
                    className="underline decoration-ink/25 underline-offset-4 hover:text-accent"
                  >
                    Updated <time dateTime={update.updated}>{formatDay(update.updated)}</time>
                  </a>
                </span>
              )}
            </p>
            <h1 className="mt-5 text-pretty font-display text-4xl font-normal tracking-tight text-ink sm:text-6xl">
              {article.title}
            </h1>
            <p className="mt-6 max-w-[60ch] text-pretty text-base/7 text-muted">{article.description}</p>
          </header>
          {article.image && (
            <ArticleHero image={article.image} className="mt-10" />
          )}
          <div className="mt-10 max-w-[65ch]">{children}</div>
          <footer className="mt-16 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-5 border-t border-ink/20 pt-7">
            <p className="text-base text-muted sm:text-sm">Written by {article.author}</p>
            <ul role="list" className="flex flex-wrap gap-x-5 gap-y-3">
              {article.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to={`/?topic=${encodeURIComponent(tag)}#archive`}
                    className="journal-link font-mono"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
