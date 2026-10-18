import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout } from "../../components";
import { RustOdinEssay } from "./essay";

export const article = {
  title: "Two kinds of control",
  description:
    "One reproducible Rust–Odin run retires a compile-speed slogan and a runtime slogan, then traces what remains to where each language places control.",
  published: "2026-07-13T09:55:00Z",
  author: "Elias North",
  tags: ["software"],
  image: {
    src: "/images/articles/two-kinds-of-control-journal.webp",
    alt: "Two craftspeople assemble similar wooden carts at separate workbenches with racks of tools and baskets of parts.",
    generated: "GPT Image",
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="4 min read">
      <RustOdinEssay />
    </ArticleLayout>
  );
}
