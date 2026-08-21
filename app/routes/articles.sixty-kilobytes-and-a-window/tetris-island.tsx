"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#0b0d10",
  "#4fc1cc",
  "#d7b45a",
  "#a06ac9",
  "#7bb661",
  "#d76a5a",
  "#5a7bd7",
  "#d79a5a",
];

const CELL = 20;
const BOARD_W = 10 * CELL;
const PANEL_W = 120;
const HEIGHT = 20 * CELL;

type Game = {
  call: (name: string, ...args: number[]) => number;
};

async function loadGame(): Promise<Game> {
  const res = await fetch("/games/grain-tetris/tetris.wasm");
  const bytes = await res.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes, {
    wasi_snapshot_preview1: { fd_write: () => 0 },
  });
  (instance.exports._start as () => void)();
  // Grain's simple numbers are 31-bit ints tagged in the low bit.
  const tag = (n: number) => (n << 1) | 1;
  const untag = (v: number) => v >> 1;
  return {
    call: (name, ...args) =>
      untag(
        (instance.exports[name] as (...a: number[]) => number)(
          ...args.map(tag),
        ),
      ),
  };
}

export function TetrisIsland() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let paused = false;
    const cleanupRef = { current: () => {} };

    const run = async () => {
      try {
        if (!gameRef.current) gameRef.current = await loadGame();
      } catch {
        setFailed(true);
        setActive(false);
        return;
      }
      if (disposed) return;
      const { call } = gameRef.current;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const draw = () => {
        for (let y = 0; y < 20; y++) {
          for (let x = 0; x < 10; x++) {
            ctx.fillStyle = COLORS[call("cell", x, y)];
            ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
          }
        }
        ctx.fillStyle = "#14161a";
        ctx.fillRect(BOARD_W, 0, PANEL_W, HEIGHT);
        ctx.fillStyle = "#9aa1ab";
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillText("score", BOARD_W + 16, 30);
        ctx.fillText("lines", BOARD_W + 16, 90);
        ctx.fillText("level", BOARD_W + 16, 150);
        ctx.fillText("next", BOARD_W + 16, 210);
        ctx.fillStyle = "#e6e3da";
        ctx.font = "18px ui-monospace, monospace";
        ctx.fillText(String(call("score")), BOARD_W + 16, 52);
        ctx.fillText(String(call("lines")), BOARD_W + 16, 112);
        ctx.fillText(String(call("level")), BOARD_W + 16, 172);
        for (let y = 0; y < 2; y++) {
          for (let x = 0; x < 4; x++) {
            const v = call("nextCell", x, y);
            if (v !== 0) {
              ctx.fillStyle = COLORS[v];
              ctx.fillRect(BOARD_W + 16 + x * 14, 222 + y * 14, 13, 13);
            }
          }
        }
        if (call("isOver")) {
          ctx.fillStyle = "rgba(11, 13, 16, 0.75)";
          ctx.fillRect(0, 0, BOARD_W, HEIGHT);
          ctx.fillStyle = "#d76a5a";
          ctx.font = "16px ui-monospace, monospace";
          ctx.fillText("game over", 62, 190);
          ctx.fillStyle = "#9aa1ab";
          ctx.font = "12px ui-monospace, monospace";
          ctx.fillText("R restarts", 72, 214);
        } else if (paused) {
          ctx.fillStyle = "rgba(11, 13, 16, 0.75)";
          ctx.fillRect(0, 0, BOARD_W, HEIGHT);
          ctx.fillStyle = "#9aa1ab";
          ctx.font = "14px ui-monospace, monospace";
          ctx.fillText("paused", 76, 200);
        }
      };

      const schedule = () => {
        timer = setTimeout(() => {
          if (!paused && !disposed) {
            call("tick");
            draw();
          }
          if (!disposed) schedule();
        }, Math.max(90, 700 - call("level") * 60));
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") return setActive(false);
        if (e.key === "r" || e.key === "R") {
          call("reset", (Date.now() % 2147483000) | 1);
          paused = false;
          draw();
          return;
        }
        if (e.key === "p" || e.key === "P") {
          paused = !paused;
          draw();
          return;
        }
        if (paused || call("isOver")) return;
        if (e.key === "ArrowLeft") call("move", -1);
        else if (e.key === "ArrowRight") call("move", 1);
        else if (e.key === "ArrowUp") call("rotate");
        else if (e.key === "ArrowDown") call("tick");
        else if (e.key === " ") call("hardDrop");
        else return;
        e.preventDefault();
        draw();
      };
      const preventScroll = (e: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
      };

      call("reset", (Date.now() % 2147483000) | 1);
      draw();
      schedule();
      window.addEventListener("keydown", onKey);
      window.addEventListener("keydown", preventScroll);
      const cleanup = () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keydown", preventScroll);
        clearTimeout(timer);
      };
      cleanupRef.current = cleanup;
    };

    run();
    return () => {
      disposed = true;
      cleanupRef.current();
    };
  }, [active]);

  return (
    <figure
      style={{
        margin: "2rem auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={BOARD_W + PANEL_W}
          height={HEIGHT}
          aria-label="Playable Tetris board rendered from the Grain WebAssembly module"
          style={{
            background: "#0b0d10",
            border: "2px solid #3a3f47",
            borderRadius: "6px",
            maxWidth: "100%",
          }}
        />
        {!active && (
          <button
            type="button"
            onClick={() => setActive(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              display: "grid",
              placeItems: "center",
              background: "rgba(11, 13, 16, 0.85)",
              color: "#e6e3da",
              border: 0,
              borderRadius: "6px",
              font: "16px ui-monospace, monospace",
              cursor: "pointer",
            }}
          >
            {failed
              ? "could not load tetris.wasm"
              : "click to play — the arrows are about to stop scrolling"}
          </button>
        )}
      </div>
      <figcaption
        style={{ fontSize: "0.8rem", color: "var(--color-muted, #888)" }}
      >
        The same tetris.wasm from the download below, running in this page.
        Arrows move and rotate, space drops, P pauses, R restarts, Escape
        gives your scroll keys back.
      </figcaption>
    </figure>
  );
}
