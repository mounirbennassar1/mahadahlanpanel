"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { STATUS_META, STATUS_ORDER } from "@/lib/status";
import { updateLeadStatus } from "./actions";

export function StatusPill({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const meta = STATUS_META[current];

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        className={meta.className}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px 5px 8px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          border: "1px solid transparent",
          userSelect: "none",
          fontFamily: "var(--font-ui)",
          opacity: pending ? 0.6 : 1,
        }}
      >
        <span className="dot" style={{ width: 7, height: 7, borderRadius: "50%" }} />
        {meta.label}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2, opacity: 0.55 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 90 }} />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              background: "#fff",
              border: "1px solid var(--hairline)",
              borderRadius: 12,
              boxShadow: "var(--shadow-lg)",
              padding: 6,
              minWidth: 180,
              zIndex: 100,
            }}
          >
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setOpen(false);
                  const prev = current;
                  setCurrent(s);
                  startTransition(async () => {
                    const result = await updateLeadStatus(leadId, s);
                    if (!result.ok) setCurrent(prev);
                    router.refresh();
                  });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--ink-2)",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_META[s].dot, flex: "none" }} />
                {STATUS_META[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
