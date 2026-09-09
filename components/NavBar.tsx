"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The one control that is on every page.
 *
 * Every entry carries a line saying what it is and, where it applies, which thing you click in the
 * cinema to reach it. The 3D interior is discoverable by poking at it, which is the point of it, but
 * poking at it should never be the ONLY way to find a section: this is the map.
 */
const LINKS = [
  {
    href: "/",
    label: "Home",
    no: "01",
    note: "The cinema interior. Click anything in it.",
  },
  {
    href: "/about",
    label: "About Me",
    no: "02",
    note: "Who I am. In the cinema: the popcorn stand.",
  },
  {
    href: "/projects",
    label: "My Projects",
    no: "03",
    note: "Personal work, screened. In the cinema: the big screen.",
  },
  {
    href: "/projects#featured",
    label: "Client & Company Work",
    no: "04",
    note: "Built for other people. In the cinema: the desk.",
  },
  {
    href: "/contact",
    label: "Get In Touch",
    no: "05",
    note: "Every way to reach me. In the cinema: the ticket booth.",
  },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close on route change, so tapping a link inside the drawer does not leave it hanging open
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // escape to close, and hold the page still while the drawer is up
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav className="nav-bar">
        {/* Nothing on the left. The way home is the first entry in the drawer, and on the projects
            page the running order carries its own exit. */}
        <span aria-hidden="true" />

        <button
          className={`nav-toggle${open ? " is-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* dim the page behind, and let a click anywhere out there dismiss it */}
      <div
        className={`nav-scrim${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside className={`nav-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="nav-drawer-inner">
          <div className="mono nav-drawer-head">Menu</div>
          <ul>
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ transitionDelay: `${open ? 120 + i * 55 : 0}ms` }}>
                <Link href={l.href} className={pathname === l.href ? "is-current" : undefined}>
                  <span className="mono nav-no">{l.no}</span>
                  <span className="nav-label">{l.label}</span>
                  <span className="nav-note">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mono nav-drawer-foot">Portfolio 2026</div>
        </div>
      </aside>
    </>
  );
}
