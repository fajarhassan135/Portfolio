/**
 * The work, split into the two things a visitor actually wants told apart: what was built for
 * somebody else, and what was built for its own sake.
 *
 * Every stack list was read off that project's own package.json rather than remembered, so it says
 * what the project actually installs.
 *
 * TO ADD SCREENSHOTS: drop the files in public/shots/<slug>/ and list them in that project's `shots`
 * array. Nothing else needs touching. They must be real captures of the interface, never mockups.
 *
 */

export type Category = "personal" | "featured";

export type Shot = {
  /** a file under public/shots/<slug>/ */
  src: string;
  /** the file's own pixel size; next/image needs it to reserve space and build a srcset */
  w: number;
  h: number;
  /** alt text, since the montage carries no visible captions */
  alt: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: Category;
  /** who it was built for; featured work only */
  company?: string;
  kind: string;
  year: string;
  summary: string;
  why: string;
  hard: string;
  stack: string[];
  live?: string;
  repo?: string;
  /* Frames from the real interface, scattered as a montage beside the copy. A project with none
     gives its copy the full width instead, so both states are deliberate rather than broken. */
  shots?: Shot[];
};

/* Built for someone else: a client or the company I was interning at. */
export const FEATURED: Project[] = [
  {
    slug: "na-threads",
    index: "F01",
    title: "NA Threads",
    category: "featured",
    company: "NA Threads Manufacturing Company",
    kind: "Client work",
    year: "2025",
    summary:
      "A company web presence for a manufacturing business, built and delivered end to end.",
    why: "The first piece of client work I shipped on my own: a real brief, a real client, and a real handover at the end of it rather than a project that stops when I stop looking at it.",
    hard: "Working to somebody else's requirements instead of my own. Scope, feedback rounds and sign off are a different discipline from building whatever seems interesting next, and that turned out to be the actual lesson.",
    stack: ["Web"],
  },
  {
    slug: "response-analyzer",
    index: "F02",
    title: "Response Analyzer",
    category: "featured",
    company: "CodeCelix",
    kind: "Internship project",
    year: "2026",
    summary:
      "Reads inbound customer support mail, scores it for category, sentiment and urgency, and drafts the reply the team can send.",
    why: "Support queues get read in the order they arrive, which means the angriest message can sit behind forty routine ones. This scores every message on the way in so the queue sorts itself, and writes a first draft so answering is editing rather than composing.",
    hard: "Bulk mode. Fifty messages arrive as a CSV and have to run in parallel against a rate limited model without one failure taking down the batch or the progress bar freezing. Replies stream token by token so nothing waits on a spinner, and a fixed window limiter in process memory protects a single serverless instance from runaway usage.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Groq", "Supabase", "Tailwind"],
    live: "https://customer-response-analyzer.vercel.app",
  },
];

