"use client";

import { useState } from "react";
import Scene from "@/components/Scene";
import SidePanel from "@/components/SidePanel";

type StationData = { eyebrow: string; title: string; body: string };

export default function Play() {
  const [panel, setPanel] = useState<StationData | null>(null);

  return (
    <>
      <Scene onOpenPanel={setPanel} dense />
      <div
        style={{
          position: "fixed",
          left: "5vw",
          top: "12vh",
          zIndex: 10,
          maxWidth: 460,
          pointerEvents: "none",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Play mode
        </div>
        <h1 style={{ fontSize: "clamp(22px, 3.6vw, 34px)" }}>
          Explore the full space.
        </h1>
      </div>
      <SidePanel data={panel} onClose={() => setPanel(null)} />
    </>
  );
}
