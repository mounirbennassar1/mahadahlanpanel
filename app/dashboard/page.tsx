import {
  getLeadsByCity,
  getLeadsOverTime,
  getOverviewMetrics,
  getTeamPerformance,
} from "@/lib/metrics";
import { auth } from "@/auth";
import { KpiRow } from "./_components/kpi-row";
import { LeadsOverTimeChart } from "./_components/leads-over-time";
import { StatusDonut } from "./_components/status-donut";
import { CitiesBar } from "./_components/cities-bar";
import { TeamBars } from "./_components/team-bars";
import { Funnel } from "./_components/funnel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await auth();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  const [overview, overTime, cities, team, totalSources, topRep] = await Promise.all([
    getOverviewMetrics(),
    getLeadsOverTime(30),
    getLeadsByCity(6),
    getTeamPerformance(7),
    prisma.leadSource.count({ where: { active: true } }),
    prisma.lead.groupBy({
      by: ["assigneeId"],
      where: { status: "BOOKED", assigneeId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { assigneeId: "desc" } },
      take: 1,
    }),
  ]);

  const topRepName =
    topRep.length && topRep[0].assigneeId
      ? (await prisma.user.findUnique({ where: { id: topRep[0].assigneeId } }))?.name?.split(" ")[0] ??
        "—"
      : "—";

  const funnelInquiry = overview.byStatus.INQUIRY + overview.byStatus.CONFIRMED + overview.byStatus.BOOKED;
  const funnelConfirmed = overview.byStatus.CONFIRMED + overview.byStatus.BOOKED;
  const funnelBooked = overview.byStatus.BOOKED;

  const today = new Date();
  const fmt = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Welcome back,{" "}
            <span
              style={{
                fontFamily: "var(--font-accent)",
                fontStyle: "italic",
                fontWeight: 500,
                color: "var(--primary)",
              }}
            >
              {firstName}
            </span>
          </h1>
          <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
            Here&apos;s what&apos;s happening with your leads today · {fmt} · {totalSources} active sources
          </div>
        </div>
      </div>

      <KpiRow overview={overview} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <LeadsOverTimeChart data={overTime} />
        <StatusDonut byStatus={overview.byStatus} total={overview.total} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <CitiesBar data={cities} />
        <TeamBars data={team} />
        <Funnel inquiry={funnelInquiry} confirmed={funnelConfirmed} booked={funnelBooked} bestRep={topRepName} />
      </div>
    </>
  );
}
