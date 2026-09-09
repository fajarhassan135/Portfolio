"use client";

import { useCallback, useEffect, useState } from "react";
import Scene from "@/components/Scene";
import ExteriorScene from "@/components/ExteriorScene";
import SidePanel from "@/components/SidePanel";
import LoadingScreen from "@/components/LoadingScreen";
import MusicToggle from "@/components/MusicToggle";

type StationData = { eyebrow: string; title: string; body: string; href?: string; hrefLabel?: string };

/**
 * The cinema is the landing view. Visitors arrive inside the room, which is where the portfolio
 * content actually lives, and the street is somewhere they can step out to rather than a hallway
 * they have to walk through first.
 *
 *   int-loading -> interior            (arrival, and returning from outside)
 *   interior    -> ext-loading         (clicking the EXIT door)
 *   ext-loading -> exterior            (the street)
 *   exterior    -> int-loading         (clicking the cinema doors, as before)
 */
type Stage = "int-loading" | "interior" | "ext-loading" | "exterior";

export default function Home() {
  const [stage, setStage] = useState<Stage>("int-loading");
  const [intReady, setIntReady] = useState(false);
  const [extReady, setExtReady] = useState(false);
  const [panel, setPanel] = useState<StationData | null>(null);

  // close any open station panel whenever we change rooms
  useEffect(() => {
    if (stage === "ext-loading" || stage === "int-loading") setPanel(null);
  }, [stage]);

  // stable references — Scene/ExteriorScene key these into their setup effect's deps array,
  // so an inline arrow here would tear down and rebuild the whole 3D scene on every re-render
  // (e.g. every station click, since that flows through setPanel and re-renders this component)
  const handleExit = useCallback(() => {
    setExtReady(false);
    setStage("ext-loading");
  }, []);
  const handleEnter = useCallback(() => {
    setIntReady(false);
    setStage("int-loading");
  }, []);
  const handleIntReady = useCallback(() => setIntReady(true), []);
  const handleExtReady = useCallback(() => setExtReady(true), []);

  // the loader decides when it is finished: it holds until its 0..100 count has fully run so the
  // fun fact is readable even when the scene behind it is ready almost immediately
  const handleLoadingDone = useCallback(() => {
    setStage((s) => (s === "int-loading" ? "interior" : s === "ext-loading" ? "exterior" : s));
  }, []);

  const showInterior = stage === "int-loading" || stage === "interior";
  const showExterior = stage === "ext-loading" || stage === "exterior";
  const loadingPhase = stage === "int-loading" ? "int" : stage === "ext-loading" ? "ext" : null;
  const loadingReady = loadingPhase === "int" ? intReady : loadingPhase === "ext" ? extReady : false;

  return (
    <>
      {/* keyed so each transition gets a fresh loader: a new count and a new fun fact */}
      {loadingPhase && (
        <LoadingScreen key={loadingPhase} ready={loadingReady} onDone={handleLoadingDone} />
      )}

      {showInterior && (
        <Scene onOpenPanel={setPanel} onReady={handleIntReady} panelOpen={!!panel} onExit={handleExit} />
      )}

      {showExterior && <ExteriorScene onEnter={handleEnter} onReady={handleExtReady} />}

      {stage === "interior" && (
        <>

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
            drag to rotate · scroll to zoom · click ground to walk · click the EXIT door to step outside
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
            drag to rotate · pinch to zoom · tap to walk · tap the EXIT door to go outside
          </div>

          <SidePanel data={panel} onClose={() => setPanel(null)} />
          <MusicToggle />
        </>
      )}

      {stage === "exterior" && (
        <div
          className="mono"
          style={{
            position: "fixed",
            bottom: "4vh",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--purple-line)",
            opacity: 0.75,
            zIndex: 10,
            textAlign: "center",
            background: "rgba(5,5,10,0.5)",
            padding: "8px 16px",
            borderRadius: 20,
          }}
        >
          click the cinema doors to go back inside
        </div>
      )}
    </>
  );
}
