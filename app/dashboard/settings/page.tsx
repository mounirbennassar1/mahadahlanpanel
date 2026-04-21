import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>
          Settings
        </h1>
        <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }}>
          Signed in as <b style={{ color: "var(--ink)" }}>{session?.user.email}</b> · {session?.user.role}
        </div>
      </div>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hairline)",
          borderRadius: 16,
          padding: 22,
          maxWidth: 520,
        }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 }}>
          Integration
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, marginBottom: 12 }}>
          Each landing page posts leads to <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 5, fontFamily: "var(--font-data)" }}>POST /api/leads</code> with an
          <code style={{ background: "var(--surface-2)", padding: "2px 6px", borderRadius: 5, fontFamily: "var(--font-data)", marginLeft: 4 }}>x-api-key</code> header.
        </p>
        <pre
          style={{
            margin: 0,
            padding: 14,
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            fontSize: 12.5,
            fontFamily: "var(--font-data)",
            overflowX: "auto",
            color: "var(--ink-2)",
          }}
        >{`fetch("https://panel.mahadahlan.com/api/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.LEAD_API_KEY,
  },
  body: JSON.stringify({
    fullName: "Fatima Al-Zahra",
    phone: "+966 50 128 4471",
    city: "Riyadh",
  }),
});`}</pre>
      </div>
    </>
  );
}
