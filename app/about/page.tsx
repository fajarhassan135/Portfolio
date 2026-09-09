"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SkillReel from "@/components/SkillReel";
import PortraitTilt from "@/components/PortraitTilt";
import CursorGlowBackground from "@/components/CursorGlowBackground";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/* ============================================================================
   CONTENT — everything you need to edit lives in this block.
   Anything marked TODO is placeholder written to show the shape of the section;
   replace it with your own words. Nothing below this block needs touching.
   ========================================================================== */

const CONTENT = {
  name: "Fajar Hassan",
  tagline: "Full-stack developer and AI engineer.",
  logline: "I build things that work, and sometimes things that shouldn't.",

  // sits under the name and the photo, at the very top of the page
  intro: [
    "I build things that work, and sometimes things that shouldn't. Full-stack development is the day job and LLM work is the part I keep pulling on: AI powered tools, automated chatbots, and the plumbing that connects them to something a real person can actually use.",
    "Right now I'm in my 5th semester of BS Software Engineering at the University of Faisalabad, after ten years at Divisional Model School and College and a first shipped client site along the way. Most of what I know came from building the thing before I knew how to build it.",
    "The cinema this site is wrapped in isn't decoration. Film is the reason I started writing code at all, and the two have never really separated since.",
  ],

  // right-hand rail on the hero
  meta: [
    { label: "Role", value: "Full-stack developer and AI engineer" },
    { label: "Focus", value: "LLM integration, AI chatbots, web apps" },
    { label: "Studying", value: "BS Software Engineering, University of Faisalabad" },
    { label: "Based", value: "Faisalabad, Pakistan" },
  ],

  portrait: "/me.jpg" as string | null,
  portraitCaption: "",

  reels: [
    {
      no: "01",
      slate: "The Opening Scene",
      sub: "How this started",
      body: [
        "The first real thing I built was a movie website. Information on upcoming releases, the ability to rate and review films, add them to your own list, and build a small community around them with other cinephiles. Looking back, it was basically the seed of everything this site is built around now.",
      ],
    },
    {
      no: "02",
      slate: "Production Notes",
      sub: "How I work",
      // each paragraph is introduced by its own question, rendered either side of the skill reel
      introQuestion: "So what do you actually build?",
      intro:
        "My main focus is full-stack development and LLM integration. Building AI powered tools, automated chatbots, and the systems that connect them to a real product.",
      outroQuestion: "And when something breaks, or stops going anywhere?",
      outro:
        "With patience, by actually figuring out what the real issue is instead of doing something mindlessly and hoping it works. That's true whether I'm shipping a feature or stuck in the middle of a project that's stopped being fun. Slow down, find the actual problem, then move.",
      body: [],
    },
    {
      no: "03",
      slate: "Behind the Scenes",
      // was two sections: "Off the clock" carried the photo and nothing else, and repeated this one
      sub: "Off the clock",
      body: [],
      // rendered with the Instagram handle as a real link
      offscreen: true,
      why:
        "Because nothing else is quite as human. A film can take you somewhere you've never been and hand you a person who's never existed, and you still recognize yourself in them. It doesn't just entertain you, it tells you you're not alone. And tech has always been part of that: every leap in cinema's history came from someone with the vision and the skills to build something new. That's the connection for me. If you're a visionary with the right tools, you can build anything, and maybe help the world a little while you're at it.",
    },
  ],

  credits: [],

  schedule: [
    {
      when: "Before this",
      what: "First personal project: a movie discovery and review website",
      where: "The seed of Kinema",
    },
    { when: "2012 to 2022", what: "School", where: "Divisional Model School and College" },
    { when: "2022 to 2024", what: "College", where: "Divisional Model School and College" },
    {
      when: "2024 to 2028",
      what: "BS Software Engineering, currently 5th semester",
      where: "University of Faisalabad",
    },
    {
      when: "2025",
      what: "First shipped client project: website for NA Threads Manufacturing Company",
      where: "",
    },
    { when: "2026", what: "Internship, completed", where: "DeveloperHub" },
    { when: "2026", what: "Internship, completed", where: "CodeCelix" },
  ],

  // Contact details deliberately do not live here. Email, GitHub and LinkedIn belong on the
  // Contact page; this page just points at it.
  closing: {
    heading: "Say hi.",
    body: "No pitch needed. If something here interests you, or you just want to talk about films or code, the inbox is open.",
  },
};