/* Built because I wanted them to exist. */
export const PERSONAL: Project[] = [
  {
    slug: "kinema",
    index: "P01",
    title: "Kinema",
    category: "personal",
    kind: "Personal project",
    year: "2026",
    summary:
      "A film discovery site built as a cinema: a living reel of titles that turns one frame at a time, with reviews, watchlists and a projectionist that picks for you.",
    why: "The idea this whole portfolio grew out of. I wanted somewhere to keep the films that shaped me that felt like a cinema rather than a database, so the interface is a reel and a programme instead of a grid and a filter bar.",
    hard: "Two things. The reel is real WebGL geometry rather than CSS transforms, because CSS 3D collapses the moment anything in the ancestor chain sets overflow, filter or opacity. And the backend is written in C++: server, router, auth, search and review layers built from scratch, which taught me more about what a framework is doing for me than any amount of reading would have.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Three.js", "React Three Fiber", "GSAP", "Framer Motion", "Supabase", "C++"],
    live: "https://kinema-7n9j.vercel.app",
    shots: [
      { src: "/shots/kinema/01.jpg", w: 1600, h: 741, alt: "Kinema interface" },
      { src: "/shots/kinema/02.jpg", w: 1568, h: 717, alt: "Kinema interface" },
      { src: "/shots/kinema/03.jpg", w: 1431, h: 829, alt: "Kinema interface" },
      { src: "/shots/kinema/04.jpg", w: 1600, h: 737, alt: "Kinema interface" },
      { src: "/shots/kinema/05-mobile.jpg", w: 498, h: 831, alt: "Kinema on mobile" },
    ],
  },
  {
    slug: "smartprep-ai",
    index: "P02",
    title: "SmartPrep AI",
    category: "personal",
    kind: "Personal project",
    year: "2026",
    summary:
      "Exam prep for IGCSE, A Level, Matric and FSc students: quizzes written to your syllabus, timed exam mode, and the real past papers alongside them.",
    why: "Generic quiz apps ask generic questions. A Cambridge Physics paper and a Pakistan board Physics paper want different things from a student, and practising the wrong one is worse than not practising. So the generator takes board, level and syllabus as inputs rather than just a topic name.",
    hard: "Making generated questions actually exam standard instead of merely plausible. The prompt carries board, level, chapter and difficulty, and the output is checked against the shape of a real paper before a student ever sees it. Past papers sit next to the generated set so the two can be compared directly.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Groq", "Supabase", "Tailwind"],
    live: "https://smartprep-ai-pi.vercel.app",
    shots: [
      { src: "/shots/smartprep-ai/01.jpg", w: 1900, h: 874, alt: "SmartPrep AI interface" },
      { src: "/shots/smartprep-ai/02.jpg", w: 1899, h: 832, alt: "SmartPrep AI interface" },
      { src: "/shots/smartprep-ai/03.jpg", w: 1893, h: 876, alt: "SmartPrep AI interface" },
    ],
  },
  {
    slug: "nuvia",
    index: "P03",
    title: "Nuvia",
    category: "personal",
    kind: "Personal project",
    year: "2026",
    summary:
      "A sleep and home store, front to back: catalogue, product pages, cart, checkout, accounts and order history.",
    why: "I wanted to build commerce properly rather than mock it. Mattresses, pillows, accessories and decor, with everything a customer expects to be able to do after they have bought something as well as before: order history, account, password reset, the parts most demos skip.",
    hard: "It is deliberately not a framework build. Vanilla HTML, CSS and JavaScript against Supabase, which means cart state, auth, routing and the checkout flow are all hand written and have to survive a page reload without a client side router holding them together. The production security headers live in vercel.json and the local dev server reads the same file, so a policy that would break the site fails on my machine rather than on the deploy.",
    stack: ["Vanilla JS", "Supabase", "Postgres", "Edge Functions", "Vercel"],
    live: "https://nuvia-git-main-fajarr.vercel.app",
    shots: [
      { src: "/shots/nuvia/01.jpg", w: 1896, h: 882, alt: "Nuvia interface" },
      { src: "/shots/nuvia/02.jpg", w: 1915, h: 876, alt: "Nuvia interface" },
      { src: "/shots/nuvia/03.jpg", w: 1899, h: 874, alt: "Nuvia interface" },
    ],
  },
  {
    slug: "resume-ai",
    index: "P04",
    title: "ResumeAI",
    category: "personal",
    kind: "Personal project",
    year: "2026",
    summary:
      "Upload a CV as a PDF and get it read back to you: a score, what is weak, and what to change, optionally against a target role.",
    why: "Applying for internships and getting no feedback either way. If nobody is going to tell you why a CV did not land, the next best thing is a reader that will say it plainly before you send it.",
    hard: "Getting usable text out of an arbitrary PDF. A CV is a layout, not a document, so a two column resume extracts as interleaved nonsense and any advice built on that is worthless. The parse is normalised into sections before the model ever sees it, and the result exports back out as a PDF.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Google Generative AI", "OpenAI", "pdf-parse", "jsPDF", "Tailwind"],
    live: "https://ai-resume-studio-mxpc.vercel.app",
    shots: [
      { src: "/shots/resume-ai/01.jpg", w: 1896, h: 873, alt: "ResumeAI interface" },
      { src: "/shots/resume-ai/02.jpg", w: 1897, h: 874, alt: "ResumeAI interface" },
    ],
  },
];

/** Everything, featured first, for the places that show one running order. */
export const PROJECTS: Project[] = [...FEATURED, ...PERSONAL];
