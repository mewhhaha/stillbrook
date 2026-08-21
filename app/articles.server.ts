import type { ArticleMeta } from "./article";

const modules = import.meta.glob<{ article: ArticleMeta }>("./routes/articles.*/route.tsx", {
  eager: true,
});

export const articles = Object.entries(modules)
  .map(([file, module]) => {
    const slug = file.match(/\.\/routes\/articles\.([^/]+)\/route\.tsx$/)?.[1];
    if (!slug) throw new Error(`Invalid article route module path: ${file}`);
    return { ...module.article, slug, href: `/articles/${slug}` };
  })
  .sort((a, b) => {
    const bPublished = Date.parse(b.published);
    const aPublished = Date.parse(a.published);
    return bPublished === aPublished ? a.slug.localeCompare(b.slug) : bPublished - aPublished;
  });

export const articlesByTag = Array.from(new Set(articles.flatMap((article) => article.tags)))
  .sort((a, b) => a.localeCompare(b))
  .map((tag) => ({ tag, articles: articles.filter((article) => article.tags.includes(tag)) }));
