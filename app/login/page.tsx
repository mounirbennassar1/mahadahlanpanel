import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  if (session) redirect(params.next ?? "/dashboard");

  return (
    <div className="min-h-screen grid place-items-center" style={{ background: "var(--bg)" }}>
      <div
        className="w-full max-w-[400px] p-10 rounded-2xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--hairline)",
          boxShadow: "var(--shadow)",
        }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="grid place-items-center"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(145deg, var(--primary), var(--primary-2))",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              boxShadow: "0 6px 14px oklch(0.46 0.16 295 / 0.28)",
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>
              Mahadahlan
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>Lead Studio</div>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6, marginBottom: 24 }}>
          Sign in to your lead management dashboard.
        </p>

        <LoginForm next={params.next} initialError={params.error} />
      </div>
    </div>
  );
}