/* ========================================================================== */

function useInView<T extends HTMLElement>(rootMargin = "-40px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, shown] as const;
}

/**
 * As a section scrolls up out of frame it softens and recedes, so the section you are reading is
 * always the sharpest thing on screen and the ones behind it settle back toward the reel.
 * Driven off a rAF-throttled scroll read and written to CSS custom properties, so the actual
 * animation stays on the compositor.
 */
function useScrollBlur() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".blur-section"));
    let ticking = false;

    /* How far a card has been scrolled past, measured in DOCUMENT space rather than from its
       bounding rect. The rect is the wrong ruler here: the cards overlap each other by a negative
       margin and are transformed as they recede, so the rect reports a position that the transform
       itself has already moved. offsetTop is the position in flow, which nothing here changes.

       RECEDE_START is the fraction of a card that has to pass before it starts sinking. It begins
       well before the card is gone, because the point is to see it settle underneath the next one
       while that one arrives, which is what makes it read as stacking rather than as scrolling. */
    const RECEDE_START = 0.45;

    /* True document position, walked up the offsetParent chain. `el.offsetTop` alone is measured
       from the nearest POSITIONED ancestor, and these cards are position: relative inside a
       positioned wrapper, so on its own it returned a small number and every card read as already
       scrolled past: they all rendered dimmed and shrunk before the page had moved at all.

       offsetTop is also the right ruler rather than getBoundingClientRect, because the rect includes
       the recede transform this function is itself applying, which would feed back on itself. */
    const docTop = (el: HTMLElement) => {
      let y = 0;
      let n: HTMLElement | null = el;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return y;
    };

    let tops = els.map(docTop);

    const apply = () => {
      ticking = false;
      const y = window.scrollY;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const h = Math.max(1, el.offsetHeight);
        const passed = (y - tops[i]) / h;
        const t = Math.min(1, Math.max(0, (passed - RECEDE_START) / (1 - RECEDE_START)));
        // eased, so the card slows as it settles instead of sliding linearly under the next
        const e = t * t * (3 - 2 * t);
        el.style.setProperty("--sec-opacity", (1 - e * 0.55).toFixed(3));
        el.style.setProperty("--sec-scale", (1 - e * 0.055).toFixed(4));
        el.style.setProperty("--sec-lift", `${(e * -26).toFixed(1)}px`);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    // the cards change height when the layout reflows, so the cached tops have to be rebuilt
    const onResize = () => {
      tops = els.map(docTop);
      onScroll();
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

/* useAutoplayReel lived here: it nudged the backdrop video into playing. The backdrop is a
   flat plate now, so there is no video to autoplay. */

/**
 * Each section arrives down a curved chute rather than straight up the page.
 *
 * The card starts below and off to one side and travels a quadratic bezier through a control point
 * that is still wide but already high, so it rises first, swings, and only then sweeps laterally
 * into place. That is what separates it from a diagonal slide: the horizontal offset does not decay
 * in step with the vertical one, so the path is genuinely an arc. Sides alternate down the page, so
 * consecutive sections come in from opposite edges.
 *
 * The lean is carried on `rotation` and `rotationY` and both resolve to exactly zero, so nothing is
 * left tilted once the card is at rest.
 *
 * It animates an inner wrapper, never the <section> itself, because the section already carries the
 * scroll-blur's filter/opacity/transform from CSS custom properties and the two would fight over
 * the same properties. `once: true` means each card plays a single time, not on every scroll tick.
 * Scoped to this page: `.about-card` exists nowhere else.
 */
function useCurvedSectionEntry() {
  useEffect(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".about-card");
    if (!cards.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(cards, { opacity: 1, x: 0, y: 0, rotation: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // the swing has to stay inside the viewport on a laptop as well as a wide monitor
      const swing = Math.min(190, Math.max(70, window.innerWidth * 0.15));

      cards.forEach((card, i) => {
        const dir = i % 2 === 0 ? 1 : -1;

        // nothing is visible until its own trigger fires
        gsap.set(card, { opacity: 0, transformPerspective: 1000, transformOrigin: "50% 100%" });

        // ONE definition of the motion, for both directions.
        //
        // The whole section's entrance lives on a single paused timeline: the card's curved slide,
        // and the stagger of its own contents. Scrolling down plays it; scrolling up reverses the
        // same instance. There is no second, upward variant to keep in step, and no separate
        // per-child reveal running on its own observer, which is what previously left the contents
        // sitting still while the card arced away underneath them.
        const kids = Array.from(card.querySelectorAll<HTMLElement>(".reveal-child"));

        const tl = gsap.timeline({ paused: true });
        tl.fromTo(
          card,
          { opacity: 0, scale: 0.962, rotation: dir * 4.5, rotationY: dir * -7 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            rotationY: 0,
            duration: 1.25,
            ease: "power3.out",
            motionPath: {
              // entry, then the wide-but-high control point that bends the path, then rest
              path: [
                { x: dir * swing, y: 132 },
                { x: dir * swing * 0.82, y: -16 },
                { x: 0, y: 0 },
              ],
              curviness: 1.45,
            },
          }
        );

        if (kids.length) {
          tl.fromTo(
            kids,
            { opacity: 0, y: 26 },
            { opacity: 1, y: 0, duration: 0.62, ease: "power2.out", stagger: 0.075 },
            0.3 // overlaps the card's slide, so the contents settle as it lands
          );
        }

        ScrollTrigger.create({
          trigger: card,
          start: "top 86%",
          // Reversing needs an end, otherwise there is nothing to leave backwards through. The
          // card retreats once its own bottom has climbed back past the top of the viewport.
          end: "bottom top",
          onEnter: () => tl.play(), // scrolling down, card arrives: forward along the arc
          onEnterBack: () => tl.play(), // scrolling up, coming back to a card already seen
          onLeaveBack: () => tl.reverse(), // scrolling up past the entry point: run the arc back
          // deliberately no onLeave: scrolling DOWN past a card must leave it at rest, not send it
          // back down the slide it just came up

          // A card whose entry point is ALREADY behind the scroll position on load never gets an
          // onEnter, because nothing crosses the start. That is every card above the fold, the hero
          // included, and it left them stuck at opacity 0 with the page looking empty. Settle them
          // at rest instead. This has to run on every refresh, not just at creation, because fonts
          // and the backdrop settling re-measure the start.
          onRefresh: (self) => {
            if (self.progress > 0 && !tl.isActive()) tl.progress(1).pause();
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);
}

/**
 * A slot in its section's entrance timeline.
 *
 * This used to run its own IntersectionObserver and its own CSS transition, one way only, with
 * `io.disconnect()` after the first intersection. That was a SECOND animation system beside the
 * card's curved slide: on the way down the two happened to look coordinated, and on the way up the
 * card arced back out while its contents stayed exactly where they were, because a fired-once
 * observer has nothing to play backwards.
 *
 * It is now just a marked-up slot. `useCurvedSectionEntry` picks these up with `.reveal-child` and
 * staggers them inside the section's single timeline, so both directions come from one definition.
 * `delay` is kept in the signature only so the call sites did not all have to change; ordering is
 * handled by the stagger now.
 */
function Reveal({ children }: { children: React.ReactNode; delay?: number }) {
  return <div className="reveal-child">{children}</div>;
}

/* TitleWords lived here: the per-word rise for the h1. The heading is now rendered by the liquid
   scene as a rippling plane, so a DOM word animation had nothing left to animate. The shared copy
   in PageChrome.tsx is still used by the Contact page. */

function SectionLabel({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
      <span
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "var(--burgundy)",
          border: "1px solid rgba(138,47,60,0.5)",
          padding: "4px 8px",
          whiteSpace: "nowrap",
        }}
      >
        REEL {no}
      </span>
      <span
        className="mono"
        style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.45 }}
      >
        {children}
      </span>
    </div>
  );
}

/**
 * Portrait section wrapper. The borderless masked look and the shutter wipe stay; the tilt itself
 * lives in PortraitTilt, which reacts to the cursor without ever moving the photo out of place.
 */
function PortraitPlate({ src, caption }: { src: string | null; caption: string }) {
  const [ref, shown] = useInView<HTMLDivElement>("-80px 0px -12% 0px");

  if (!src) {
    return (
      <div
        ref={ref}
        className="mono"
        style={{
          aspectRatio: "3 / 4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.38,
          lineHeight: 2.2,
          border: "1px dashed rgba(233,230,240,0.16)",
        }}
      >
        Portrait slot
        <br />
        save your photo as public/me.jpg
      </div>
    );
  }

  return (
    <figure ref={ref} className="portrait-wrap" style={{ margin: 0 }}>
      <div className={`portrait-stage${shown ? " is-in" : ""}`}>
        <PortraitTilt src={src} alt={CONTENT.name} className="portrait-drift" />
      </div>
      {caption ? (
        <figcaption
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: 0.4,
            marginTop: 6,
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export default function About() {
  useScrollBlur();
  useCurvedSectionEntry();
  return (
    <>
      {/* The backdrop is now a flat dark plate with a glow that trails the cursor, and nothing else.
          The reel video, its grade and its vignette are gone with the shader: the brief asks for a
          base that is flat and static with no ambient movement, and a looping video is the opposite
          of that. The markup is one component so there is only one thing behind the page. */}
      <CursorGlowBackground />

      <main className="page-content" style={{ minHeight: "100vh", paddingBottom: "12vh" }}>
      {/* ================= HERO — full-bleed reel behind, content in front ================= */}
      <section
        className="projected blur-section"
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {/* the reel now lives behind the whole page; the hero only adds its own left-side wash
            so the title block has something solid to sit on */}
        <div className="hero-grade" aria-hidden="true" />

        {/* ---- foreground ---- */}
        <div className="hero-grid">
          <div className="hero-main about-card">
            <Reveal>
              <div className="eyebrow" style={{ marginBottom: 18 }}>
                Now showing / About
              </div>
            </Reveal>

            {/* Plain DOM again. This used to be rasterised to a canvas and rendered as a rippling
                plane in the shader scene, with this copy faded to opacity 0; with the shader gone,
                the gold gradient and bevel come straight from .gold-emboss in the CSS. */}
            <h1
              className="liquid-name gold-emboss"
              data-text={CONTENT.name}
              style={{
                fontSize: "clamp(46px, 9vw, 118px)",
                letterSpacing: "-0.02em",
                marginBottom: 22,
              }}
            >
              {CONTENT.name}
            </h1>

            {/* the photo now sits directly under the name, at the very top of the page, rather
                than in a section of its own further down */}
            <div className="hero-intro">
              <div className="hero-portrait">
                <PortraitPlate src={CONTENT.portrait} caption={CONTENT.portraitCaption} />
              </div>

              <Reveal delay={420}>
                <p
                  className="mono"
                  style={{
                    fontSize: "clamp(10px, 1.3vw, 12px)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--purple-line)",
                    marginBottom: 22,
                    lineHeight: 2,
                  }}
                >
                  {CONTENT.tagline}
                </p>
                {CONTENT.intro.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: "clamp(14px, 1.6vw, 17px)",
                      lineHeight: 1.9,
                      opacity: 0.86,
                      marginBottom: 18,
                      textShadow: "0 2px 18px rgba(0,0,0,0.6)",
                    }}
                  >
                    {para}
                  </p>
                ))}
                <a href="#reel-01" className="chip" style={{ marginTop: 14 }}>
                  Read the full story
                  <span className="chip-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </Reveal>
            </div>
          </div>

          {/* ---- right rail: production credits + portrait card ---- */}
          <aside className="hero-rail">
            <Reveal delay={200}>
              {CONTENT.meta.map((m) => (
                <div key={m.label} style={{ marginBottom: 24 }}>
                  <div className="mono hero-rail-head">{m.label}</div>
                  <div style={{ fontSize: 14, opacity: 0.88 }}>{m.value}</div>
                </div>
              ))}
            </Reveal>

          </aside>
        </div>
      </section>

      <div className="filmstrip" />

      {/* ================= REELS ================= */}
      {CONTENT.reels.map((reel) => (
        <Fragment key={reel.no}>
        <section
          id={`reel-${reel.no}`}
          className="blur-section"
          style={{
            padding: "clamp(70px, 12vh, 130px) 6vw",
            scrollMarginTop: "10vh",
          }}
        >
          <div className="about-card" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <SectionLabel no={reel.no}>{reel.sub}</SectionLabel>
              <h2
                className="gold-emboss"
                data-text={reel.slate}
                style={{ fontSize: "clamp(28px, 4.6vw, 52px)", marginBottom: 26, maxWidth: 640 }}
              >
                {reel.slate}
              </h2>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 660 }}>
              {reel.body.map((para, i) => (
                <Reveal key={i} delay={140 + i * 130}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.95, opacity: 0.8 }}>{para}</p>
                </Reveal>
              ))}
            </div>

            {/* Reel 02 wraps the skill reel between its two paragraphs */}
            {reel.intro && (
              <>
                <Reveal delay={90}>
                  <p className="lead-question">{reel.introQuestion}</p>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.95, opacity: 0.8, maxWidth: 660 }}>{reel.intro}</p>
                </Reveal>
                <div style={{ maxWidth: 980 }}>
                  <SkillReel />
                </div>
                <Reveal delay={90}>
                  <p className="lead-question" style={{ marginTop: 26 }}>
                    {reel.outroQuestion}
                  </p>
                </Reveal>
                <Reveal delay={120}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.95, opacity: 0.8, maxWidth: 660 }}>{reel.outro}</p>
                </Reveal>
              </>
            )}

            {/* Reel 03 needs the band handle to be a real link */}
            {reel.offscreen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 660 }}>
                <Reveal delay={140}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.95, opacity: 0.8 }}>
                    Off-screen, I&apos;ve competed in badminton at the regional level, published articles and
                    poetry, chase fitness seriously, direct (I&apos;ve directed a short film), and sing, currently
                    fronting a
                    band, Juke.Box (
                    <a
                      href="https://www.instagram.com/juqe.box"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-link"
                    >
                      @juqe.box
                    </a>
                    ).
                  </p>
                </Reveal>
                <Reveal delay={250}>
                  <p className="lead-question">Why cinema? Why does it matter this much?</p>
                </Reveal>
                <Reveal delay={330}>
                  <p style={{ fontSize: 16.5, lineHeight: 1.95, opacity: 0.8 }}>{reel.why}</p>
                </Reveal>
              </div>
            )}
          </div>
        </section>
        <div className="filmstrip" />
        </Fragment>
      ))}

      {/* The old "Off the clock" portrait section is gone. Its photo now opens the page under the
          name, and its subject was already covered word for word by Reel 03, so the two are merged
          rather than repeated. */}

      {/* ================= SHOOTING SCHEDULE ================= */}
      <section className="blur-section" style={{ padding: "clamp(70px, 12vh, 130px) 6vw" }}>
        <div className="about-card" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel no="04">Dates and places</SectionLabel>
            <h2
              className="gold-emboss"
              data-text="Shooting schedule"
              style={{ fontSize: "clamp(28px, 4.6vw, 52px)", marginBottom: 34 }}
            >
              Shooting schedule
            </h2>
          </Reveal>
          <div style={{ maxWidth: 760 }}>
            {CONTENT.schedule.map((row, i) => (
              <Reveal key={i} delay={i * 70}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: 20,
                    padding: "20px 0",
                    borderTop: "1px solid rgba(233,230,240,0.08)",
                    alignItems: "baseline",
                  }}
                >
                  <span className="mono" style={{ fontSize: 12, color: "var(--burgundy)", letterSpacing: "0.1em" }}>
                    {row.when}
                  </span>
                  <div>
                    <div style={{ fontSize: 17, marginBottom: 4 }}>{row.what}</div>
                    {row.where && (
                      <div className="mono" style={{ fontSize: 11, opacity: 0.5, letterSpacing: "0.12em" }}>
                        {row.where}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="filmstrip" />

      <div className="filmstrip" />

      {/* ================= CLOSING ================= */}
      <section className="blur-section" style={{ padding: "clamp(80px, 14vh, 150px) 6vw 0" }}>
        <div className="about-card" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel no="05">The end</SectionLabel>
            <h2
              className="gold-emboss"
              data-text={CONTENT.closing.heading}
              style={{ fontSize: "clamp(32px, 5.6vw, 64px)", marginBottom: 22 }}
            >
              {CONTENT.closing.heading}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.9, opacity: 0.8, maxWidth: 580, marginBottom: 36 }}>
              {CONTENT.closing.body}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Link href="/contact" className="chip">
                Get in touch
                <span className="chip-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
            <div style={{ marginTop: 54 }}>
              <Link href="/" className="chip">
                Back to the cinema
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      </main>
    </>
  );
}
