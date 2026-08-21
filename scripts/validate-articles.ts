import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const routes = "app/routes";
const articleRoutes = (await readdir(routes, { withFileTypes: true })).filter(
  (entry) => entry.isDirectory() && entry.name.startsWith("articles."),
);
const failures: string[] = [];
let validatedCount = 0;

for (const route of articleRoutes) {
  const slug = route.name.slice("articles.".length);
  const routeFile = join(routes, route.name, "route.tsx");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    failures.push(`${route.name}: folder must be kebab-case`);
    continue;
  }

  let source: string;
  try {
    source = await readFile(routeFile, "utf8");
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      failures.push(`${route.name}: missing route.tsx`);
      continue;
    }
    throw error;
  }

  validatedCount++;
  for (const field of ["title", "description", "published", "author", "tags"]) {
    if (!new RegExp(`\\b${field}\\s*:`).test(source)) {
      failures.push(`${route.name}/route.tsx: article metadata is missing ${field}`);
    }
  }
  if (!/satisfies\s+ArticleMeta/.test(source)) {
    failures.push(`${route.name}/route.tsx: metadata must satisfy ArticleMeta`);
  }
  if (!/export\s+function\s+ServerComponent/.test(source)) {
    failures.push(`${route.name}/route.tsx: export a ServerComponent`);
  }
  const published = source.match(/published:\s*["']([^"']+)["']/)?.[1];
  if (!published || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(published)) {
    failures.push(
      `${route.name}/route.tsx: published must be an RFC3339 UTC timestamp like 2026-07-11T14:30:00Z`,
    );
    continue;
  }
  if (
    Number.isNaN(Date.parse(published)) ||
    new Date(published).toISOString().replace(".000Z", "Z") !== published
  ) {
    failures.push(`${route.name}/route.tsx: published must be a valid datetime`);
  }
  const author = source.match(/author:\s*["']([^"']*)["']/)?.[1].trim();
  if (!author) failures.push(`${route.name}/route.tsx: author must be a non-empty name`);

  const tags = source.match(/tags:\s*\[([^\]]*)\]/)?.[1].match(/["']([^"']+)["']/g);
  if (!tags?.length) {
    failures.push(`${route.name}/route.tsx: tags must contain at least one tag`);
  } else {
    for (const quotedTag of tags) {
      const tag = quotedTag.slice(1, -1);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
        failures.push(`${route.name}/route.tsx: tag "${tag}" must be lowercase kebab-case`);
      }
    }
  }
}

if (validatedCount === 0) failures.push("No article routes found");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Validated ${validatedCount} article route${validatedCount === 1 ? "" : "s"}.`);
