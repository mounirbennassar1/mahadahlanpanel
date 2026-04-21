import { Card } from "./card";

type TeamRow = { id: string; name: string; booked: number; confirmed: number; inquiry: number };

export function TeamBars({ data }: { data: TeamRow[] }) {
  const max = Math.max(1, ...data.map((t) => t.booked + t.confirmed + t.inquiry));
  const stackHeight = 160;

  return (
    <Card title="Team performance" subtitle="Booked · confirmed · inquiry (last 7 days)">
      {data.length === 0 ? (
        <div style={{ color: "var(--ink-3)", fontSize: 13 }}>No team assignments yet.</div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 200,
            padding: "0 4px",
            borderBottom: "1px dashed var(--border)",
          }}
        >
          {data.map((t) => {
            const total = Math.max(t.booked + t.confirmed + t.inquiry, 0);
            const h = (total / max) * stackHeight;
            const safeTotal = Math.max(total, 1);
            const bh = (t.booked / safeTotal) * h;
            const ch = (t.confirmed / safeTotal) * h;
            const ih = (t.inquiry / safeTotal) * h;
            return (
              <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                    gap: 3,
                    width: 26,
                    height: stackHeight,
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: "100%", height: ih, background: "oklch(0.85 0.08 295)", borderRadius: 5 }} />
                  <div style={{ width: "100%", height: ch, background: "oklch(0.72 0.14 295)", borderRadius: 5 }} />
                  <div style={{ width: "100%", height: bh, background: "oklch(0.46 0.16 295)", borderRadius: 5 }} />
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 500 }}>{t.name}</div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, marginBottom: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--primary)" }} /> Booked
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "oklch(0.72 0.14 295)" }} /> Confirmed
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "oklch(0.85 0.08 295)" }} /> Inquiry
        </span>
      </div>
    </Card>
  );
}
