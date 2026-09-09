"use client";

import Link from "next/link";

/**
 * The content that appears beside a focused station in the interior scene.
 *
 * DOM, not 3D. Text mapped into the scene would have to fight the same problems the skill reel did
 * — shearing on curved surfaces, resolution tied to camera distance, no real links or focus order —
 * and none of that buys anything here. As an overlay the type is crisp at any zoom, the links are
 * real links, and it is reachable by keyboard.
 *
 * It never overlaps the object it describes. Scene.tsx shifts the 3D camera's frustum sideways
 * while a station is focused, so the object sits in the free half of the viewport and the panel
 * occupies the other. On a narrow screen the split is horizontal instead: object above, panel below.
 */

export type StationKey = "about" | "projects" | "contact" | "client" | "extra";

type Body =
  | { kind: "prose"; paragraphs: string[] }
  | { kind: "list"; items: { title: string; note: string; status?: string }[] }
  | { kind: "channels"; items: { label: string; value: string; href: string }[] };

type Content = {
  eyebrow: string;
  title: string;
  body: Body;
  cta?: { label: string; href: string; external?: boolean };
};

/* Real values wherever the project actually has them: the contact channels and the shipped client
   work are taken from the About and Contact pages rather than invented. Anything still unwritten is
   labelled as placeholder rather than dressed up as real. */
const CONTENT: Record<StationKey, Content> = {
  about: {
    eyebrow: "Concession stand",
    title: "About",
    body: {
      kind: "prose",
      paragraphs: [
        "Full-stack development is the day job and LLM work is the part I keep pulling on: AI powered tools, automated chatbots, and the plumbing that connects them to something a real person can actually use.",
        "5th semester of BS Software Engineering at the University of Faisalabad, interning at CodeCelix, after a stint at DeveloperHub.",
      ],
    },
    cta: { label: "Read the full story", href: "/about" },
  },

  projects: {
    eyebrow: "Now showing",
    title: "Projects",
    body: {
      kind: "list",
      items: [
        {
          title: "Kinema",
          note: "Film discovery built as a cinema, with a WebGL reel and a C++ backend written from scratch. The seed this whole site grew out of.",
          status: "2026",
        },
        {
          title: "SmartPrep AI",
          note: "Syllabus aware exam prep for IGCSE, A Level, Matric and FSc, with generated papers sitting next to the real ones.",
          status: "2026",
        },
        {
          title: "ResumeAI",
          note: "Reads a CV out of a PDF and says what is weak and what to change, optionally against a target role.",
          status: "2026",
        },
        {
          title: "Nuvia",
          note: "A sleep and home store front to back, hand written against Supabase with no framework holding the routing together.",
          status: "2026",
        },
      ],
    },
    cta: { label: "All my projects", href: "/projects" },
  },

  contact: {
    eyebrow: "Ticket booth",
    title: "Contact",
    body: {
      kind: "channels",
      items: [
        { label: "Email", value: "fajarhassan135@gmail.com", href: "mailto:fajarhassan135@gmail.com" },
        { label: "GitHub", value: "github.com/fajarhassan135", href: "https://github.com/fajarhassan135" },
        { label: "LinkedIn", value: "linkedin.com/in/fajarwarriach", href: "https://linkedin.com/in/fajarwarriach" },
      ],
    },
    cta: { label: "Open the contact page", href: "/contact" },
  },

  client: {
    eyebrow: "Row C, seat 4",
    title: "Featured Client",
    body: {
      kind: "prose",
      paragraphs: [
        "NA Threads Manufacturing Company. The first piece of client work I shipped end to end, in 2025.",
        "A company web presence built and delivered for a real client, on a real brief, with a real handover at the end of it.",
        "The other piece of company work is Response Analyzer, the support triage tool built during my internship at CodeCelix.",
      ],
    },
  },

  extra: {
    eyebrow: "Projection booth",
    title: "???",
    body: { kind: "prose", paragraphs: ["Nothing here yet."] },
  },
};

export default function StationPanel({ station }: { station: StationKey }) {
  const c = CONTENT[station] ?? CONTENT.extra;

  return (
    <div className="station-panel" role="dialog" aria-label={c.title}>
      <div className="station-panel-inner">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {c.eyebrow}
        </div>
        <h2 className="station-panel-title">{c.title}</h2>

        {c.body.kind === "prose" &&
          c.body.paragraphs.map((p, i) => (
            <p key={i} className="station-panel-p">
              {p}
            </p>
          ))}

        {c.body.kind === "list" && (
          <ul className="station-panel-list">
            {c.body.items.map((it) => (
              <li key={it.title}>
                <div className="station-panel-row">
                  <span className="station-panel-item-title">{it.title}</span>
                  {it.status && <span className="mono station-panel-status">{it.status}</span>}
                </div>
                <p className="station-panel-note">{it.note}</p>
              </li>
            ))}
          </ul>
        )}

        {c.body.kind === "channels" && (
          <ul className="station-panel-list">
            {c.body.items.map((it) => (
              <li key={it.label}>
                <a
                  className="station-channel"
                  href={it.href}
                  target={it.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  <span className="mono station-panel-status">{it.label}</span>
                  <span className="station-panel-item-title">{it.value}</span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {c.cta && (
          <Link href={c.cta.href} className="chip station-panel-cta">
            {c.cta.label}
            <span className="chip-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
