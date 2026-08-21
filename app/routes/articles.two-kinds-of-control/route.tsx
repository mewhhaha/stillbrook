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
    src: "/images/articles/two-kinds-of-control.jpg",
    alt: "A long historic machine shop filled with rows of lathes, mills, belts, benches, and hand controls.",
    credit: {
      author: "Historic American Engineering Record",
      license: "Public domain",
      href: "https://commons.wikimedia.org/wiki/File:First_floor_of_museum,_west_end,_looking_east_at_machinery_exhibits._-_Robbins_and_Lawrence_Armory,_196_Main_Street,_Windsor,_Windsor_County,_VT_HAER_VT-39-16.tif",
    },
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
