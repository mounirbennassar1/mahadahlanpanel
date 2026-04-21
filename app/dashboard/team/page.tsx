import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignedLeads: true } } },
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
          Team
        </h1>
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
          {users.length} members
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--hairline)",
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  color: "#fff",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-display)",
                  background: `linear-gradient(135deg, oklch(0.72 0.12 ${u.avatarHue}), oklch(0.5 0.15 ${u.avatarHue}))`,
                }}
              >
                {initials(u.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{u.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: 11.5, padding: "3px 8px", borderRadius: 999, background: "var(--primary-softer)", color: "var(--primary)", fontWeight: 600 }}>
                {u.role}
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {u._count.assignedLeads} assigned
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
