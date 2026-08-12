export default function Contact() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "18vh 6vw 8vh",
        maxWidth: 720,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        Station / Schematic Plaque
      </div>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", marginBottom: 24 }}>
        Contact
      </h1>
      <div className="mono" style={{ fontSize: 14, lineHeight: 2.2, opacity: 0.8 }}>
        <div>EMAIL — placeholder@example.com</div>
        <div>GITHUB — github.com/fajarhassan135</div>
        <div>LINKEDIN — linkedin.com/in/fajarwarriach</div>
      </div>
    </main>
  );
}
