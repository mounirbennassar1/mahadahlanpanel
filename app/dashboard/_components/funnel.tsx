import { Card } from "./card";

export function Funnel({
  inquiry,
  confirmed,
  booked,
  bestRep,
}: {
  inquiry: number;
  confirmed: number;
  booked: number;
  bestRep: string;
}) {
  const safeTop = Math.max(inquiry, 1);
  const pctConfirmed = (confirmed / safeTop) * 100;
  const pctBooked = (booked / safeTop) * 100;
  const drop = 100 - pctBooked;

  const steps = [
    { label: "Inquiry", num: inquiry, pct: 100, bg: "linear-gradient(90deg, var(--blue), oklch(0.62 0.14 245))", width: 100 },
    { label: "Confirmed", num: confirmed, pct: pctConfirmed, bg: "linear-gradient(90deg, var(--amber), oklch(0.68 0.15 60))", width: Math.max(pctConfirmed, 6) },
    { label: "Booked", num: booked, pct: pctBooked, bg: "linear-gradient(90deg, var(--green), oklch(0.56 0.14 155))", width: Math.max(pctBooked, 6) },
  ];

  return (
    <Card title="Conversion funnel" subtitle="Inquiry → Confirmed → Booked">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {steps.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                flex: 1,
                height: 54,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                color: "#fff",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                position: "relative",
                overflow: "hidden",
                background: s.bg,
                width: `${s.width}%`,
                maxWidth: "100%",
              }}
            >
              <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", fontSize: 20 }}>
                {s.num.toLocaleString("en-US")}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, marginLeft: 10, opacity: 0.85 }}>{s.label}</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-data)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 9px",
                  borderRadius: 6,
                }}
              >
                {s.pct.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 18,
          borderTop: "1px solid var(--hairline)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        <Stat label="Drop-off" value={`${drop.toFixed(1)}%`} />
        <Stat label="Confirmed" value={`${pctConfirmed.toFixed(1)}%`} />
        <Stat label="Best rep" value={bestRep} />
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--ink-4)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          fontWeight: 700,
          color: "var(--ink)",
          marginTop: 6,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
