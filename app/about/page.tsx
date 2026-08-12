export default function About() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "18vh 6vw 8vh",
        maxWidth: 720,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        Station / Drafting Desk
      </div>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", marginBottom: 24 }}>
        About
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.8, maxWidth: 560 }}>
        Placeholder — bio copy goes here. This page confirms routing and
        mobile layout only; no real content yet.
      </p>
    </main>
  );
}
