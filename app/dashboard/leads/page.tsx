import { prisma } from "@/lib/prisma";
import { STATUS_ORDER, formatRelative } from "@/lib/status";
import type { LeadStatus, Prisma } from "@prisma/client";
import { LeadsFilters } from "./filters";
import { StatusPill } from "./status-pill";
import { AssigneePill } from "./assignee-pill";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function parseStatus(value: string | undefined): LeadStatus | null {
  if (!value) return null;
  if (STATUS_ORDER.includes(value as LeadStatus)) return value as LeadStatus;
  return null;
}

function leadAvatarHue(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  const hues = [295, 220, 155, 30, 330, 250, 120];
  return hues[h % hues.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeSourceSlug = params.source && params.source !== "all" ? params.source : null;
  const activeStatus = parseStatus(params.status);
  const q = params.q?.trim() ?? "";
  const pageNum = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where: Prisma.LeadWhereInput = {};
  if (activeSourceSlug) where.source = { slug: activeSourceSlug };
  if (activeStatus) where.status = activeStatus;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, totalCount, sources, statusCounts, allUsers] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: { source: true, assignee: true },
      skip: (pageNum - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    prisma.leadSource.findMany({ orderBy: { label: "asc" }, select: { slug: true, label: true, _count: { select: { leads: true } } } }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: activeSourceSlug ? { source: { slug: activeSourceSlug } } : undefined,
    }),
    prisma.user.findMany({ select: { id: true, name: true, avatarHue: true, role: true } }),
  ]);

  const statusCountMap = new Map(statusCounts.map((s) => [s.status, s._count._all] as const));
  const allStatusTotal = statusCounts.reduce((sum, s) => sum + s._count._all, 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--ink)", margin: 0 }}>
            Leads
          </h1>
          <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
            {totalCount.toLocaleString("en-US")} leads · filtered view
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <LeadsFilters
          sources={sources.map((s) => ({ slug: s.slug, label: s.label, count: s._count.leads }))}
          activeSource={activeSourceSlug}
          activeStatus={activeStatus}
          query={q}
          statusCounts={{
            ALL: allStatusTotal,
            ...Object.fromEntries(
              STATUS_ORDER.map((s) => [s, statusCountMap.get(s) ?? 0])
            ),
          }}
        />

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 }}>
            <thead>
              <tr>
                <Th>Lead</Th>
                <Th>Phone</Th>
                <Th>City</Th>
                <Th>Source</Th>
                <Th>Status</Th>
                <Th>Assigned to</Th>
                <Th>Submitted</Th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
                    No leads match the current filter.
                  </td>
                </tr>
              )}
              {leads.map((lead) => {
                const hue = leadAvatarHue(lead.fullName);
                const rel = formatRelative(lead.submittedAt);
                return (
                  <tr key={lead.id} style={{ transition: "background 0.12s" }}>
                    <Td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 12,
                            fontFamily: "var(--font-display)",
                            flex: "none",
                            letterSpacing: "-0.01em",
                            background: `linear-gradient(135deg, oklch(0.72 0.12 ${hue}), oklch(0.5 0.15 ${hue}))`,
                          }}
                        >
                          {initials(lead.fullName)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.2 }}>
                          <b style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14 }}>{lead.fullName}</b>
                          <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-data)", marginTop: 2 }}>
                            #LD-{lead.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span style={{ fontFamily: "var(--font-data)", fontVariantNumeric: "tabular-nums", color: "var(--ink-2)", fontSize: 13.5 }}>
                        {lead.phone}
                      </span>
                    </Td>
                    <Td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px",
                          background: "var(--surface-2)",
                          border: "1px solid var(--hairline)",
                          borderRadius: 7,
                          fontSize: 12.5,
                          color: "var(--ink-2)",
                          fontWeight: 500,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--ink-4)" }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {lead.city}
                      </span>
                    </Td>
                    <Td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          background: "var(--primary-softer)",
                          color: "var(--primary)",
                          borderRadius: 999,
                          fontFamily: "var(--font-data)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {lead.source.label}
                      </span>
                    </Td>
                    <Td>
                      <StatusPill leadId={lead.id} status={lead.status} />
                    </Td>
                    <Td>
                      <AssigneePill
                        leadId={lead.id}
                        assignee={lead.assignee ? { id: lead.assignee.id, name: lead.assignee.name, avatarHue: lead.assignee.avatarHue } : null}
                        users={allUsers.map((u) => ({ id: u.id, name: u.name, avatarHue: u.avatarHue }))}
                      />
                    </Td>
                    <Td>
                      <span style={{ fontFamily: "var(--font-data)", fontVariantNumeric: "tabular-nums", fontSize: 13, color: "var(--ink-2)", display: "block", lineHeight: 1.25 }}>
                        {rel.when}
                        <span style={{ color: "var(--ink-4)", fontSize: 12, display: "block" }}>{rel.time}</span>
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          total={totalCount}
          pageSize={PAGE_SIZE}
          currentPage={pageNum}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 16px",
        fontSize: 11.5,
        fontWeight: 600,
        color: "var(--ink-3)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--hairline)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--hairline)",
        verticalAlign: "middle",
        color: "var(--ink-2)",
      }}
    >
      {children}
    </td>
  );
}

function Pagination({
  total,
  pageSize,
  currentPage,
  totalPages,
}: {
  total: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(total, currentPage * pageSize);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        borderTop: "1px solid var(--hairline)",
        fontSize: 13,
        color: "var(--ink-3)",
      }}
    >
      <div>
        Showing <b style={{ color: "var(--ink)" }}>{start}–{end}</b> of{" "}
        <b style={{ color: "var(--ink)" }}>{total.toLocaleString("en-US")}</b> leads
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
          <PageLink key={p} page={p} active={p === currentPage} />
        ))}
      </div>
    </div>
  );
}

function PageLink({ page, active }: { page: number; active: boolean }) {
  return (
    <a
      href={`?page=${page}`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        color: active ? "#fff" : "var(--ink-2)",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "var(--font-data)",
        background: active ? "var(--ink)" : "transparent",
      }}
    >
      {page}
    </a>
  );
}
