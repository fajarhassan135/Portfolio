"use client";

import { useState } from "react";
import Scene from "@/components/Scene";
import SidePanel from "@/components/SidePanel";

type StationData = { eyebrow: string; title: string; body: string };

export default function Home() {
  const [panel, setPanel] = useState<StationData | null>(null);

  return (
    <>
      <Scene onOpenPanel={setPanel} panelOpen={!!panel} />

      <div
        style={{
          position: "fixed",
          left: "5vw",
          top: "12vh",
          zIndex: 10,
          maxWidth: 440,
          pointerEvents: "none",
          background: "rgba(5,5,10,0.55)",
          backdropFilter: "blur(6px)",
          padding: "18px 22px",
          borderRadius: 6,
          borderLeft: "2px solid var(--burgundy)",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Portfolio — 2026
        </div>
        <h1
          style={{
            fontSize: "clamp(22px, 3.2vw, 36px)",
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}
        >
          Walk up to the desk.
        </h1>
      </div>

      <div
        className="mono desktop-only"
        style={{
          position: "fixed",
          bottom: "4vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--purple-line)",
          opacity: 0.7,
          zIndex: 10,
          background: "rgba(5,5,10,0.5)",
          padding: "8px 16px",
          borderRadius: 20,
        }}
      >
        drag to rotate · scroll to zoom · click ground to walk · hover + click an item to open it
      </div>
      <div
        className="mono mobile-only"
        style={{
          position: "fixed",
          bottom: "4vh",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--purple-line)",
          opacity: 0.7,
          zIndex: 10,
          textAlign: "center",
          background: "rgba(5,5,10,0.5)",
          padding: "8px 16px",
          borderRadius: 20,
        }}
      >
        drag to rotate · pinch to zoom · tap to walk or open an item
      </div>

      <SidePanel data={panel} onClose={() => setPanel(null)} />
    </>
  );
}
