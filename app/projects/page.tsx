const PLACEHOLDER_PROJECTS = [
  "001", "002", "003", "004", "005",
];

export default function Projects() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "18vh 6vw 8vh",
        maxWidth: 720,
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        Station / Terminal
      </div>
      <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", marginBottom: 32 }}>
        Projects
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {PLACEHOLDER_PROJECTS.map((n) => (
          <div
            key={n}
            className="mono"
            style={{
              display: "flex",
              gap: 24,
              padding: "18px 0",
              borderBottom: "1px solid rgba(74,95,217,0.2)",
              fontSize: 14,
              opacity: 0.75,
            }}
          >
            <span style={{ color: "var(--burgundy)" }}>{n}</span>
            <span>Placeholder project title</span>
          </div>
        ))}
      </div>
    </main>
  );
}
