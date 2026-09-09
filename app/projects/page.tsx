"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ProjectsHall, { type ScreenRect } from "@/components/ProjectsHall";
import ShotCluster from "@/components/ShotCluster";
import { FEATURED, PERSONAL, PROJECTS } from "./projects";

/* The reel opens on the first personal project, not on index 0. Index 0 is client work, and opening
   there put NA Threads on screen under a heading reading "My Projects", which is the exact confusion
   the two groups exist to prevent. */
const FIRST_PERSONAL = PROJECTS.findIndex((p) => p.category === "personal");

/**
 * The projects, screened as trailers.
 *
 * You are sat in the stalls looking up at the screen and each project plays on it: title, frames
 * from the real UI, what it is, and the stack it was built on. Arrows, the running order and the
 * left and right keys all change the reel.
 *
 * WHY THE CONTENT IS DOM RATHER THAN A TEXTURE. It is laid over the screen's projected rectangle,
 * which ProjectsHall reports on every resize. A CanvasTexture would put the text inside the 3D scene
 * where it cannot be clicked, cannot be tabbed to, cannot route, and softens as it is minified.
 *
 * ONE REEL AT A TIME, SEQUENCED. The outgoing project fades fully out before the incoming one starts.
 * Crossfading two blocks that share a box leaves both half visible for the whole overlap, and since
 * this is dark ink on a lit surface that reads as one project ghosting through another.
 *
 * FEATURED AND PERSONAL ARE THE SAME FORMAT, DELIBERATELY. They are the same kind of thing to look
 * at; what differs is who asked for them. So the split is carried by the slate at the top of the
 * screen and by the two labelled groups in the running order, not by two different layouts.
 */

