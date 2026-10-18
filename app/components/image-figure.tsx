import { KuwaharaImage } from "./kuwahara-image";

export type ImageCredit = {
  /** The photographer or artist as they ask to be named. */
  author: string;
  /** Short license name, for example "CC BY-SA 4.0" or "Public domain". */
  license: string;
  /** The source page for the image, usually where the license is stated. */
  href: string;
};

type ImageFigureProps = {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  credit?: ImageCredit;
  /** CSS aspect-ratio (for example "3 / 2") to reserve space before load. */
  aspectRatio?: string;
};

/**
 * A photograph or artwork inside the flow of an essay, with the caption
 * treatment articles share and the attribution a freely licensed image
 * deserves. The credit renders small under the caption and links to the
 * source page.
 */
export function ImageFigure({ src, alt, caption, credit, aspectRatio }: ImageFigureProps) {
  return (
    <figure>
      <KuwaharaImage
        src={src}
        alt={alt}
        loading="lazy"
        style={aspectRatio ? { aspectRatio } : undefined}
        className="w-full rounded-[min(1vw,12px)] object-cover outline-1 -outline-offset-1 outline-black/5 dark:outline-white/10"
      />
      {caption || credit ? (
        <figcaption className="mt-3 text-center font-mono text-xs text-muted">
          {caption}
          {caption && credit ? " · " : null}
          {credit ? (
            <a href={credit.href} className="underline decoration-accent/60 underline-offset-4 hover:text-accent">
              {credit.author}, {credit.license}
            </a>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
