import { Card } from "./card";

type Point = { date: string; submissions: number; converted: number };

function smoothPath(values: number[], x: (i: number) => number, y: (v: number) => number) {
  let d = "";
  values.forEach((v, i) => {
    const px = x(i);
    const py = y(v);
    if (i === 0) {
      d += `M ${px} ${py}`;
    } else {
      const px0 = x(i - 1);
      const py0 = y(values[i - 1]);
      const cx1 = px0 + (px - px0) * 0.4;
      const cx2 = px - (px - px0) * 0.4;
      d += ` C ${cx1} ${py0}, ${cx2} ${py}, ${px} ${py}`;
    }
  });
  return d;
}

export function LeadsOverTimeChart({ data }: { data: Point[] }) {
  const W = 720;
  const H = 260;
  const pad = { l: 36, r: 16, t: 16, b: 32 };
  const n = Math.max(data.length, 1);

  const submissions = data.map((d) => d.submissions);
  const converted = data.map((d) => d.converted);
  const maxVal = Math.max(1, ...submissions, ...converted) * 1.15;

  const x = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxVal) * (H - pad.t - pad.b);

  const dSub = smoothPath(submissions, x, y);
  const dConv = smoothPath(converted, x, y);
  const areaSub = `${dSub} L ${x(n - 1)} ${H - pad.b} L ${x(0)} ${H - pad.b} Z`;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const yy = pad.t + (i * (H - pad.t - pad.b)) / 4;
    const label = Math.round(maxVal - (i * maxVal) / 4);
    gridLines.push(
      <g key={`g${i}`}>
        <line x1={pad.l} x2={W - pad.r} y1={yy} y2={yy} stroke="oklch(0.94 0.012 295)" strokeDasharray="3 4" />
        <text x={pad.l - 8} y={yy + 4} fontSize="10" fill="oklch(0.68 0.018 295)" fontFamily="Inter" textAnchor="end">
          {label}
        </text>
      </g>
    );
  }
  const xLabels = [];
  for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 6))) {
    const d = data[i];
    const day = d ? d.date.slice(5) : `${i + 1}`;
    xLabels.push(
      <text key={`xl${i}`} x={x(i)} y={H - 12} fontSize="10" fill="oklch(0.68 0.018 295)" fontFamily="Inter" textAnchor="middle">
        {day}
      </text>
    );
  }

  return (
    <Card
      title="Leads over time"
      subtitle="Submissions vs. conversions · last 30 days"
      right={
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Legend />
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 260, display: "block" }}>
        <defs>
          <linearGradient id="subGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.46 0.16 295)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="oklch(0.46 0.16 295)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines}
        {xLabels}
        <path d={areaSub} fill="url(#subGrad)" />
        <path d={dSub} stroke="oklch(0.46 0.16 295)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={dConv} stroke="oklch(0.72 0.14 75)" strokeWidth="2.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {n > 0 && (
          <>
            <circle cx={x(n - 1)} cy={y(submissions[n - 1])} r={5} fill="#fff" stroke="oklch(0.46 0.16 295)" strokeWidth={2.5} />
            <circle cx={x(n - 1)} cy={y(converted[n - 1])} r={5} fill="#fff" stroke="oklch(0.72 0.14 75)" strokeWidth={2.5} />
          </>
        )}
      </svg>
    </Card>
  );
}

function Legend() {
  const item = (color: string, label: string) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        color: "var(--ink-2)",
        fontWeight: 500,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} /> {label}
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {item("var(--primary)", "Submissions")}
      {item("var(--amber)", "Converted")}
    </div>
  );
}