export default function Projects() {
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [active, setActive] = useState(FIRST_PERSONAL);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleRect = useCallback((r: ScreenRect | null) => setRect(r), []);

  const go = useCallback((dir: number) => {
    setActive((i) => (i + dir + PROJECTS.length) % PROJECTS.length);
  }, []);

  // arrow keys drive the reel, the way a remote would
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* ---- swap what is on the screen ---- */
  useEffect(() => {
    const tl = gsap.timeline();

    blockRefs.current.forEach((el, i) => {
      if (!el || i === active) return;
      tl.to(el, { opacity: 0, duration: 0.35, ease: "power2.in", overwrite: "auto" }, 0);
      tl.set(el, { visibility: "hidden" }, 0.35);
      el.style.pointerEvents = "none";
      el.inert = true;
    });

    const el = blockRefs.current[active];
    if (el) {
      tl.set(el, { visibility: "visible" }, 0.35);
      tl.to(el, { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" }, 0.35);
      // the montage animates itself; the chips still arrive just behind the block
      tl.fromTo(
        el.querySelectorAll(".reel-stack li"),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: "power2.out" },
        0.5
      );
      el.style.pointerEvents = "auto";
      el.inert = false;
    }

    return () => {
      tl.kill();
    };
  }, [active]);

  /* Placed from the screen's own projected rect, so it lands exactly on the screen at any viewport.
     Type scales with that rect rather than the viewport, or it would drift off the screen edge as
     the window changed shape.

     EXCEPT WHEN THE SCREEN IS TOO SMALL TO READ ON. In a portrait window the hall has to step back
     far enough to fit a 16:9 screen across the width, which leaves the screen about a quarter of the
     frame's height: measured, that puts body copy at 4 or 5px. So the decision is made from the rect
     itself rather than from a breakpoint guess. Below the threshold the copy stops pretending to be
     projected and becomes a plain panel over the hall, which is the honest trade. */
  const base = rect ? rect.h * 0.078 : 0;
  const projected = rect !== null && base >= 24;

  const style: React.CSSProperties | undefined = projected
    ? { left: rect!.x, top: rect!.y, width: rect!.w, height: rect!.h, fontSize: base }
    : undefined;

  const setBlock = (i: number) => (el: HTMLDivElement | null) => {
    blockRefs.current[i] = el;
  };

  const current = PROJECTS[active];
  const isFeatured = current.category === "featured";

  const group = (label: string, note: string, list: typeof PROJECTS, id?: string) => (
    <div className="programme-group" id={id}>
      <span className="mono programme-label">
        {label}
        <em className="programme-note">{note}</em>
      </span>
      <ol className="programme-list">
        {list.map((p) => {
          const i = PROJECTS.indexOf(p);
          return (
            <li key={p.slug}>
              <button
                className={`mono programme-item${i === active ? " is-on" : ""}${
                  p.category === "featured" ? " is-featured" : ""
                }`}
                onClick={() => setActive(i)}
                aria-current={i === active ? "true" : undefined}
              >
                {p.title}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <>
      <ProjectsHall onScreenRect={handleRect} />

      {/* The heading names the group that is actually playing, so the label and the screen can never
          disagree about which category you are looking at. */}
      <header className={`reel-heading${isFeatured ? " is-featured" : ""}`}>
        <h1 className="reel-page-title">{isFeatured ? "Client & Company Work" : "My Projects"}</h1>
        <p className="reel-page-note">
          {isFeatured
            ? "Built for other people, on someone else's brief."
            : "Built for their own sake. Use the arrows, the running order, or the left and right keys."}
        </p>
      </header>

      {/* what is playing */}
      <div className={projected ? "reel-screen" : "reel-screen reel-panel"} style={style}>
        <div className="reel-inner">
          {PROJECTS.map((p, i) => (
            <article className="reel-block" key={p.slug} ref={setBlock(i)} style={{ opacity: 0 }}>
              <div className="reel-slate">
                <span
                  className={`mono reel-badge${p.category === "featured" ? " is-featured" : ""}`}
                >
                  {p.category === "featured" ? `Built for ${p.company}` : "Personal project"}
                </span>
                <span className="mono reel-kind">{p.year}</span>
              </div>

              <div className={`reel-body${p.shots?.length ? "" : " is-wide"}`}>
                <div className="reel-copy">
                  <h2 className="reel-title">{p.title}</h2>
                  <p className="reel-summary">{p.summary}</p>
                  <div>
                    <h3 className="mono reel-h">Why I built it</h3>
                    <p className="reel-para">{p.why}</p>
                  </div>
                  <div>
                    <h3 className="mono reel-h">The hard part</h3>
                    <p className="reel-para">{p.hard}</p>
                  </div>
                </div>

                {!!p.shots?.length && <ShotCluster shots={p.shots} active={i === active} />}
              </div>

              <div className="reel-foot">
                <ul className="reel-stack">
                  {p.stack.map((t) => (
                    <li key={t} className="mono">
                      {t}
                    </li>
                  ))}
                </ul>
              {p.live && (
                <a className="mono reel-link" href={p.live} target="_blank" rel="noreferrer">
                  Open the live site
                  <span aria-hidden="true"> →</span>
                </a>
              )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* the remote */}
      <div className="reel-controls">
        <button className="reel-arrow" onClick={() => go(-1)} aria-label="Previous project">
          ←
        </button>
        <span className="mono reel-count">
          {active + 1} of {PROJECTS.length}
        </span>
        <button className="reel-arrow" onClick={() => go(1)} aria-label="Next project">
          →
        </button>
      </div>

      {/* the running order, split so the two categories can never be confused */}
      <nav className="programme" aria-label="Running order">
        {group("Client & company work", "built for someone else", FEATURED, "featured")}
        {group("My projects", "built for their own sake", PERSONAL)}
        <Link href="/" className="mono programme-home">
          Exit to cinema
        </Link>
      </nav>

      <span className="sr-only" aria-live="polite">
        Now showing: {current.title}, {current.category === "featured" ? `built for ${current.company}` : "personal project"}
      </span>
    </>
  );
}
