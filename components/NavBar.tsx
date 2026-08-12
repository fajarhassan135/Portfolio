"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/play", label: "Play" },
  { href: "/contact", label: "Contact" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 5vw",
          pointerEvents: "none",
        }}
      >
        <Link
          href="/"
          className="mono"
          style={{
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--purple-line)",
            pointerEvents: "auto",
          }}
        >
          Fajar Hassan
        </Link>

        {/* desktop links */}
        <div
          className="desktop-only"
          style={{ display: "flex", gap: 30, pointerEvents: "auto" }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: pathname === l.href ? "var(--burgundy)" : "var(--vellum)",
                opacity: pathname === l.href ? 1 : 0.65,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* mobile hamburger */}
        <button
          className="mobile-only"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{
            pointerEvents: "auto",
            background: "none",
            border: "1px solid var(--purple-line)",
            color: "var(--vellum)",
            width: 40,
            height: 40,
            borderRadius: 4,
            fontSize: 18,
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* mobile full-screen menu */}
      {open && (
        <div
          className="mobile-only"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "var(--ink-navy)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 28,
                color:
                  pathname === l.href ? "var(--burgundy)" : "var(--vellum)",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
