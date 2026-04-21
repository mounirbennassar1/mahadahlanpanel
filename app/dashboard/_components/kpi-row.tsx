import type { StatusCounts } from "@/lib/metrics";

type Overview = {
  total: number;
  newThisWeek: number;
  todayCount: number;
  byStatus: StatusCounts;
  conversionRate: number;
  totalTrend: number;
};

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function trendFormat(pct: number) {
  const rounded = Math.abs(pct).toFixed(1);
  return { up: pct >= 0, label: `${rounded}%` };
}

export function KpiRow({ overview }: { overview: Overview }) {
  const totalTrend = trendFormat(overview.totalTrend);
  const confirmedPct = overview.total === 0 ? 0 : (overview.byStatus.CONFIRMED / overview.total) * 100;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <Kpi
        featured
        label="Total leads"
        value={fmt(overview.total)}
        trend={totalTrend}
        hint="vs last week"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      />
      <Kpi
        label="New this week"
        value={fmt(overview.newThisWeek)}
        hint={`${overview.todayCount} today`}
        iconBg="var(--blue-soft)"
        iconFg="var(--blue)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        }
      />
      <Kpi
        label="Confirmed"
        value={fmt(overview.byStatus.CONFIRMED)}
        hint={`${confirmedPct.toFixed(1)}% of total`}
        iconBg="var(--amber-soft)"
        iconFg="var(--amber)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        }
      />
      <Kpi
        label="Booked"
        value={fmt(overview.byStatus.BOOKED)}
        hint="target 400"
        iconBg="var(--green-soft)"
        iconFg="var(--green)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        }
      />
      <Kpi
        label="Cancelled"
        value={fmt(overview.byStatus.CANCELLED)}
        hint="needs follow-up"
        iconBg="var(--red-soft)"
        iconFg="var(--red)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        }
      />
      <Kpi
        label="Conversion rate"
        value={`${overview.conversionRate.toFixed(1)}%`}
        hint="confirmed + booked"
        iconBg="oklch(0.96 0.03 180)"
        iconFg="oklch(0.55 0.12 195)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        }
      />
    </div>
  );
}

function Kpi({
  featured,
  label,
  value,
  trend,
  hint,
  icon,
  iconBg,
  iconFg,
}: {
  featured?: boolean;
  label: string;
  value: string;
  trend?: { up: boolean; label: string };
  hint?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconFg?: string;
}) {
  return (
    <div
      style={{
        background: featured
          ? "linear-gradient(155deg, var(--primary) 0%, var(--primary-2) 100%)"
          : "var(--surface)",
        border: featured ? "1px solid transparent" : "1px solid var(--hairline)",
        borderRadius: "var(--radius)",
        padding: 20,
        position: "relative",
        overflow: "hidden",
        color: featured ? "#fff" : "var(--ink)",
      }}
    >
      {featured && (
        <div
          aria-hidden
          style={{
            content: "''",
            position: "absolute",
            right: -40,
            top: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span
          style={{
            fontSize: 12,
            color: featured ? "rgba(255,255,255,0.85)" : "var(--ink-3)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: featured ? "rgba(255,255,255,0.18)" : iconBg ?? "var(--primary-softer)",
            color: featured ? "#fff" : iconFg ?? "var(--primary)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        {trend && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontFamily: "var(--font-data)",
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 7px",
              borderRadius: 6,
              background: featured
                ? "rgba(255,255,255,0.22)"
                : trend.up
                  ? "var(--green-soft)"
                  : "var(--red-soft)",
              color: featured ? "#fff" : trend.up ? "var(--green)" : "var(--red)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {trend.up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
            {trend.label}
          </span>
        )}
        {hint && (
          <span style={{ fontSize: 12, color: featured ? "rgba(255,255,255,0.82)" : "var(--ink-3)" }}>
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
