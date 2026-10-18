import { Link } from "react-router";
import type { ArticleImage } from "../article";

type ArticleHeroProps = {
  image: ArticleImage;
  className?: string;
  href?: string;
  linkLabel?: string;
};

export function ArticleHero({ image, className, href, linkLabel }: ArticleHeroProps) {
  let imageClass = "aspect-3/2 w-full object-cover outline-1 -outline-offset-1 outline-ink/10";
  let loading: "eager" | "lazy" = "eager";
  if (href) loading = "lazy";
  let attribution: React.ReactNode;
  if (image.generated !== undefined) {
    imageClass = "aspect-3/2 w-full object-contain";
    attribution = `Illustration generated with ${image.generated}`;
  } else {
    attribution = (
      <a href={image.credit.href} className="underline decoration-ink/20 underline-offset-4 hover:text-accent">
        {image.credit.author}, {image.credit.license}
      </a>
    );
  }

  let illustration = (
    <img src={image.src} alt={image.alt} width="1536" height="1024" loading={loading} className={imageClass} />
  );
  if (href) {
    illustration = <Link to={href} aria-label={linkLabel}>{illustration}</Link>;
  }

  return (
    <figure className={className}>
      {illustration}
      <figcaption className="mt-3 font-mono text-xs text-muted">{attribution}</figcaption>
    </figure>
  );
}
