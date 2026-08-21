export type ArticleImage = {
  /** Path under public/, for example "/images/articles/first-light.jpg". */
  src: string;
  alt: string;
  credit: {
    /** The photographer or artist as they ask to be named. */
    author: string;
    /** Short license name, for example "CC BY-SA 4.0" or "Public domain". */
    license: string;
    /** The source page where the license is stated. */
    href: string;
  };
};

export type ArticleMeta = {
  title: string;
  description: string;
  published: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
  author: string;
  tags: readonly string[];
  /** A freely licensed image associated with the article, shown as its hero. */
  image?: ArticleImage;
};

export function formatDate(value: ArticleMeta["published"]): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}

/** A date without its time, for datelines where the day is the fact. */
export function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

/** The standard document meta for an article route's `meta` export. */
export function articleMeta(article: ArticleMeta) {
  return [
    { title: `${article.title} — Still Brook` },
    { name: "description", content: article.description },
    ...(article.image
      ? [
          { property: "og:image", content: article.image.src },
          { property: "og:image:alt", content: article.image.alt },
        ]
      : []),
  ];
}
