"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * The four films, shown one at a time, opened by clicking the stack of cases on the table.
 *
 * POSTERS. Any poster that is missing from public/posters falls back to a drawn card rather than a
 * broken image icon: the title set in the same gold on the same dark ground. Drop a file in at the
 * path named below and it takes over with no code change.
 *
 * ONE IMAGE AT A TIME. Only the current film's <img> is mounted, so the other three are never
 * fetched until they are asked for. Preloading all four would pull roughly half a megabyte for a
 * panel most visitors never open.
 */

export type Film = {
  title: string;
  tagline: string;
  poster: string | null;
  reason: string;
};

export const FILMS: Film[] = [
  {
    title: "La La Land",
    tagline: "Ambition, love, and the cost of choosing",
    poster: "/posters/lalaland.jpg",
    reason:
      "The way it frames ambition and sacrifice spoke to me, watching two people pursue their passions while struggling to keep each other close. The cinematography is a masterclass in visual storytelling; every frame feels intentional. It reminded me that the most beautiful stories aren't always about happy endings, they're about growth and what we choose.",
  },
  {
    title: "Arrival",
    tagline: "Language as a way of seeing time",
    poster: "/posters/arrival.jpg",
    reason:
      "The core idea that language shapes reality fascinates me as someone who codes daily; it's not so different from how we communicate with machines. The film's intelligence doesn't rely on spectacle; it trusts the audience. Amy Adams' performance is quietly devastating, and the emotional payoff hits because the story earns it. Time, perception, sacrifice, it asks the right questions.",
  },
  {
    title: "Rockstar",
    tagline: "The price of making something real",
    poster: "/posters/rockstar.jpg",
    reason:
      "Ranbir's raw vulnerability mixed with manic energy captures what it feels like to be consumed by creation. A.R. Rahman's soundtrack is pure emotion, no filter, no compromise. The film doesn't glamorize the chaos; it shows the cost of chasing something you can't live without. That's something I relate to in building things.",
  },
  {
    title: "Requiem for a Dream",
    tagline: "How quietly a life comes apart",
    poster: "/posters/requiem.jpg",
    reason:
      "It's uncompromising in showing how easily we spiral. The visual language, the rapid cuts, the distortions, the way it pulls you into each character's headspace, is cinema at its most visceral. Clint Mansell's score haunts me every time. It's not entertainment; it's a warning wrapped in art. That's the kind of storytelling I respect.",
  },
];

export default function FilmCarousel({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const cardRef = useRef<HTMLDivElement>(null);
  /* The header must not move when the film changes, so the swap animates an inner wrapper rather
     than the card. Animating the card would slide the joke off screen four times a visit. */
  const swapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback((dir: number) => {
    const card = swapRef.current;
    if (!card) return setI((v) => (v + dir + FILMS.length) % FILMS.length);
    // fade and slide out, swap at the invisible point, then scale in: the swap is never seen
    gsap.to(card, {
      opacity: 0,
      x: dir * -26,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setI((v) => (v + dir + FILMS.length) % FILMS.length);
        gsap.fromTo(
          card,
          { opacity: 0, x: dir * 26, scale: 1 },
          { opacity: 1, x: 0, scale: 1, duration: 0.25, ease: "power2.out" }
        );
        gsap.fromTo(
          card.querySelector(".film-poster"),
          { scale: 1 },
          { scale: 1.05, duration: 0.5, ease: "power2.out" }
        );
      },
    });
  }, []);

  // open animation, and focus moves into the panel so a keyboard user is not left behind it
  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    gsap.fromTo(shell, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 22, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", delay: 0.05 }
    );
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const f = FILMS[i];
  const showPoster = f.poster && !broken[f.poster];

  return (
    <div
      ref={shellRef}
      className="film-shell"
      role="dialog"
      aria-modal="true"
      aria-label="Films I love"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose(); // click the backdrop, not the card
      }}
    >
      <div className="film-card" ref={cardRef}>
        <button ref={closeRef} className="film-close" onClick={onClose} aria-label="Close films">
          ×
        </button>

        <header className="film-header">
          <h1>
            My Top 4 Films: A Collection of Beautiful Sadness<sup>™</sup>
          </h1>
          <p>All four will wreck you. That is the recommendation.</p>
        </header>

        <div className="film-swap" ref={swapRef}>
          <div className="film-poster-wrap">
            {showPoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="film-poster"
                src={f.poster as string}
                alt={`${f.title} poster`}
                onError={() => setBroken((b) => ({ ...b, [f.poster as string]: true }))}
              />
            ) : (
              <div className="film-poster film-poster-missing" aria-hidden="true">
                <span>{f.title}</span>
              </div>
            )}
          </div>

          <div className="film-body">
            <div className="eyebrow">
              Film {i + 1} of {FILMS.length}
            </div>
            <h2 className="film-title">{f.title}</h2>
            <p className="film-tagline">{f.tagline}</p>
            <p className="film-reason">{f.reason}</p>

            <div className="film-nav">
              <button className="film-arrow" onClick={() => go(-1)} aria-label="Previous film">
                ←
              </button>
              <div className="film-dots" aria-hidden="true">
                {FILMS.map((x, n) => (
                  <span key={x.title} className={n === i ? "is-on" : undefined} />
                ))}
              </div>
              <button className="film-arrow" onClick={() => go(1)} aria-label="Next film">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
