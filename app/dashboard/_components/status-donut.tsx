import type { LeadStatus } from "@prisma/client";
import { Card } from "./card";

type Segment = { label: string; value: number; color: string; status: LeadStatus };

const SEGMENT_DEFS: Omit<Segment, "value">[] = [
  { label: "Inquiry", color: "oklch(0.58 0.13 240)", status: "INQUIRY" },
  { label: "Confirmed", color: "oklch(0.72 0.14 75)", status: "CONFIRMED" },
  { label: "Booked", color: "oklch(0.62 0.13 155)", status: "BOOKED" },
  { label: "No answer", color: "oklch(0.58 0.012 295)", status: "NO_ANSWER" },
  { label: "Cancelled", color: "oklch(0.6 0.17 25)", status: "CANCELLED" },
  { label: "Not interested", color: "oklch(0.55 0.09 25)", status: "NOT_INTERESTED" },
];

export function StatusDonut({ byStatus, total }: { byStatus: Record<LeadStatus, number>; total: number }) {
  const segments: Segment[] = SEGMENT_DEFS.map((s) => ({ ...s, value: byStatus[s.status] }));
  const cx = 100;
  const cy = 100;
  const r = 78;
  const sw = 22;
  const C = 2 * Math.PI * r;

  const safeTotal = Math.max(total, 1);
  const segmentsWithOffset = segments.reduce<
    { segment: Segment; offset: number; length: number }[]
  >((acc, segment) => {
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.length : 0;
    const length = (segment.value / safeTotal) * C;
    acc.push({ segment, offset, length });
    return acc;
  }, []);

  return (
    <Card title="Status breakdown" subtitle={`${total.toLocaleString("en-US")} leads total`}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0 0" }}>
        <div style={{ position: "relative", width: 200, height: 200 }}>
          <svg width={200} height={200} viewBox="0 0 200 200">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="oklch(0.97 0.01 295)" strokeWidth={sw} />
            {segmentsWithOffset.map(({ segment, offset, length }) => (
              <circle
                key={segment.status}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={segment.color}
                strokeWidth={sw}
                strokeDasharray={`${Math.max(length - 2, 0)} ${C}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {total.toLocaleString("en-US")}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 6, fontWeight: 600 }}>
                Total leads
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {segments.map((s) => {
            const pct = total === 0 ? 0 : (s.value / total) * 100;
            return (
              <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, flex: "none", background: s.color }} />
                <span style={{ color: "var(--ink-2)", flex: 1 }}>{s.label}</span>
                <span style={{ fontFamily: "var(--font-data)", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--ink)" }}>
                  {s.value.toLocaleString("en-US")}
                </span>
                <span style={{ fontFamily: "var(--font-data)", fontSize: 12, color: "var(--ink-3)", minWidth: 40, textAlign: "right" }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
