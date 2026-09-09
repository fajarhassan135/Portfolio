"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared chrome for the 2D pages (About, Contact, Projects) so the cinema/tech language is defined
 * once rather than re-implemented per page: the reel backdrop, the scroll-blur behaviour, the
 * reveal-on-scroll wrapper and the reel/section label.
 */

export function useInView<T extends HTMLElement>(rootMargin = "-40px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, shown] as const;
}

/**
 * A section only softens once it is genuinely finished with. `progress` is how far it has been
 * scrolled through: 0 when its top reaches the top of the viewport, 1 when its bottom does.
 * Nothing happens below BLUR_START, so a section stays sharp the whole time it is being read and
 * anything not yet reached is never touched.
 */
export function useScrollBlur(blurStart = 0.9) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".blur-section"));
    if (!els.length) return;
    let ticking = false;

    const apply = () => {
      ticking = false;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        const h = Math.max(1, r.height);
        const progress = Math.max(0, -r.top / h);
        const t = Math.min(1, Math.max(0, (progress - blurStart) / (1 - blurStart)));
        el.style.setProperty("--sec-blur", `${(t * 7).toFixed(2)}px`);
        el.style.setProperty("--sec-opacity", `${(1 - t * 0.62).toFixed(3)}`);
        el.style.setProperty("--sec-scale", `${(1 - t * 0.022).toFixed(4)}`);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [blurStart]);
}

/**
 * Autoplay is refused in more situations than people expect — power saving, some mobile browsers,
 * a tab that loaded in the background. Nudge it on mount and again on the first interaction so the
 * backdrop is never a frozen frame.
 */
function useAutoplayReel(ref: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = () => {
      const r = v.play();
      if (r && typeof r.catch === "function") r.catch(() => {});
    };
    tryPlay();
    const onVis = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", tryPlay, { once: true });
    window.addEventListener("keydown", tryPlay, { once: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", tryPlay);
      window.removeEventListener("keydown", tryPlay);
    };
  }, [ref]);
}

/** The reel behind the whole page, fixed while content scrolls over it. */
export function PageBackdrop() {
  const reelRef = useRef<HTMLVideoElement>(null);
  useAutoplayReel(reelRef);
  return (
    <div className="page-backdrop" aria-hidden="true">
      <video ref={reelRef} autoPlay muted loop playsInline preload="auto">
        <source src="/video/about-reel.mp4" type="video/mp4" />
      </video>
      <div className="page-grade" />
      <div className="page-vignette" />
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal${shown ? " is-in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Title-sequence heading: each word rises on its own beat. */
export function TitleWords({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [ref, shown] = useInView<HTMLHeadingElement>("-30px 0px -10% 0px");
  return (
    <h1 ref={ref} style={style}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          className={`word${shown ? " is-in" : ""}`}
          style={{ transitionDelay: `${180 + i * 130}ms`, marginRight: "0.25em" }}
        >
          {w}
        </span>
      ))}
    </h1>
  );
}

export function SectionLabel({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
      <span
        className="mono"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: "var(--burgundy)",
          border: "1px solid rgba(138,47,60,0.5)",
          padding: "6px 11px",
          whiteSpace: "nowrap",
        }}
      >
        REEL {no}
      </span>
      <span
        className="mono"
        style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5 }}
      >
        {children}
      </span>
    </div>
  );
}

export function Filmstrip() {
  return <div className="filmstrip" />;
}
