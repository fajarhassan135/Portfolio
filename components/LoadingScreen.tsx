"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  ready: boolean;
  onDone?: () => void;
};

// The whole loading screen is capped at 6 seconds, wall clock, and the budget is split here.
//
// It used to be 100 chained setTimeouts of 40ms rising to 65ms. That is ~5.25s of *requested*
// delay, but every timer fires a few ms late and the error compounds over 100 of them, so the real
// count regularly ran past 5.6s and the total past 6.4s. Worse, leaving also required `ready`, so a
// slow scene could hold the screen indefinitely. Neither is capped.
//
// So the count is driven off one rAF clock against a fixed budget instead. It still shows every
// number 0..100 and still decelerates: `pctAtElapsed` is the exact inverse of the old 40ms -> 65ms
// ramp, so the pacing is unchanged while the finish is now deterministic.
const COUNT_MS = 5240;
const HANDOFF_MS = 760; // fade out, then hand over
const TOTAL_MS = COUNT_MS + HANDOFF_MS; // exactly 6000

/**
 * Inverse of the original ramp. Cumulative delay to reach p was 40p + 0.125p^2, which is 5250 at
 * p=100; solving that quadratic for p gives the position at a given fraction of the count.
 */
function pctAtElapsed(elapsed: number) {
  const tau = Math.min(1, Math.max(0, elapsed / COUNT_MS));
  return Math.min(100, Math.round((Math.sqrt(1600 + 2625 * tau) - 40) / 0.25));
}

// One is picked at random per load. Every one is about the same thing: a piece of engineering that
// unlocked something artists could not do before. That is the whole premise of this site — a cinema
// built out of code — so the facts stay on that theme rather than wandering into general computing.
const FUN_FACTS: string[] = [
  "Cinema runs at 24 frames per second for an engineering reason, not an artistic one. It was the slowest speed that still carried a usable optical soundtrack down the side of the film.",
  "The Lumiere Cinematographe was camera, film printer and projector in a single hand cranked box. One clever mechanism turned a laboratory experiment into a night out.",
  "The Jazz Singer (1927) synced sound from a separate disc spinning alongside the projector. It was fragile and easily knocked out of sync, and it ended the silent era anyway.",
  "Technicolor's three strip camera exposed three negatives at once through a prism. It weighed a great deal and needed blazing light, which is why 1930s Technicolor films look so theatrically bright.",
  "Mary Poppins (1964) needed Petro Vlahos's sodium vapour process to put actors cleanly over painted worlds. The compositing problem he solved is the direct ancestor of every green screen today.",
  "The Steadicam, invented by Garrett Brown in the 1970s, put a gimbal between operator and camera. Suddenly the camera could run, climb stairs and glide, motion that had simply been impossible.",
  "Star Wars (1977) needed repeatable camera moves to layer its effects, so ILM built the Dykstraflex. A motion control rig driven by a computer, made for one film.",
  "Westworld (1973) was the first feature to put computer generated imagery on screen. A pixelated point of view, standing in for how a machine sees.",
  "Disney's CAPS system made The Rescuers Down Under (1990) the first animated feature with no photographed cels at all. The ink and paint moved into software.",
  "Toy Story (1995) was rendered on 117 networked workstations, some frames taking 30 hours. The constraint shaped the art, and plastic toys were chosen partly because plastic was achievable.",
  "Gollum in The Two Towers (2002) kept Andy Serkis's performance and replaced only the body. Motion capture turned visual effects into a place where acting could happen.",
  "The Matrix fired 120 still cameras in sequence around the actor for bullet time. A mechanical rig performing what would later become a software problem.",
  "O Brother, Where Art Thou? (2000) was the first feature graded entirely as a digital intermediate, letting the Coens drain a lush green summer into dry sepia across the whole film.",
  "Non linear editing replaced physically cutting and taping film. Editors could suddenly try a version, undo it, and try again. The single biggest change to how films are shaped.",
  "The Mandalorian (2019) lit its actors with an LED wall playing the environment in real time. Reflections, firelight and sunsets became things you could simply film.",
];

