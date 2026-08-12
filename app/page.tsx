"use client";

import { useCallback, useEffect, useState } from "react";
import Scene from "@/components/Scene";
import ExteriorScene from "@/components/ExteriorScene";
import SidePanel from "@/components/SidePanel";
import LoadingScreen from "@/components/LoadingScreen";
import MusicToggle from "@/components/MusicToggle";

type StationData = { eyebrow: string; title: string; body: string };
type Stage = "ext-loading" | "exterior" | "int-loading" | "interior";

export default function Home() {
  const [stage, setStage] = useState<Stage>("ext-loading");
  const [extReady, setExtReady] = useState(false);
  const [intReady, setIntReady] = useState(false);
  const [panel, setPanel] = useState<StationData | null>(null);

  useEffect(() => {
    if (stage === "ext-loading" && extReady) {
      const t = setTimeout(() => setStage("exterior"), 950);
      return () => clearTimeout(t);
    }
  }, [stage, extReady]);

  useEffect(() => {
    if (stage === "int-loading" && intReady) {
      const t = setTimeout(() => setStage("interior"), 950);
      return () => clearTimeout(t);
    }
  }, [stage, intReady]);

  // stable references — Scene/ExteriorScene key these into their setup effect's deps array,
  // so an inline arrow here would tear down and rebuild the whole 3D scene on every re-render
  // (e.g. every station click, since that flows through setPanel and re-renders this component)
  const handleEnter = useCallback(() => {
    setIntReady(false);
    setStage("int-loading");
  }, []);
  // mirrors handleEnter — same two-stage dance in reverse. Reusing "ext-loading" is safe: since
  // ExteriorScene is unmounted while showExterior is false, this is a genuine fresh mount, and
  // LoadingScreen (keyed off loadingPhase) remounts fresh too since it was unrendered in between.
  const handleExit = useCallback(() => {
    setExtReady(false);
    setStage("ext-loading");
  }, []);
  const handleExtReady = useCallback(() => setExtReady(true), []);
  const handleIntReady = useCallback(() => setIntReady(true), []);

  const showExterior = stage === "ext-loading" || stage === "exterior";
  const showInterior = stage === "int-loading" || stage === "interior";
  const loadingPhase = stage === "ext-loading" ? "ext" : stage === "int-loading" ? "int" : null;
  const loadingReady = loadingPhase === "ext" ? extReady : loadingPhase === "int" ? intReady : false;

  return (
    <>
      {loadingPhase && <LoadingScreen key={loadingPhase} ready={loadingReady} />}

      {showExterior && <ExteriorScene onEnter={handleEnter} onReady={handleExtReady} />}

      {showInterior && (
        <Scene onOpenPanel={setPanel} onReady={handleIntReady} panelOpen={!!panel} onExit={handleExit} />
      )}

      {stage === "interior" && (
        <>
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
          <MusicToggle />
        </>
      )}
    </>
  );
}