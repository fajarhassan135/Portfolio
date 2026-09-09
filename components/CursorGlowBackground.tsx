"use client";

import { useEffect, useRef } from "react";

/**
 * The About page backdrop: a flat dark plate, a static layer of soft blurred light rays, and a
 * continuous streak of violet light trailing the cursor over the top of them.
 *
 * TWO CANVASES, NOT ONE. The rays are drawn at 40% resolution and the trail at full. Both are
 * heavily blurred, and canvas blur cost scales with the pixels it touches, so rendering the rays
 * into a small buffer and letting CSS scale it up costs roughly a sixth of what full resolution
 * would. Nothing is lost doing it: the rays are so out of focus that their real detail is well
 * below one screen pixel either way. The trail is finer and stays sharp-resolution.
 *
 * THE RAYS ARE POLYLINES, NOT GRADIENT DIVS. Each is a run of control points stroked as one thick
 * smoothed line. That is what allows Part B: a static CSS gradient has nothing to displace, whereas
 * control points can each be pushed by the cursor and eased back independently, so the ray bends
 * only where the trail actually crossed it.
 *
 * The displacement is perpendicular to the ray's own direction. Pushing radially away from the
 * cursor would shorten the ray as well as bend it, which reads as the shape shrinking rather than
 * rippling; displacing along the normal keeps its length and only changes its path.
 */

/* ---- trail (unchanged) ---- */
const MAX_POINTS = 26; // rolling history length; more points means a smoother curve
const POINT_TTL = 850; // ms before a sample is dropped, so a still cursor fades to nothing
const HEAD_WIDTH = 96; // px, stroke width nearest the cursor
const TAIL_WIDTH = 14; // px, at the oldest end
const BLUR_PX = 44;

/**
 * How much of the remaining distance the streak's head closes each frame.
 *
 * The head used to be the raw mouse position, so the streak was pinned to the cursor and only its
 * TAIL lagged. Running the head through its own lerp is what gives the whole band weight: at 0.055
 * it visibly hangs behind a quick movement and then flows in after it.
 */
const HEAD_EASE = 0.055;

/** Minimum travel before a new sample is recorded, in px. */
const MIN_STEP = 0.6;

/* ---- rays ---- */
const RAY_SCALE = 0.4; // ray buffer resolution, as a fraction of the viewport
/* Down from 30, where it dissolved a 75-150px stroke into a smudge. With the beam profile doing
   the real softening, the blur only has to take the edge off the stacked strokes and help
   neighbouring beams bleed into one another where they meet. */
const RAY_BLUR = 19;
const RAY_POINTS = 16; // control points per ray
const RIPPLE_RADIUS = 190; // px on screen within which the trail disturbs a ray
const RIPPLE_STRENGTH = 46; // px of peak perpendicular displacement
const RIPPLE_EASE = 0.09; // how fast a point moves toward its target displacement, per frame

type Sample = { x: number; y: number; t: number };

/**
 * Ray definitions in viewport-relative coordinates, so they sit the same way at any window size.
 * Palette is the site's own: violet, burgundy and gold, deliberately not the reference's orange.
 */
const RAY_DEFS = [
  // Spread across four zones rather than fanned from one corner. The shared origin bunched all the
  // light into the lower left and left the opposite corner dead; giving each ray its own zone is
  // what makes the page read as evenly lit.
  //
  // `core` is a pale, desaturated version of the same hue. Bright light reads as washing toward
  // white at its hottest point, and painting the core in the base hue instead is a large part of
  // why these looked like coloured smudges rather than beams.
  // top-left, running down toward the centre
  { x1: -0.18, y1: -0.04, x2: 0.62, y2: 0.48, w: 0.42, rgb: "124, 74, 214", core: "203, 178, 255", a: 0.9 },
  // through the middle, rising left to right
  { x1: 0.06, y1: 0.92, x2: 0.94, y2: 0.28, w: 0.34, rgb: "138, 47, 60", core: "240, 158, 168", a: 0.78 },
  // upper right, angled down
  { x1: 0.52, y1: -0.16, x2: 1.16, y2: 0.44, w: 0.24, rgb: "216, 173, 92", core: "255, 236, 190", a: 0.6 },
  // lower right, anchoring the corner the others leave empty
  { x1: 0.34, y1: 1.16, x2: 1.14, y2: 0.72, w: 0.36, rgb: "88, 52, 168", core: "175, 148, 245", a: 0.8 },
];

/**
 * The beam profile: width multiplier and alpha multiplier per pass, widest and faintest first.
 *
 * This is what turns a stroke into light. A single thick stroke is uniform across its width, so
 * however much it is blurred it stays a slab with soft edges. Stacking passes from a wide faint
 * halo down to a narrow hot core builds a real falloff ACROSS the beam, and `lighter` sums them, so
 * the middle runs bright and the wings trail off. The last two passes use the pale core colour.
 */
