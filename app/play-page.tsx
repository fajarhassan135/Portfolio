"use client";

import { useState } from "react";
import Scene from "@/components/Scene";
import SidePanel from "@/components/SidePanel";

type StationData = { eyebrow: string; title: string; body: string; href?: string; hrefLabel?: string };

export default function Play() {
  const [panel, setPanel] = useState<StationData | null>(null);

  return (
    <>
      <Scene onOpenPanel={setPanel} panelOpen={!!panel} dense />
      <div
        style={{
          position: "fixed",
          left: "5vw",
          top: "12vh",
          zIndex: 10,
          maxWidth: 400,
          pointerEvents: "none",
          background: "rgba(5,5,10,0.55)",
          backdropFilter: "blur(6px)",
          padding: "16px 20px",
          borderRadius: 6,
          borderLeft: "2px solid var(--burgundy)",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Play mode
        </div>
        <h1 style={{ fontSize: "clamp(18px, 2.6vw, 26px)", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
          Explore the full space.
        </h1>
      </div>
      <SidePanel data={panel} onClose={() => setPanel(null)} />
    </>
  );
}
