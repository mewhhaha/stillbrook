import { Link } from "react-router";
import { formatDate } from "../article";
import { articles, articlesByTag } from "../articles.server";
import { ThemeToggle } from "../components";

export function meta() {
  return [
    { title: "Still Brook — Notes on software and craft" },
    { name: "description", content: "Field notes on building software with care." },
  ];
}

export function ServerComponent() {
  const [latest, ...archive] = articles;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="pt-16 sm:pt-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <p className="font-mono text-base text-orange-700 sm:text-sm dark:text-orange-400">
              Independent notes · Warsaw
            </p>
            <h1 className="mt-5 max-w-[20ch] text-balance font-display text-5xl font-medium tracking-tight text-zinc-950 sm:text-6xl dark:text-zinc-50">
              Ideas worth carrying into the work.
            </h1>
            <p className="mt-6 max-w-[55ch] text-pretty text-lg text-zinc-600 sm:text-base dark:text-zinc-400">
              Essays about software, systems, and the quiet decisions that shape what we make.
            </p>
          </div>
        </section>

        {latest ? (
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
              <Link to={latest.href} className="group grid items-center gap-10 md:grid-cols-2">
                {latest.image ? (
                  <img
                    src={latest.image.src}
                    alt=""
                    className="aspect-3/2 w-full rounded-[min(1vw,12px)] object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
                  />
                ) : null}
                <div>
                  <p className="font-mono text-base text-zinc-500 sm:text-sm">
                    Latest essay ·{" "}
                    <time className="tabular-nums" dateTime={latest.published}>
                      {formatDate(latest.published)}
                    </time>
                  </p>
                  <h2 className="mt-4 max-w-[24ch] text-balance font-display text-3xl font-medium tracking-tight text-zinc-950 group-hover:text-orange-800 sm:text-4xl dark:text-zinc-50 dark:group-hover:text-orange-300">
                    {latest.title}
                  </h2>
                  <p className="mt-4 max-w-[58ch] text-pretty text-base text-zinc-600 dark:text-zinc-400">
                    {latest.description}
                  </p>
                  <p className="mt-6 text-base font-medium text-orange-700 sm:text-sm dark:text-orange-400">
                    Read the essay <span aria-hidden="true">→</span>
                  </p>
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        <section id="archive" className="border-t border-zinc-950/10 py-16 sm:py-24 dark:border-white/10">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="font-mono text-base text-zinc-500 uppercase tracking-wide sm:text-sm">
              From the archive
            </h2>
            <ul role="list" className="mt-6 divide-y divide-zinc-950/5 dark:divide-white/5">
              {archive.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={item.href}
                    className="group grid gap-2 py-6 sm:grid-cols-[11rem_1fr_auto] sm:items-baseline sm:gap-6"
                  >
                    <time
                      className="font-mono text-base tabular-nums text-zinc-500 sm:text-sm"
                      dateTime={item.published}
                    >
                      {formatDate(item.published)}
                    </time>
                    <div>
                      <h3 className="text-pretty font-display text-2xl font-medium text-zinc-900 group-hover:text-orange-800 sm:text-xl dark:text-zinc-100 dark:group-hover:text-orange-300">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 max-w-[60ch] text-pretty text-base text-zinc-500 sm:text-sm dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="hidden text-zinc-400 group-hover:text-orange-700 sm:inline dark:text-zinc-600 dark:group-hover:text-orange-400"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {archive.length === 0 ? (
              <p className="mt-8 text-pretty text-base text-zinc-600 dark:text-zinc-400">
                The archive is just getting started.
              </p>
            ) : null}
          </div>
        </section>

        <section className="border-t border-zinc-950/10 py-16 sm:py-24 dark:border-white/10">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="font-mono text-base text-zinc-500 uppercase tracking-wide sm:text-sm">
              Browse by tag
            </h2>
            <div className="mt-8 grid gap-12 md:grid-cols-2">
              {articlesByTag.map(({ tag, articles: taggedArticles }) => (
                <section key={tag} id={`tag-${tag}`} className="scroll-mt-8">
                  <h3 className="font-display text-lg font-medium text-zinc-950 dark:text-zinc-50">
                    {tag}
                    <span className="ml-2 font-mono text-sm font-normal text-zinc-400">
                      {taggedArticles.length}
                    </span>
                  </h3>
                  <ul role="list" className="mt-3 divide-y divide-zinc-950/5 dark:divide-white/5">
                    {taggedArticles.map((item) => (
                      <li key={item.slug}>
                        <Link
                          to={item.href}
                          className="group flex items-baseline justify-between gap-4 py-3.5"
                        >
                          <span className="text-pretty text-base text-zinc-700 group-hover:text-orange-800 sm:text-sm dark:text-zinc-300 dark:group-hover:text-orange-300">
                            {item.title}
                          </span>
                          <span
                            className="text-zinc-300 group-hover:text-orange-700 dark:text-zinc-700 dark:group-hover:text-orange-400"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6 lg:px-8">
        <a
          href="/"
          aria-label="Homepage"
          className="font-display text-xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          Still Brook<span className="text-orange-600 dark:text-orange-500">.</span>
        </a>
        <nav aria-label="Main navigation" className="flex items-center gap-6">
          <a
            href="/#archive"
            className="text-base text-zinc-600 hover:text-zinc-950 sm:text-sm dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Archive
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-zinc-950/10 py-10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 text-base text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:text-sm lg:px-8 dark:text-zinc-400">
        <a href="/" aria-label="Homepage" className="font-display font-normal text-zinc-800 dark:text-zinc-200">
          Still Brook.
        </a>
        <p>Notes made carefully, published occasionally.</p>
      </div>
    </footer>
  );
}
