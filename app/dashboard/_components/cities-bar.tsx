import { Card } from "./card";

export function CitiesBar({ data }: { data: { city: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card title="Leads by city" subtitle={`Top ${data.length} regions`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
        {data.length === 0 && <div style={{ color: "var(--ink-3)", fontSize: 13 }}>No data yet.</div>}
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.city} style={{ display: "grid", gridTemplateColumns: "100px 1fr 50px", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>{d.city}</span>
              <div style={{ height: 10, background: "var(--primary-softer)", borderRadius: 99, overflow: "hidden", position: "relative" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--primary-3), var(--primary))",
                    borderRadius: 99,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-data)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--ink)",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {d.count.toLocaleString("en-US")}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
