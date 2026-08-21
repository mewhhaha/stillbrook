import { articleMeta, type ArticleMeta } from "../../article";
import { ArticleLayout, H2, Prose } from "../../components";

export const article = {
  title: "Building for the second reading",
  description: "A note on making software that grows clearer when people return to it.",
  published: "2026-07-11T09:00:00Z",
  author: "Mira Voss",
  tags: ["craft", "software"],
  image: {
    src: "/images/articles/first-light.jpg",
    alt: "A worn dirt footpath winding through grass toward a stand of sunlit birch trees, flanked by russet bracken.",
    credit: {
      author: "Roger Jones",
      license: "CC BY-SA 2.0",
      href: "https://commons.wikimedia.org/wiki/File:Sunlight_on_the_path_-_geograph.org.uk_-_2900853.jpg",
    },
  },
} as const satisfies ArticleMeta;

export function meta() {
  return articleMeta(article);
}

export function ServerComponent() {
  return (
    <ArticleLayout article={article} readingTime="1 min read">
      <Prose>
        <p>
          The first read of a codebase tells you what it does. The second — a month later,
          changing something — tells you whether anyone cared about the person arriving after.
        </p>
        <H2>Leave a trail, not a map</H2>
        <p>
          Good code doesn&apos;t explain every stone. What I want coming back is the next decision
          made visible: a name that says what a module is for, a boundary that shows where my
          change belongs. Tests help when they name the promises worth keeping.
        </p>
        <blockquote>
          <p>Maintainability is hospitality extended through time.</p>
        </blockquote>
        <p>
          I&apos;m holding this journal to the same standard. Each article is its own route, and
          the index finds new writing without a catalog I&apos;d forget to maintain. Interactive
          ideas get small client islands.
        </p>
        <H2>Make return visits rewarding</H2>
        <p>
          A useful system gets more legible the longer you live with it. The conventions repeat
          until they disappear; the exceptions earned their place. You spend less energy decoding
          structure and more on the idea.
        </p>
      </Prose>
    </ArticleLayout>
  );
}
