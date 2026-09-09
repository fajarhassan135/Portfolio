"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Shadow-box tilt.
 *
 * The photo is pinned. It never translates, never scales, and never leaves its place in the layout:
 * the ONLY thing the cursor changes is rotation on X and Y, capped at MAX_TILT degrees, so the
 * effect is like looking into a shallow three dimensional box rather than a card being dragged
 * about. `rotateX`/`rotateY` under a perspective parent leave layout completely untouched.
 *
 * Two details matter for it to feel physical rather than mechanical:
 *
 *  - it only reacts inside a radius around the photo, so it is not tracking the pointer across the
 *    whole page from three sections away
 *  - the springs are under-damped, so the card overshoots and wobbles back rather than
 *    interpolating stiffly into position
 *
 * The slow ken-burns drift that used to live on `.portrait-drift` is gone from the CSS for the same
 * reason: it scaled and translated the image, which is exactly the loose movement being removed.
 */

const MAX_TILT = 13; // degrees at the far edge of the active radius, hard capped
const RADIUS_PAD = 200; // how far outside the photo the magnet still has pull

/**
 * Under-damped on purpose. Below about damping 10 at this stiffness the card visibly overshoots
 * and wobbles back, which is the "bouncy" part of the brief; much lower and it rings for too long
 * to feel like a solid object.
 */
const SPRING = { stiffness: 210, damping: 9, mass: 1.05 };

export default function PortraitTilt({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // raw pointer influence, then springs to give it weight
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [-1, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(sy, [-1, 1], [MAX_TILT, -MAX_TILT]); // invert: up should tip away
  // a highlight that slides with the tilt, so the surface reads as catching light
  const glareX = useTransform(sx, [-1, 1], ["18%", "82%"]);
  const glareY = useTransform(sy, [-1, 1], ["18%", "82%"]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // active only within the photo plus a margin, so it ignores the rest of the page
      const rx = r.width / 2 + RADIUS_PAD;
      const ry = r.height / 2 + RADIUS_PAD;
      const inside = Math.abs(dx) < rx && Math.abs(dy) < ry;

      if (!inside) {
        px.set(0);
        py.set(0);
        return;
      }
      // normalised to -1..1, and eased so the pull is gentler near the centre
      const nx = Math.max(-1, Math.min(1, dx / rx));
      const ny = Math.max(-1, Math.min(1, dy / ry));
      px.set(nx * Math.abs(nx) ** 0.6 * (nx < 0 ? -1 : 1) || nx);
      py.set(ny * Math.abs(ny) ** 0.6 * (ny < 0 ? -1 : 1) || ny);
    };

    const onLeave = () => {
      px.set(0);
      py.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [px, py]);

  // onError alone misses failures that happen before hydration, so check naturalWidth too
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) {
    return (
      <div
        className="mono"
        style={{
          aspectRatio: "3 / 4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.38,
          lineHeight: 2.2,
          border: "1px dashed rgba(233,230,240,0.16)",
        }}
      >
        Portrait slot
        <br />
        save your photo as public{src}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ perspective: 1000 }}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="portrait-abstract"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            if ((e.currentTarget as HTMLImageElement).naturalWidth === 0) setFailed(true);
          }}
        />
        <motion.div
          aria-hidden="true"
          className="portrait-glare"
          style={{ ["--gx" as string]: glareX, ["--gy" as string]: glareY }}
        />
      </motion.div>
    </div>
  );
}
