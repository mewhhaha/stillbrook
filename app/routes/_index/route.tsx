import { Form, Link, unstable_getRequest } from "react-router";
import { formatDay } from "../../article";
import { articles, articlesByTag } from "../../articles.server";
import { ArticleHero } from "../../components/article-hero";
import { SiteFooter, SiteHeader } from "../../components/site-shell";

export function meta() {
  return [
    { title: "Still Brook — Notes on software and craft" },
    { name: "description", content: "A field journal about software, systems, and the things we make." },
  ];
}

const pageSize = 12;

export function ServerComponent() {
  const request = unstable_getRequest();
  const params = new URL(request.url).searchParams;
  const theme = request.headers.get("cookie")?.match(/(?:^|;\s*)theme=(dark|light)(?:;|$)/)?.[1];
  let darkImageMedia = "(prefers-color-scheme: dark)";
  if (theme === "dark") darkImageMedia = "all";
  if (theme === "light") darkImageMedia = "not all";
  const topic = params.get("topic") ?? "";
  const query = params.get("q") ?? "";
  const terms = query.trim().toLocaleLowerCase();
  const matches = articles.filter((article) => {
    if (topic && !article.tags.includes(topic)) return false;
    return `${article.title} ${article.description} ${article.author} ${article.tags.join(" ")}`.toLocaleLowerCase().includes(terms);
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  let page = Number(params.get("page") ?? 1);
  if (!Number.isSafeInteger(page) || page < 1) page = 1;
  page = Math.min(page, pageCount);
  const offset = (page - 1) * pageSize;
  const visible = matches.slice(offset, offset + pageSize);
  const latest = articles[0];
  let archiveCount = `${articles.length} essays`;
  if (topic || terms) archiveCount = `${matches.length} of ${articles.length} essays`;

  function archiveUrl(nextTopic = topic, nextPage = 1) {
    const next = new URLSearchParams();
    if (nextTopic) next.set("topic", nextTopic);
    if (query) next.set("q", query);
    if (nextPage > 1) next.set("page", String(nextPage));
    let path = "/";
    if (next.size) path += `?${next}`;
    return `${path}#archive`;
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="journal-container">
        <h1 className="journal-masthead">Still Brook<span className="text-accent">.</span></h1>
        <section aria-label="About this journal" className="grid items-center gap-4 pb-8 md:grid-cols-[5fr_7fr] md:gap-10">
          <div className="grid justify-items-start gap-6 py-4 md:pb-8">
            <p className="journal-kicker text-muted">Observations &amp; other curiosities</p>
            <h2 className="max-w-[18ch] text-balance font-display text-4xl font-normal tracking-tight lg:text-5xl">
              Notes on software<br />and the things<br className="max-md:hidden" /> <em>we make.</em>
            </h2>
            <Link to="/#archive" className="journal-link">Open the notebook <span aria-hidden="true">↘</span></Link>
          </div>
          <figure className="min-w-0">
            <picture className="journal-specimen block">
              <source data-dark-image srcSet="/images/journal/brook-machine-dark.webp" media={darkImageMedia} />
              <img
                src="/images/journal/brook-machine.webp"
                width="1536" height="1024" fetchPriority="high"
                alt="An engraved computer on spindly legs beside a brook, with a bird, a leafy twig, and a curling paper tape."
                className="w-full mix-blend-multiply dark:mix-blend-normal"
              />
            </picture>
            <figcaption className="flex justify-between gap-4 pt-2 font-mono text-xs text-muted">
              <span>Fig. 01 — A machine for wandering thoughts.</span><span aria-hidden="true">↳</span>
            </figcaption>
          </figure>
        </section>

        {latest && (
          <section aria-labelledby="featured-title" className="grid gap-6 border-y border-ink/70 py-8 md:grid-cols-[7rem_1fr] md:gap-10 lg:grid-cols-[10rem_1fr_16rem]">
            <div className="flex items-start justify-between gap-4 md:flex-col md:border-r md:border-ink/20">
              <p className="journal-kicker text-accent">Latest essay</p>
              <p className="font-mono text-xs text-muted"><time dateTime={latest.published}>{formatDay(latest.published)}</time></p>
              <p className="mt-auto text-5xl text-accent max-md:hidden" aria-hidden="true">✳</p>
            </div>
            <div className="grid content-center justify-items-start gap-4">
              <h2 id="featured-title" className="max-w-[27ch] text-pretty font-display text-3xl font-normal tracking-tight lg:text-4xl">
                <Link to={latest.href}>{latest.title}</Link>
              </h2>
              <p className="max-w-[55ch] text-pretty text-base text-muted sm:text-sm">{latest.description}</p>
              <Link className="journal-link" to={latest.href}>Read the essay <span aria-hidden="true">→</span></Link>
            </div>
            {latest.image && (
              <ArticleHero image={latest.image} href={latest.href} linkLabel={`Read ${latest.title}`} className="grid content-center md:col-start-2 lg:col-start-auto" />
            )}
          </section>
        )}

        <section id="archive" aria-labelledby="archive-title" className="scroll-mt-8 pt-10 sm:pt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="archive-title" className="font-display text-3xl font-normal tracking-tight">Pages from the notebook</h2>
            <p className="font-mono text-xs text-muted">{archiveCount}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-b border-ink/20 md:flex-row md:items-center md:justify-between md:gap-8">
            <nav aria-label="Filter essays by topic" className="flex min-w-0 gap-6 overflow-x-auto text-base sm:text-sm">
              <Link className="journal-topic" aria-current={!topic && "page"} to={archiveUrl("")}>All essays</Link>
              {articlesByTag.map(({ tag }) => (
                <Link key={tag} id={`tag-${tag}`} className="journal-topic capitalize" aria-current={topic === tag && "page"} to={archiveUrl(tag)}>{tag}</Link>
              ))}
            </nav>
            <Form key={`${topic}:${query}`} role="search" method="get" action="/#archive" preventScrollReset className="flex min-w-0 items-center gap-2 md:w-60">
              {topic && <input type="hidden" name="topic" value={topic} />}
              <label htmlFor="essay-search" className="sr-only">Search essays</label>
              <input id="essay-search" name="q" type="search" defaultValue={query} placeholder="Find a thought…" className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-base placeholder:text-muted sm:text-sm" />
              <button type="submit" aria-label="Search essays" className="journal-icon-button shrink-0">↗</button>
            </Form>
          </div>
          <p className="sr-only" role="status" aria-live="polite">{matches.length} essays found. Page {page} of {pageCount}.</p>
          <ol role="list" className="divide-y divide-ink/20 border-b border-ink/20">
            {visible.map((article, index) => (
              <li key={article.slug}>
                <Link to={article.href} className="group grid grid-cols-[1.8rem_1fr_1rem] items-center gap-x-3 gap-y-3 py-6 sm:grid-cols-[4rem_1fr_7rem_1rem] sm:gap-x-6">
                  <p className="self-start pt-1 font-mono text-xs text-accent tabular-nums" aria-hidden="true">{String(offset + index + 1).padStart(2, "0")}</p>
                  <div className="min-w-0">
                    <h3 className="text-pretty font-display text-2xl font-normal tracking-tight text-ink group-hover:text-accent sm:text-xl">{article.title}</h3>
                    <p className="mt-2 max-w-[78ch] text-pretty text-sm text-muted max-sm:hidden">{article.description}</p>
                  </div>
                  <p className="col-start-2 font-mono text-xs text-muted tabular-nums sm:col-start-auto sm:text-right"><time dateTime={article.published}>{formatDay(article.published)}</time></p>
                  <span aria-hidden="true" className="col-start-3 row-start-1 justify-self-end text-muted group-hover:text-accent sm:col-start-auto sm:row-start-auto">↗</span>
                </Link>
              </li>
            ))}
          </ol>
          {matches.length === 0 && (
            <div className="grid justify-items-start gap-3 py-10">
              <p>No essays found. Try another word.</p>
              <Link className="journal-link" to="/#archive">Show all essays →</Link>
            </div>
          )}
          {pageCount > 1 && (
            <nav aria-label="Archive pages" className="flex flex-wrap items-center justify-between gap-4 py-6 text-base sm:text-sm">
              <p className="font-mono text-xs text-muted">Page {page} of {pageCount}</p>
              <div className="flex items-center gap-6">
                {page > 1 && <Link className="journal-link" to={archiveUrl(topic, page - 1)}>← Newer essays</Link>}
                {page < pageCount && <Link className="journal-link" to={archiveUrl(topic, page + 1)}>Older essays →</Link>}
              </div>
            </nav>
          )}
        </section>

        <section id="about" aria-labelledby="about-title" className="grid gap-5 py-12 md:grid-cols-[7rem_1fr] md:gap-x-10 lg:grid-cols-[10rem_1fr] sm:py-16">
          <p className="journal-kicker text-accent md:row-span-2 md:max-w-[13ch] md:pt-2">A note in the margin</p>
          <h2 id="about-title" className="text-balance font-display text-3xl font-normal tracking-tight">A little curiosity goes a long way.</h2>
          <p className="max-w-[55ch] text-pretty text-base text-muted md:col-start-2">Still Brook is an independent journal about software, systems, and the quiet decisions that shape what we make.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
