"use client";

import { useEffect, useRef } from "react";

/**
 * "FAJAR WARRIACH" drawn as ASCII art built out of source code, with the characters dodging the
 * cursor.
 *
 * HOW THE LETTERFORMS ARE FOUND. The name is drawn once to an offscreen canvas at WEIGHT and
 * that bitmap is sampled on a grid; every covered cell becomes one character. The glyph shapes come
 * from a real font rather than hand-plotted coordinates, so the name can be changed to anything and
 * still work.
 *
 * WHY IT HAS TO BE A MONOSPACE GRID. The first version centred an oversized glyph on each sample
 * point, so neighbouring characters overlapped by roughly 80% and the letterforms dissolved into
 * texture. The cell has to match the font's own metrics instead: a monospace advance is ~0.6em, so
 * the column step is 0.62 * size and the row step 0.95 * size, and each character is drawn from its
 * cell's top left corner. Characters then tile edge to edge the way they do in a terminal, which is
 * what makes the shapes read as letters.
 *
 * COVERAGE, NOT A POINT SAMPLE. Each cell averages the alpha across its own area rather than testing
 * one pixel. A single-pixel test on a diagonal stroke drops cells at random along the edge and the
 * letters come out ragged; averaging gives a clean, consistent boundary.
 *
 * THE DISTORTION is inverse-square repulsion inside a fixed radius, with each character easing
 * toward its displaced target rather than snapping to it. The easing is the reason it feels liquid
 * instead of twitchy: the characters are always chasing the cursor's influence, never matching it.
 */

const KEYWORDS = [
  "const",
  "function",
  "return",
  "if",
  "for",
  "await",
  "async",
  "import",
  "def",
  "lambda",
  "class",
  "while",
  "type",
  "yield",
  "let",
  "try",
  "elif",
  "self",
  "this",
  "null",
  "void",
  "map",
  "in",
  "=>",
  "()",
  "{}",
  "[]",
  "===",
  "!=",
];

const GOLD = "#D4AF37";
/* Weight 400, not a heavy face. A lighter stroke needs finer cells or it falls below the coverage
   threshold and the letters come out dotted: measured, a 400-weight stroke is 5.8px against a 6.17px
   cell at COLS 140, so a stroke lands almost exactly one cell thick and stays continuous. At COLS
   116 the same stroke covers only 0.78 of a cell and starts breaking up. */
const WEIGHT = 400;
const COLS = 140;
const RADIUS = 110; // px of influence around the cursor
const PUSH = 44; // how far the worst-affected character is thrown
const EASE = 0.16; // per-frame approach; low enough to lag the cursor visibly
const COVER = 0.3; // a cell becomes a character above this average alpha

type Cell = { hx: number; hy: number; x: number; y: number; ch: string };

export default function NameAscii({ name, active = true }: { name: string; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cells: Cell[] = [];
    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let glyph = 12;

    // parked out of range, so the characters sit at home before the pointer has ever entered
    let cx = -1e5;
    let cy = -1e5;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      cssW = Math.max(1, Math.round(r.width));
      cssH = Math.max(1, Math.round(r.height));
      if (cssW < 2 || cssH < 2) return; // never cache a zero-sized layout pass
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      /* The grid comes from the monospace metrics, not the other way round: pick how many columns
         should span the name, and the glyph size follows. */
      const stepX = (cssW * 0.96) / COLS;
      glyph = stepX / 0.62; // JetBrains Mono advances 0.6em; 0.62 leaves a hair of tracking
      const stepY = glyph * 0.95;

      const off = document.createElement("canvas");
      off.width = cssW;
      off.height = cssH;
      const og = off.getContext("2d", { willReadFrequently: true });
      if (!og) return;

      // shrink to fit: measure at a nominal size and scale, rather than guessing a size per viewport
      const NOMINAL = 100;
      og.font = `${WEIGHT} ${NOMINAL}px "Outfit", ui-sans-serif, system-ui, sans-serif`;
      const w = og.measureText(name).width || 1;
      const size = Math.min((cssW * 0.96 * NOMINAL) / w, cssH * 0.78);

      og.font = `${WEIGHT} ${size}px "Outfit", ui-sans-serif, system-ui, sans-serif`;
      og.textAlign = "center";
      og.textBaseline = "middle";
      og.fillStyle = "#fff";
      og.fillText(name, cssW / 2, cssH / 2);

      const data = og.getImageData(0, 0, cssW, cssH).data;

      /* Average the alpha over the cell. A point sample on a diagonal stroke keeps or drops cells
         almost at random along the edge, which is what makes the letters look chewed. */
      const cw = Math.max(1, Math.round(stepX));
      const chh = Math.max(1, Math.round(stepY));
      const coverage = (px: number, py: number) => {
        let sum = 0;
        let n = 0;
        for (let y = py; y < py + chh; y += 2) {
          if (y < 0 || y >= cssH) continue;
          for (let x = px; x < px + cw; x += 2) {
            if (x < 0 || x >= cssW) continue;
            sum += data[(y * cssW + x) * 4 + 3];
            n++;
          }
        }
        return n ? sum / (n * 255) : 0;
      };

      const next: Cell[] = [];
      let k = 0; // index into the rolling keyword stream
      let word = KEYWORDS[0];
      let wi = 0;

      for (let gy = 0; gy + stepY <= cssH; gy += stepY) {
        for (let gx = 0; gx + stepX <= cssW; gx += stepX) {
          if (coverage(Math.floor(gx), Math.floor(gy)) < COVER) continue;
          if (wi >= word.length) {
            k = (k + 1) % KEYWORDS.length;
            word = KEYWORDS[k];
            wi = 0;
          }
          next.push({ hx: gx, hy: gy, x: gx, y: gy, ch: word[wi++] });
        }
      }
      cells = next;
    };

    build();

    /* Tracked on the window, not the canvas: the spec asks for the letters to react as the cursor
       moves anywhere on screen, and easing home only when it leaves the document entirely. */
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      cx = e.clientX - r.left;
      cy = e.clientY - r.top;
    };
    const onLeave = () => {
      cx = -1e5;
      cy = -1e5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => build());
      ro.observe(canvas);
    }

    const paint = (moved: boolean) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = `${glyph}px "JetBrains Mono", ui-monospace, "Courier New", monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = GOLD;

      for (const c of cells) {
        if (moved) {
          let tx = c.hx;
          let ty = c.hy;
          const dx = c.hx - cx;
          const dy = c.hy - cy;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            // squared falloff: the nearest characters move a lot, the radius edge barely at all
            const f = (1 - d / RADIUS) ** 2 * PUSH;
            const inv = d > 0.001 ? 1 / d : 0;
            tx += dx * inv * f;
            ty += dy * inv * f;
          }
          c.x += (tx - c.x) * EASE;
          c.y += (ty - c.y) * EASE;
        }
        ctx.fillText(c.ch, c.x, c.y);
      }
    };

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!activeRef.current) return; // hidden: no reason to spend a frame on it
      paint(true);
    };

    if (reduce) {
      paint(false); // still draw the name, just never move it
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      ro?.disconnect();
    };
  }, [name]);

  return <canvas ref={canvasRef} className="name-ascii" aria-label={name} role="img" />;
}