const BEAM_PASSES: { w: number; a: number; core: boolean }[] = [
  { w: 1.55, a: 0.1, core: false }, // outer bloom
  { w: 1.0, a: 0.18, core: false },
  { w: 0.58, a: 0.26, core: false },
  { w: 0.3, a: 0.34, core: true },
  { w: 0.12, a: 0.5, core: true }, // hot centre line
];

type RayPoint = { bx: number; by: number; dx: number; dy: number };
type Ray = { pts: RayPoint[]; nx: number; ny: number; width: number; rgb: string; core: string; a: number };

export default function CursorGlowBackground() {
  const trailRef = useRef<HTMLCanvasElement>(null);
  const raysRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const trailCanvas = trailRef.current;
    const rayCanvas = raysRef.current;
    if (!trailCanvas || !rayCanvas) return;
    const ctx = trailCanvas.getContext("2d");
    const rctx = rayCanvas.getContext("2d");
    if (!ctx || !rctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rays: Ray[] = [];

    /** Rebuild the rays' resting shapes for the current viewport. */
    const buildRays = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      rays = RAY_DEFS.map((d) => {
        const x1 = d.x1 * W;
        const y1 = d.y1 * H;
        const x2 = d.x2 * W;
        const y2 = d.y2 * H;
        const len = Math.hypot(x2 - x1, y2 - y1) || 1;
        // unit normal, the axis every displacement runs along
        const nx = -(y2 - y1) / len;
        const ny = (x2 - x1) / len;
        const pts: RayPoint[] = [];
        for (let i = 0; i < RAY_POINTS; i++) {
          const k = i / (RAY_POINTS - 1);
          pts.push({ bx: x1 + (x2 - x1) * k, by: y1 + (y2 - y1) * k, dx: 0, dy: 0 });
        }
        return { pts, nx, ny, width: d.w * Math.min(W, H), rgb: d.rgb, core: d.core, a: d.a };
      });
    };

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;

      trailCanvas.width = Math.max(1, Math.round(W * dpr));
      trailCanvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // the ray buffer is deliberately small; CSS stretches it back over the viewport
      rayCanvas.width = Math.max(1, Math.round(W * RAY_SCALE));
      rayCanvas.height = Math.max(1, Math.round(H * RAY_SCALE));
      rctx.setTransform(RAY_SCALE, 0, 0, RAY_SCALE, 0, 0);

      buildRays();
    };
    resize();
    window.addEventListener("resize", resize);

    /** Draw every ray through its current, possibly displaced, control points. */
    const drawRays = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      rctx.clearRect(0, 0, W, H);
      rctx.save();
      rctx.filter = `blur(${RAY_BLUR}px)`;
      rctx.globalCompositeOperation = "lighter";
      rctx.lineCap = "round";
      rctx.lineJoin = "round";

      for (const ray of rays) {
        const p = ray.pts;

        // the path is built once and re-stroked for every pass
        const trace = () => {
          rctx.beginPath();
          rctx.moveTo(p[0].bx + p[0].dx, p[0].by + p[0].dy);
          for (let i = 1; i < p.length - 1; i++) {
            const a = p[i];
            const b = p[i + 1];
            const mx = (a.bx + a.dx + b.bx + b.dx) / 2;
            const my = (a.by + a.dy + b.by + b.dy) / 2;
            // quadratic through midpoints: a displaced point bends the ray into a curve rather
            // than putting a corner in it
            rctx.quadraticCurveTo(a.bx + a.dx, a.by + a.dy, mx, my);
          }
          const last = p[p.length - 1];
          rctx.lineTo(last.bx + last.dx, last.by + last.dy);
          rctx.stroke();
        };

        const head = p[0];
        const tail = p[p.length - 1];

        for (const pass of BEAM_PASSES) {
          const rgb = pass.core ? ray.core : ray.rgb;
          const A = ray.a * pass.a;
          const grad = rctx.createLinearGradient(
            head.bx + head.dx,
            head.by + head.dy,
            tail.bx + tail.dx,
            tail.by + tail.dy
          );
          // along the length: eased in at the start, brightest early, dissolving to nothing
          grad.addColorStop(0, `rgba(${rgb}, 0)`);
          grad.addColorStop(0.16, `rgba(${rgb}, ${A})`);
          grad.addColorStop(0.5, `rgba(${rgb}, ${A * 0.72})`);
          grad.addColorStop(0.82, `rgba(${rgb}, ${A * 0.26})`);
          grad.addColorStop(1, `rgba(${rgb}, 0)`);
          rctx.strokeStyle = grad;
          rctx.lineWidth = ray.width * pass.w;
          trace();
        }
      }
      rctx.restore();
    };

    if (reduce) {
      // static rays only: no trail, no ripple
      drawRays();
      return () => window.removeEventListener("resize", resize);
    }

    const pts: Sample[] = [];
    const target = { x: -1, y: -1 };
    const head = { x: -1, y: -1 };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (head.x < 0) {
        head.x = target.x;
        head.y = target.y;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    /**
     * Push ray control points away from the trail, and let them fall back when it leaves.
     *
     * The target displacement is recomputed from scratch every frame and the point eases toward it,
     * which is what gives both halves of the behaviour from one rule: near the trail the target is
     * large so the point moves out, and the moment the trail passes on the target is zero again so
     * the same ease carries it home. No separate "relax" pass, and no way for a point to get stuck
     * displaced because an event was missed.
     */
    const updateRays = () => {
      for (const ray of rays) {
        for (const pt of ray.pts) {
          let best = Infinity;
          let side = 0;
          for (let i = 0; i < pts.length; i++) {
            const s = pts[i];
            const d = Math.hypot(s.x - (pt.bx), s.y - (pt.by));
            if (d < best) {
              best = d;
              // which side of the ray the trail sample is on, so the push is away from it
              side = Math.sign((s.x - pt.bx) * ray.nx + (s.y - pt.by) * ray.ny) || 1;
            }
          }

          let tx = 0;
          let ty = 0;
          if (best < RIPPLE_RADIUS) {
            // smooth falloff: cosine gives zero slope at the edge, so there is no visible boundary
            // where the disturbance starts
            const f = 0.5 + 0.5 * Math.cos((best / RIPPLE_RADIUS) * Math.PI);
            const push = -side * RIPPLE_STRENGTH * f;
            tx = ray.nx * push;
            ty = ray.ny * push;
          }
          pt.dx += (tx - pt.dx) * RIPPLE_EASE;
          pt.dy += (ty - pt.dy) * RIPPLE_EASE;
        }
      }
    };

    let raf = 0;
    let running = true;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const now = performance.now();

      /* Advance the eased head and sample IT, once per frame.
         Sampling raw mousemove meant the history inherited the event stream's irregular timing, so
         the spacing between points varied with pointer speed and the curve stepped visibly. One
         eased sample per frame gives evenly spaced points and removes the jitter entirely. */
      if (target.x >= 0) {
        head.x += (target.x - head.x) * HEAD_EASE;
        head.y += (target.y - head.y) * HEAD_EASE;
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(head.x - last.x, head.y - last.y) > MIN_STEP) {
          pts.push({ x: head.x, y: head.y, t: now });
          if (pts.length > MAX_POINTS) pts.shift();
        }
      }

      // age the tail out, so a stationary cursor leaves nothing behind
      while (pts.length && now - pts[0].t > POINT_TTL) pts.shift();

      // rays first, and unconditionally: they are the ambient layer and must render whether or not
      // there is currently a trail
      updateRays();
      drawRays();

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (pts.length < 3) return;

      ctx.save();
      ctx.filter = `blur(${BLUR_PX}px)`;
      // additive: overlapping segments fuse into one soft body rather than layering visibly
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw oldest to newest. `i` runs over interior samples because each segment is a quadratic
      // through midpoints, which needs a point either side of the control point.
      for (let i = 1; i < pts.length - 1; i++) {
        // 0 at the tail, 1 at the cursor
        const k = i / (pts.length - 2);

        const a = pts[i - 1];
        const b = pts[i];
        const c = pts[i + 1];
        const m1x = (a.x + b.x) / 2;
        const m1y = (a.y + b.y) / 2;
        const m2x = (b.x + c.x) / 2;
        const m2y = (b.y + c.y) / 2;

        // width tapers from tail to head, alpha ramps with a curve so the tail dissolves rather
        // than stopping at a visible end
        ctx.lineWidth = TAIL_WIDTH + (HEAD_WIDTH - TAIL_WIDTH) * k;
        const alpha = Math.pow(k, 1.6) * 0.85;

        const grad = ctx.createLinearGradient(m1x, m1y, m2x, m2y);
        grad.addColorStop(0, `rgba(124, 74, 214, ${(alpha * 0.75).toFixed(3)})`);
        grad.addColorStop(1, `rgba(170, 122, 255, ${alpha.toFixed(3)})`);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(m1x, m1y);
        ctx.quadraticCurveTo(b.x, b.y, m2x, m2y);
        ctx.stroke();
      }

      // a soft bloom sitting on the leading end, so the brightest point is the head of the streak
      const tip = pts[pts.length - 1];
      const R = HEAD_WIDTH * 1.15;
      const bloom = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, R);
      bloom.addColorStop(0, "rgba(196, 168, 255, 0.55)");
      bloom.addColorStop(0.5, "rgba(140, 92, 232, 0.22)");
      bloom.addColorStop(1, "rgba(124, 74, 214, 0)");
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };
    raf = requestAnimationFrame(draw);

    // nothing to draw in a tab nobody is looking at
    const onVis = () => {
      if (document.hidden && running) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!document.hidden && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      pts.length = 0;
      rays = [];
    };
  }, []);

  return (
    <div className="glow-base" aria-hidden="true">
      <canvas ref={raysRef} className="glow-rays" />
      <canvas ref={trailRef} className="glow-trail" />
    </div>
  );
}
