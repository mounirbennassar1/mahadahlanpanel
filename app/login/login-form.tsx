"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "./actions";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await signInAction(formData, next ?? "/dashboard");
          if (result?.error) setError(result.error);
          else router.push(next ?? "/dashboard");
        });
      }}
    >
      <label className="block mb-4">
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 6 }}>Email</div>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--hairline)",
            background: "var(--surface-2)",
            fontSize: 14,
            outline: "none",
          }}
        />
      </label>

      <label className="block mb-5">
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 6 }}>Password</div>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--hairline)",
            background: "var(--surface-2)",
            fontSize: 14,
            outline: "none",
          }}
        />
      </label>

      {error && (
        <div
          style={{
            background: "var(--red-soft)",
            color: "var(--red)",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          width: "100%",
          padding: "11px 18px",
          borderRadius: 12,
          background: "linear-gradient(180deg, var(--primary) 0%, var(--primary-2) 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 6px 16px oklch(0.46 0.16 295 / 0.28)",
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
