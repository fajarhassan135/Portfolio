import type { ReactNode } from "react";

/**
 * The contact channels, in one place.
 *
 * Both the projection and the page cards read from this, so the two can never drift apart: the
 * projector is showing the same record the card below it is showing, not a second copy of the copy.
 */

export type Social = {
  key: string;
  label: string;
  tagline: string;
  reason: string;
  handle: string;
  href: string;
  /** the platform's own colour, used as the card's secondary accent against the site's gold */
  accent: string;
  /** true when the icon is already drawn in brand colours and must not be tinted */
  brandMark?: boolean;
  icon: ReactNode;
};

/* Icons are hand-written inline SVG. The project has no icon package installed and adding one for
   four glyphs would be a dependency for nothing.
   
   Email and GitHub inherit currentColor, so the card's accent treatment costs no extra markup.
   Instagram and LinkedIn are drawn in their own brand colours instead and carry `brandMark: true`,
   which tells both consumers not to tint them: a recognised logo does more work than palette
   consistency does, and neither permits recolouring. The gradient ids are duplicated when an icon
   renders in both the projection and its card, which is harmless here since both definitions are
   identical and a browser resolves url(#id) to the first match. */
const ICONS: Record<string, ReactNode> = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3 7l9 6.5L21 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        {/* the official corner-to-corner ramp: yellow through orange and magenta into violet */}
        <linearGradient id="ig-ramp" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="0.75" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect
        x="2.7"
        y="2.7"
        width="18.6"
        height="18.6"
        rx="5.4"
        fill="none"
        stroke="url(#ig-ramp)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="url(#ig-ramp)" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="url(#ig-ramp)" />
    </svg>
  ),
  /* LinkedIn is the one mark drawn in its own colours rather than inheriting currentColor. Their
     brand guidelines do not allow recolouring it, and a recognised logo carries more weight than
     palette consistency does here. */
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4.2" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 6.2a1.55 1.55 0 1 1-.02 3.1 1.55 1.55 0 0 1 .02-3.1zM5.6 10.4h3V19h-3zM10.3 10.4h2.87v1.18h.04c.4-.72 1.38-1.48 2.84-1.48 3.03 0 3.59 1.9 3.59 4.36V19h-3v-3.98c0-.95-.02-2.17-1.36-2.17-1.36 0-1.57 1.03-1.57 2.1V19h-2.98z"
      />
    </svg>
  ),
};

export const SOCIALS: Social[] = [
  {
    key: "email",
    label: "Email",
    tagline: "Let's collaborate or just chat over code",
    reason:
      "Got an idea? A project? Or just want to talk tech? Email is where it all starts. Direct, quick, and I actually read them.",
    handle: "fajarhassan135@gmail.com",
    href: "mailto:fajarhassan135@gmail.com",
    accent: "#e0b768",
    icon: ICONS.email,
  },
  {
    key: "github",
    label: "GitHub",
    tagline: "Where the code actually lives",
    reason:
      "See what I build. Every project, commit, and experiment is here. No polished BS, just real work. Follow to stay updated on open-source contributions and portfolio pieces.",
    handle: "fajarhassan135",
    href: "https://github.com/fajarhassan135",
    accent: "#c7cad1",
    icon: ICONS.github,
  },
  {
    key: "instagram",
    label: "Instagram",
    tagline: "Behind the screens and code",
    reason:
      "Photography, cinematography, and life beyond the desk. This is where I share the visual side: film stills, creative experiments, and moments that inspire my work.",
    handle: "@fajarwarriach_",
    href: "https://instagram.com/fajarwarriach_",
    accent: "#d96a9a",
    brandMark: true,
    icon: ICONS.instagram,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    tagline: "Professional journey and opportunities",
    reason:
      "Internships, client work, speaking gigs, collaborations. If it's about working together professionally, let's connect here. This is my formal playground.",
    handle: "fajarwarriach",
    href: "https://linkedin.com/in/fajarwarriach",
    accent: "#0A66C2",
    brandMark: true,
    icon: ICONS.linkedin,
  },
];
