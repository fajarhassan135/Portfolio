"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactRoom, { type Pick, type ScreenRect } from "@/components/ContactRoom";
import NameAscii from "@/components/NameAscii";
import FilmCarousel from "@/components/FilmCarousel";
import { SOCIALS } from "./socials";

gsap.registerPlugin(ScrollTrigger);

const NAME = "FAJAR WARRIACH";
const LOCATION = "Faisalabad, Pakistan";

/**
 * The page runs in two acts, because the projection and the cards want opposite things from the
 * viewport and cannot both have it.
 *
 * ACT 1, the stage. The room is full-screen and the projection surface is half the frame wide, which
 * is what makes the projected tagline and reason readable at all (62px base type at a 760px
 * viewport). Scrolling through the stage cycles the projector: Email, GitHub, Instagram, LinkedIn.
 *
 * ACT 2, the page. The room dims to a backdrop and the real content scrolls over it: the name, then
 * one card per channel, then the films.
 *
 * WHY NOT SIDE BY SIDE. A column of cards beside the room would leave the room roughly half a
 * viewport wide. Solved against that pane the projection surface comes out 428x243px, which puts the
 * projected type at 41px base and the reason text at around 11px. The whole point of the projection
 * is that it is legible, so the two acts are sequential instead.
 */

export default function Contact() {
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(0);
  const [films, setFilms] = useState(false);
  const [dim, setDim] = useState(false);
  const [hinted, setHinted] = useState(false); // true once the visitor has scrolled at all

  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoDone = useRef(false);

  const handleRect = useCallback((r: ScreenRect | null) => setRect(r), []);

  const handlePick = useCallback((what: Pick) => {
    if (what === "projector") {
      autoDone.current = true; // a deliberate toggle outranks the scroll trigger from then on
      setOn((v) => !v);
    } else {
      setFilms(true);
    }
  }, []);

  /* ---- scroll drives the projector ----------------------------------------------------------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      SOCIALS.forEach((_, i) => {
        const el = document.getElementById(`stage-${i}`);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });

      /* The projector switches itself on the first time the page is scrolled at all, which is the
         flow the spec describes. Once, and never again: re-arming it would fight anyone who turned
         it off on purpose and then kept scrolling. */
      ScrollTrigger.create({
        start: 40,
        end: "max",
        onEnter: () => {
          setHinted(true); // they have started scrolling; the hint has done its job
          if (autoDone.current) return;
          autoDone.current = true;
          setOn(true);
        },
      });

      // once the page content takes over, the room drops back to being a backdrop
      const page = document.getElementById("contact-page");
      if (page) {
        ScrollTrigger.create({
          trigger: page,
          start: "top 75%",
          end: "bottom bottom",
          onToggle: (self) => setDim(self.isActive),
        });
      }

      // the cards rise as they come into frame, their inner rows staggered behind them
      gsap.utils.toArray<HTMLElement>(".sc-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 46,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 82%" },
        });
        gsap.from(card.querySelectorAll(".sc-stagger"), {
          opacity: 0,
          y: 18,
          duration: 0.6,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 82%" },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  /* ---- swap the projected block --------------------------------------------------------------
     Every block stays mounted and is faded rather than unmounted, so there is always an outgoing
     element to fade out of and the transition is never a cut. */
  useEffect(() => {
    const shown = on ? active : -1;
    const tl = gsap.timeline();

    /* Out, then in, never both at once. Crossfading two blocks that occupy the same box means both
       are partly visible for the whole overlap, and since the type is dark ink on a lit surface that
       reads as one section ghosting through another. Sequencing costs 0.5s and removes it entirely.
       `visibility` is driven off the same timeline so a faded block cannot catch a stray hit. */
    blockRefs.current.forEach((el, i) => {
      if (!el || i === shown) return;
      tl.to(el, { opacity: 0, duration: 0.5, ease: "power2.in", overwrite: "auto" }, 0);
      tl.set(el, { visibility: "hidden" }, 0.5);
      el.style.pointerEvents = "none";
      el.inert = true;
    });

    const el = shown >= 0 ? blockRefs.current[shown] : null;
    if (el) {
      tl.set(el, { visibility: "visible" }, 0.5);
      tl.to(el, { opacity: 1, duration: 0.5, ease: "power2.out", overwrite: "auto" }, 0.5);
      el.style.pointerEvents = "auto";
      el.inert = false;
    }

    return () => {
      tl.kill();
    };
  }, [active, on]);

  /* The overlay is sized and placed from the screen's own projected rectangle, so it lands exactly
     on the projection surface at any viewport. Type scales with that rect rather than with the
     viewport, or it would drift off the screen edge as the window changed shape. */
  const style: React.CSSProperties | undefined = rect
    ? { left: rect.x, top: rect.y, width: rect.w, height: rect.h, fontSize: Math.max(13, rect.h * 0.115) }
    : undefined;

  const setBlock = (i: number) => (el: HTMLDivElement | null) => {
    blockRefs.current[i] = el;
  };

  return (
    <>
      <div className={dim ? "room-holder is-dim" : "room-holder"}>
        <ContactRoom on={on} onScreenRect={handleRect} onPick={handlePick} />
      </div>

      {/* ---- what the projector projects: the active channel, and nothing else ---- */}
      <div className={rect ? "projection" : "projection projection-fallback"} style={style}>
        <div className="projection-inner">
          {SOCIALS.map((s, i) => (
            <div className="projection-block" key={s.key} ref={setBlock(i)} style={{ opacity: 0 }}>
              <span className={`proj-icon${s.brandMark ? " is-brand" : ""}`} aria-hidden="true">
                {s.icon}
              </span>
              <span className="proj-label">{s.label}</span>
              <p className="proj-tagline">{s.tagline}</p>
              <p className="proj-reason">{s.reason}</p>
              <a
                className="mono proj-handle"
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                title={s.label}
              >
                {s.handle}
              </a>
            </div>
          ))}
        </div>
      </div>

      {on && (
        <button
          className="proj-close"
          onClick={() => {
            autoDone.current = true;
            setOn(false);
          }}
          aria-label="Turn the projector off"
        >
          ×
        </button>
      )}

      {films && <FilmCarousel onClose={() => setFilms(false)} />}

      {/* Tells you the socials arrive by scrolling, then gets out of the way the moment you do. */}
      <div className={hinted ? "scroll-hint is-gone" : "scroll-hint"} aria-hidden={hinted}>
        <span className="mono">Scroll down to explore</span>
        <span className="scroll-hint-arrow" aria-hidden="true" />
      </div>

      {/* ---- ACT 1: the stage. Empty full-height blocks whose only job is to give ScrollTrigger
              something to measure while the room is the whole view. ---- */}
      <div className="contact-stage" aria-hidden="true">
        {SOCIALS.map((s, i) => (
          <section key={s.key} id={`stage-${i}`} className="stage-step" />
        ))}
      </div>

      {/* ---- ACT 2: the page ---- */}
      <main id="contact-page" className="contact-page">
        <section className="sc-name">
          <NameAscii name={NAME} active />
          <p className="mono sc-name-hint">move your cursor across the name</p>
        </section>

        {SOCIALS.map((s) => (
          <section
            key={s.key}
            className={`sc-card sc-${s.key}`}
            style={{ ["--accent" as string]: s.accent }}
          >
            <div className={`sc-icon sc-stagger${s.brandMark ? " is-brand" : ""}`} aria-hidden="true">
              {s.icon}
            </div>
            <div className="sc-body">
              <div className="eyebrow sc-stagger">{s.label}</div>
              <h2 className="sc-tagline sc-stagger">{s.tagline}</h2>
              <p className="sc-reason sc-stagger">{s.reason}</p>
              <a
                className="mono sc-handle sc-stagger"
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {s.handle}
                <span className="sc-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </section>
        ))}

        {/* ---- the films ---- */}
        <section className="sc-films">
          <h2 className="sc-films-title">
            My Top 4 Films: A Collection of Beautiful Sadness<sup>™</sup>
          </h2>
          <button className="sc-films-open" onClick={() => setFilms(true)}>
            <span className="sc-films-stack" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="mono sc-films-cta">Open the carousel</span>
          </button>
        </section>

        <footer className="sc-foot">
          <span className="sc-foot-loc">{LOCATION}</span>
          <Link href="/" className="sc-foot-home">
            Go to Home
          </Link>
          <span className="sc-foot-mark" aria-hidden="true">
            © {new Date().getFullYear()}
          </span>
        </footer>
      </main>
    </>
  );
}
