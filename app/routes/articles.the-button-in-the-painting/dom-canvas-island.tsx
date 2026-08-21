"use client";

import { useEffect, useRef, useState } from "react";

const cardStyle: React.CSSProperties = {
  width: "220px",
  padding: "16px",
  background: "#fffbe8",
  border: "1px solid #d5c58a",
  borderRadius: "8px",
  color: "#3b3620",
  font: "14px system-ui, sans-serif",
  textAlign: "left",
};

export function DomCanvasIsland() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const clicks = useRef(0);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let raf = 0;
    let drewOnce = false;

    queueMicrotask(() => {
      const ok =
        typeof CanvasRenderingContext2D !== "undefined" &&
        "drawElementImage" in CanvasRenderingContext2D.prototype;
      setSupported(ok);
      if (!ok) return;

      const canvas = canvasRef.current;
      const card = cardRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !card || !ctx) return;
      startPainting(canvas, card, ctx);
    });

    const startPainting = (
      canvas: HTMLCanvasElement,
      card: HTMLDivElement,
      ctx: CanvasRenderingContext2D,
    ) => {
      const paint = (ms: number) => {
        raf = requestAnimationFrame(paint);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(320, 180);
        ctx.rotate(Math.sin(ms / 900) * 0.15);
        const s = 1 + 0.08 * Math.sin(ms / 1300);
        ctx.scale(s, s);
        ctx.translate(-126, -60);
        try {
          // drawElementImage returns the transform that keeps the live element
          // aligned with its drawn pixels, so clicks keep landing.
          const transform = (
            ctx as CanvasRenderingContext2D & {
              drawElementImage: (el: Element, x: number, y: number) => DOMMatrix | undefined;
            }
          ).drawElementImage(card, 0, 0);
          if (transform) card.style.transform = transform.toString();
          drewOnce = true;
        } catch {
          // before the element's first paint record exists, drawing throws;
          // keep trying until the paint event has fired once
          if (drewOnce) cancelAnimationFrame(raf);
        }
        ctx.restore();
      };
      raf = requestAnimationFrame(paint);
    };

    return () => cancelAnimationFrame(raf);
    // runs once: the canvas branch is already mounted during detection
  }, []);

  const onClick = () => {
    clicks.current += 1;
    if (countRef.current) countRef.current.textContent = String(clicks.current);
  };

  return (
    <figure style={{ margin: "2rem auto", textAlign: "center" }}>
      {supported === false ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/images/articles/the-button-in-the-painting-demo.webm"
          style={{ maxWidth: "100%", borderRadius: "8px", border: "1px solid #3a3f47" }}
          aria-label="Recording of a live DOM card swaying inside a canvas while staying clickable"
        />
      ) : (
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            {...({ layoutsubtree: "" } as Record<string, string>)}
            aria-label="A live DOM card drawn swaying inside a 2D canvas"
            style={{ maxWidth: "100%", borderRadius: "8px", background: "#14161a" }}
          >
            <div ref={cardRef} style={cardStyle}>
              <p style={{ margin: "0 0 10px" }}>A real, live DOM node.</p>
              <button
                type="button"
                onClick={onClick}
                style={{
                  font: "inherit",
                  padding: "4px 10px",
                  background: "#e8ddb0",
                  border: "1px solid #b3a464",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                clicked <span ref={countRef}>0</span> times
              </button>
            </div>
          </canvas>
        </div>
      )}
      <figcaption style={{ fontSize: "0.8rem", color: "var(--color-muted, #888)", marginTop: "0.5rem" }}>
        {supported === false
          ? "A recording, because this browser has no drawElementImage yet. In Chrome 149+ with the canvas-draw-element flag, this figure is live and the button counts your clicks."
          : "A live DOM card, drawn swaying inside a 2D canvas. The button is real — click it mid-sway and the counter moves."}
      </figcaption>
    </figure>
  );
}
