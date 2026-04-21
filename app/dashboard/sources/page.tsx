import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { rotateKeyAction } from "./actions";
import { RotateKeyButton } from "./rotate-button";

export const dynamic = "force-dynamic";

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ newKey?: string; slug?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const { newKey, slug } = await searchParams;

  const sources = await prisma.leadSource.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
          Sources
        </h1>
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
          One per landing page. Each site POSTs to <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 5, fontFamily: "var(--font-data)" }}>/api/leads</code> with header{" "}
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 5, fontFamily: "var(--font-data)" }}>x-api-key</code>.
        </div>
      </div>

      {newKey && slug && (
        <div
          style={{
            background: "var(--primary-softer)",
            border: "1px solid var(--primary-soft)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 4 }}>New API key for “{slug}”</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>
            Copy this key now — it won&apos;t be shown again.
          </div>
          <code
            style={{
              display: "block",
              padding: "10px 12px",
              background: "#fff",
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              fontFamily: "var(--font-data)",
              fontSize: 13,
              wordBreak: "break-all",
            }}
          >
            {newKey}
          </code>
        </div>
      )}

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 }}>
          <thead>
            <tr>
              {["Source", "Slug", "Leads", "API key hint", "Status", ""].map((h) => (
                <th
                  key={h}
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
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td style={tdStyle}>
                  <b style={{ color: "var(--ink)", fontWeight: 600 }}>{s.label}</b>
                </td>
                <td style={tdStyle}>
                  <code style={{ background: "var(--surface-2)", padding: "3px 8px", borderRadius: 6, fontFamily: "var(--font-data)", fontSize: 12.5 }}>
                    {s.slug}
                  </code>
                </td>
                <td style={tdStyle}>{s._count.leads.toLocaleString("en-US")}</td>
                <td style={tdStyle}>
                  <code style={{ fontFamily: "var(--font-data)", fontSize: 12.5, color: "var(--ink-3)" }}>{s.apiKeyHint}</code>
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "3px 9px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: s.active ? "var(--green-soft)" : "var(--slate-soft)",
                      color: s.active ? "var(--green)" : "var(--slate)",
                    }}
                  >
                    {s.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={tdStyle}>
                  {isAdmin && (
                    <form action={rotateKeyAction}>
                      <input type="hidden" name="sourceId" value={s.id} />
                      <RotateKeyButton />
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid var(--hairline)",
  color: "var(--ink-2)",
};
