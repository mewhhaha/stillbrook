"use client";

import { useEffect, useRef, type ImgHTMLAttributes, type ReactNode } from "react";
import { renderKuwahara } from "../lib/kuwahara";

type KuwaharaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "children"> & {
  /** Native picture sources, including the homepage's theme-specific artwork. */
  sources?: ReactNode;
};

/** Keep the native image for layout, alt text, loading, and the no-GPU fallback. */
export function KuwaharaImage({ className = "", style, sources, ...props }: KuwaharaImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!image || !canvas || !frame) return;

    let pending = 0;
    let visible = false;
    let painted = "";
    const schedule = () => {
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        pending = 0;
        if (!visible || !image.complete || !image.naturalWidth) return;
        const size = image.getBoundingClientRect();
        const key = `${image.currentSrc}:${size.width}:${size.height}:${devicePixelRatio}`;
        if (key === painted) return;
        if (renderKuwahara(image, canvas)) {
          frame.dataset.filtered = "true";
          painted = key;
        } else {
          delete frame.dataset.filtered;
        }
      });
    };
    const loaded = () => {
      painted = "";
      delete frame.dataset.filtered;
      schedule();
    };

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    }, { rootMargin: "160px" });
    const resize = new ResizeObserver(schedule);
    visibility.observe(image);
    resize.observe(image);
    image.addEventListener("load", loaded);
    image.addEventListener("error", loaded);

    return () => {
      cancelAnimationFrame(pending);
      visibility.disconnect();
      resize.disconnect();
      image.removeEventListener("load", loaded);
      image.removeEventListener("error", loaded);
    };
  }, [props.src, props.srcSet]);

  return (
    <span ref={frameRef} className={`kuwahara-image ${className}`} style={style}>
      <picture>{sources}<img {...props} ref={imageRef} /></picture>
      <canvas ref={canvasRef} aria-hidden="true" />
    </span>
  );
}
