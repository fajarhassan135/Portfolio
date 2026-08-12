"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  ready: boolean;
};

const SEGMENTS = 22;

// hand-set checkpoints, uneven gaps on purpose — mimics real chunky loading
// rather than a perfectly smooth count, and the gaps widen near the end so
// the last few numbers land slower, building anticipation
const STEPS = [1, 3, 5, 8, 10, 14, 18, 23, 29, 35, 41, 47, 53, 59, 65, 70, 75, 79, 83, 86, 88, 90, 92];
const STEP_DELAY_MS = 260; // base gap between jumps
const STEP_DELAY_GROWTH = 1.05; // each jump waits slightly longer than the last

export default function LoadingScreen({ ready }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // advance one checkpoint at a time, each wait slightly longer than the last
  useEffect(() => {
    if (ready) return;
    if (stepIndex >= STEPS.length - 1) return;
    const delay = STEP_DELAY_MS * Math.pow(STEP_DELAY_GROWTH, stepIndex);
    timerRef.current = setTimeout(() => setStepIndex((i) => i + 1), delay);
    return () => clearTimeout(timerRef.current);
  }, [stepIndex, ready]);

  // once ready, snap to 100 then fade out
  useEffect(() => {
    if (!ready) return;
    const fadeTimer = setTimeout(() => setVisible(false), 420);
    const unmountTimer = setTimeout(() => setMounted(false), 950);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [ready]);

  if (!mounted) return null;

  const pct = ready ? 100 : STEPS[stepIndex];
  const litSegments = Math.round((pct / 100) * SEGMENTS);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#05050a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--purple-line)",
          opacity: 0.85,
          marginBottom: 14,
        }}
      >
        Loading Scene
      </div>

      <div
        className="mono"
        style={{
          fontSize: "clamp(18px, 2.2vw, 24px)",
          color: "#ece7d8",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          marginBottom: 16,
        }}
      >
        {pct}%
      </div>

      {/* segmented / pixelated meter — thicker, narrower footprint */}
      <div
        style={{
          display: "flex",
          gap: 2,
          width: "min(170px, 44vw)",
          height: 10,
        }}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const lit = i < litSegments;
          const t = i / (SEGMENTS - 1);
          const litColor = `color-mix(in srgb, var(--burgundy) ${(1 - t) * 100}%, var(--purple-line) ${t * 100}%)`;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: "100%",
                background: lit ? litColor : "rgba(255,255,255,0.08)",
                transition: "background 90ms steps(1)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}