import type { Session } from "next-auth";

export function Topbar({ user }: { user: Session["user"] }) {
  void user;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 32px",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface)",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
          padding: "10px 14px",
          width: 380,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--ink-3)" }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Search leads, cities, sources…"
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-ui)",
            fontSize: 14,
            color: "var(--ink)",
            flex: 1,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-data)",
            fontSize: 11,
            color: "var(--ink-3)",
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            padding: "2px 6px",
            borderRadius: 5,
          }}
        >
          ⌘K
        </span>
      </div>
    </div>
  );
}
