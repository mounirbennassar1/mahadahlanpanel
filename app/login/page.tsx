import Image from "next/image";
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
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="MD Clinics"
            width={240}
            height={240}
            priority
            style={{ width: "auto", height: 120, objectFit: "contain" }}
          />
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
