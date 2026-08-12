"use client";

import { useRef, useState } from "react";

export default function MusicToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setErrored(true));
    }
  };

  return (
    <>
      {/* Replace src with your own track at public/audio/theme.mp3 (royalty-free or licensed) */}
      <audio ref={audioRef} src="/audio/theme.mp3" loop preload="none" />
      <button
        onClick={toggle}
        className="mono"
        style={{
          position: "fixed",
          bottom: "4vh",
          right: "5vw",
          zIndex: 30,
          background: "rgba(5,5,10,0.6)",
          border: "1px solid var(--purple-line)",
          color: errored ? "var(--burgundy)" : "var(--vellum)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "10px 16px",
          borderRadius: 20,
          cursor: "pointer",
        }}
      >
        {errored ? "No track loaded" : playing ? "♪ Music on" : "Put on music"}
      </button>
    </>
  );
}