export default function LoadingScreen({ ready, onDone }: Props) {
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const doneRef = useRef(false);

  /**
   * Picked on the client only, after mount.
   *
   * This used to be `useMemo(() => FUN_FACTS[Math.floor(Math.random() * ...)], [])`, which runs
   * during render — including the server render. The server picked one fact, the client picked a
   * different one, and React threw a hydration mismatch on the text node every single load.
   *
   * `useMemo` is not a client-only escape hatch; nothing that renders can call Math.random and
   * still hydrate. Choosing in an effect is what guarantees the server and the first client render
   * agree, because at that point both have produced the same empty string.
   */
  const [fact, setFact] = useState("");
  useEffect(() => {
    setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  }, []);

  // One clock, read on every frame. Deliberately NOT short-circuited by `ready`: the scene usually
  // finishes long before the count does, and snapping to 100 the instant it did was what made the
  // fact flash past unread. The count always runs its full length, and never longer.
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = () => {
      const elapsed = performance.now() - start;
      setPct(pctAtElapsed(elapsed));
      if (elapsed < COUNT_MS) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // The hard cap. The screen leaves once the count has landed AND the scene is ready, or at 6s
  // regardless, whichever comes first. That second half is the cap: it means a slow machine can be
  // shown the scene a moment before it has finished settling, which is the deliberate trade for
  // never sitting on the loader longer than 6 seconds.
  const leaveRef = useRef<() => void>(() => {});
  leaveRef.current = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setVisible(false); // 380ms CSS fade
    timerRef.current = setTimeout(() => onDone?.(), HANDOFF_MS);
  };

  // armed once, on mount, so nothing can push the deadline back
  useEffect(() => {
    const cap = setTimeout(() => leaveRef.current(), TOTAL_MS - HANDOFF_MS);
    return () => {
      clearTimeout(cap);
      clearTimeout(timerRef.current);
    };
  }, []);

  const countDone = pct >= 100;
  useEffect(() => {
    if (countDone && ready) leaveRef.current();
  }, [countDone, ready]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: visible ? "auto" : "none",
        padding: "0 6vw",
      }}
    >
      {/* fun fact sits above the meter so the eye lands on it while waiting */}
      <div
        style={{
          maxWidth: 620,
          textAlign: "center",
          color: "rgba(233,230,240,0.72)",
          fontSize: "clamp(12px, 1.5vw, 15px)",
          lineHeight: 1.65,
          marginBottom: "clamp(28px, 5vh, 54px)",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 9,
            // tighter tracking than the old two-word label — at 0.34em a line this long got sparse
            // and hard to scan
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--purple-line)",
            marginBottom: 12,
            lineHeight: 1.7,
          }}
        >
          While you wait, here&rsquo;s a fun fact about how tech helped cinema grow
        </div>
        {/* The height is reserved because `fact` is empty for the first frame: it is chosen in an
            effect to keep hydration stable. Without a floor here the block would grow from nothing
            to three lines on the second frame and shove the meter down the screen. */}
        <div style={{ minHeight: "4.95em" }}>{fact}</div>
      </div>

      {/* meter block, laid out like the reference: label + big number, bar beneath */}
      <div style={{ width: "min(300px, 62vw)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 8 }}>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#ffffff",
                marginBottom: 2,
              }}
            >
              Loading:
            </div>
            <div
              className="mono"
              style={{
                fontSize: "clamp(26px, 3.4vw, 38px)",
                fontWeight: 700,
                color: "#ffffff",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {pct}%
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              paddingBottom: 4,
            }}
          >
            See you inside
          </div>
        </div>

        {/* outlined trough that fills with purple, per the reference */}
        <div
          style={{
            width: "100%",
            height: 18,
            border: "1.5px solid #ffffff",
            padding: 2,
            background: "transparent",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--purple-line)",
              transition: "width 220ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
