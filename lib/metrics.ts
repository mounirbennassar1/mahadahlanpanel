import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StatusCounts = Record<LeadStatus, number>;

export async function getOverviewMetrics() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [total, newThisWeek, newLastWeek, todayCount, byStatusRows] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { submittedAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { submittedAt: { gte: lastWeekStart, lt: weekAgo } } }),
    prisma.lead.count({ where: { submittedAt: { gte: todayStart } } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const byStatus: StatusCounts = {
    INQUIRY: 0,
    CONFIRMED: 0,
    BOOKED: 0,
    CANCELLED: 0,
    NO_ANSWER: 0,
    NOT_INTERESTED: 0,
  };
  for (const row of byStatusRows) byStatus[row.status] = row._count._all;

  const converted = byStatus.CONFIRMED + byStatus.BOOKED;
  const conversionRate = total === 0 ? 0 : (converted / total) * 100;
  const totalTrend = newLastWeek === 0 ? 0 : ((newThisWeek - newLastWeek) / newLastWeek) * 100;

  return { total, newThisWeek, todayCount, byStatus, conversionRate, totalTrend };
}

export async function getLeadsOverTime(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const leads = await prisma.lead.findMany({
    where: { submittedAt: { gte: since } },
    select: { submittedAt: true, status: true },
  });

  const buckets: { date: string; submissions: number; converted: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.push({ date: d.toISOString().slice(0, 10), submissions: 0, converted: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.date, i]));

  for (const lead of leads) {
    const key = lead.submittedAt.toISOString().slice(0, 10);
    const i = index.get(key);
    if (i === undefined) continue;
    buckets[i].submissions += 1;
    if (lead.status === "BOOKED" || lead.status === "CONFIRMED") {
      buckets[i].converted += 1;
    }
  }

  return buckets;
}

export async function getLeadsByCity(limit = 6) {
  const rows = await prisma.lead.groupBy({
    by: ["city"],
    _count: { _all: true },
    orderBy: { _count: { city: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ city: r.city, count: r._count._all }));
}

export async function getTeamPerformance(limit = 7) {
  const users = await prisma.user.findMany({
    take: limit,
    where: { role: { in: ["AGENT", "MANAGER"] } },
    select: { id: true, name: true },
  });
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const rows = await prisma.lead.groupBy({
    by: ["assigneeId", "status"],
    where: {
      assigneeId: { in: users.map((u) => u.id) },
      submittedAt: { gte: weekAgo },
    },
    _count: { _all: true },
  });

  return users.map((u) => {
    const r = rows.filter((row) => row.assigneeId === u.id);
    return {
      id: u.id,
      name: u.name.split(" ")[0],
      booked: r.find((x) => x.status === "BOOKED")?._count._all ?? 0,
      confirmed: r.find((x) => x.status === "CONFIRMED")?._count._all ?? 0,
      inquiry: r.find((x) => x.status === "INQUIRY")?._count._all ?? 0,
    };
  });
}
