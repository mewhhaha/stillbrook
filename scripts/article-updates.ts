import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Plugin } from "vite";

const REPO_COMMITS_URL = "https://github.com/mewhhaha/stillbrook/commits/main";

type ArticleUpdate = {
  /** Committer date of the newest commit touching the article, UTC. */
  updated: string;
  /** Commits that have touched the article's folder or hero, including the one that added it. */
  commits: number;
  /** GitHub history page for the article's route folder. */
  historyUrl: string;
};

/**
 * Serves `virtual:article-updates`: a map from `${title} ${published}`
 * to each article's git history summary, computed at build time. The site
 * runs on Workers with no filesystem, so this is the only moment the data
 * can be read; a shallow clone (CI without fetch-depth: 0) silently
 * undercounts, which is why the workflow checks out full history.
 */
export function articleUpdates(): Plugin {
  const id = "virtual:article-updates";
  const resolved = `\0${id}`;
  return {
    name: "article-updates",
    resolveId(source) {
      return source === id ? resolved : undefined;
    },
    load(source) {
      if (source !== resolved) return undefined;
      return `export const articleUpdates = ${JSON.stringify(collectArticleUpdates(process.cwd()))};`;
    },
  };
}

function collectArticleUpdates(root: string): Record<string, ArticleUpdate> {
  const routesDir = join(root, "app", "routes");
  const slugs = readdirSync(routesDir)
    .filter((name) => name.startsWith("articles."))
    .map((name) => name.slice("articles.".length));
  const bySlug = new Map<string, { updated: string; commits: number }>();

  const log = execFileSync(
    "git",
    ["log", "--format=%x01%cI", "--name-only", "--", "app/routes/articles.*", "public/images/articles"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  // git log emits newest first: the first commit that names a slug carries
  // its latest update; later hits only raise the count. One commit counts
  // once per slug however many of its files it touched.
  let commitDate = "";
  let seenInCommit = new Set<string>();
  for (const line of log.split("\n")) {
    if (line.startsWith("\x01")) {
      commitDate = line.slice(1);
      seenInCommit = new Set();
      continue;
    }
    const slug = slugForPath(line, slugs);
    if (!slug || seenInCommit.has(slug)) continue;
    seenInCommit.add(slug);
    const entry = bySlug.get(slug);
    if (entry) entry.commits += 1;
    else bySlug.set(slug, { updated: toUtcSeconds(commitDate), commits: 1 });
  }

  const updates: Record<string, ArticleUpdate> = {};
  for (const slug of slugs) {
    const entry = bySlug.get(slug);
    if (!entry) continue;
    const source = readFileSync(join(routesDir, `articles.${slug}`, "route.tsx"), "utf8");
    const title = /title:\s*"([^"]+)"/.exec(source)?.[1];
    const published = /published:\s*"([^"]+)"/.exec(source)?.[1];
    if (!title || !published) continue;
    updates[`${title} ${published}`] = {
      ...entry,
      historyUrl: `${REPO_COMMITS_URL}/app/routes/articles.${slug}`,
    };
  }
  return updates;
}

function slugForPath(path: string, slugs: readonly string[]): string | undefined {
  const routeMatch = /^app\/routes\/articles\.([^/]+)\//.exec(path);
  if (routeMatch) return routeMatch[1];
  const imageMatch = /^public\/images\/articles\/([^/]+)\.[a-z0-9]+$/i.exec(path);
  if (!imageMatch) return undefined;
  // Heroes are named <slug>.<ext>; extra images like <slug>-<name>.gif
  // attribute to the longest slug that prefixes the basename.
  const base = imageMatch[1];
  let best: string | undefined;
  for (const slug of slugs) {
    if (base !== slug && !base.startsWith(`${slug}-`)) continue;
    if (!best || slug.length > best.length) best = slug;
  }
  return best;
}

function toUtcSeconds(isoWithOffset: string): string {
  return new Date(isoWithOffset).toISOString().replace(/\.\d{3}Z$/, "Z");
}
