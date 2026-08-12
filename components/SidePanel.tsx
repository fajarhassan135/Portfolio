"use client";

type StationData = {
  eyebrow: string;
  title: string;
  body: string;
};

export default function SidePanel({
  data,
  onClose,
}: {
  data: StationData | null;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100%",
        width: "min(420px, 92vw)",
        background: "var(--graphite)",
        borderLeft: "1px solid rgba(74,95,217,0.3)",
        transform: data ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.5s cubic-bezier(.22,.9,.32,1)",
        zIndex: 60,
        padding: "12vh 32px",
      }}
    >
      <button
        onClick={onClose}
        className="mono"
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "none",
          border: "none",
          color: "var(--vellum)",
          fontSize: 12,
          letterSpacing: "0.1em",
          cursor: "pointer",
          opacity: 0.6,
        }}
      >
        ✕ CLOSE
      </button>
      {data && (
        <>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {data.eyebrow}
          </div>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>{data.title}</h2>
          <p style={{ fontSize: 14, lineHeight: 1.75, opacity: 0.8 }}>
            {data.body}
          </p>
        </>
      )}
    </div>
  );
}
