"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignLead } from "./actions";

type UserLite = { id: string; name: string; avatarHue: number };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

export function AssigneePill({
  leadId,
  assignee,
  users,
}: {
  leadId: string;
  assignee: UserLite | null;
  users: UserLite[];
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<UserLite | null>(assignee);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {current ? (
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px 4px 4px",
            borderRadius: 999,
            background: "var(--surface-2)",
            border: "1px solid var(--hairline)",
            fontSize: 12.5,
            color: "var(--ink-2)",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              background: `oklch(0.56 0.14 ${current.avatarHue})`,
            }}
          >
            {initials(current.name)}
          </span>
          {current.name.split(" ")[0]}
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: "transparent",
            border: "1px dashed var(--border-strong)",
            fontSize: 12,
            color: "var(--ink-3)",
            fontWeight: 500,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Assign
        </button>
      )}
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
              minWidth: 220,
              zIndex: 100,
            }}
          >
            <div style={{ padding: "6px 10px 8px", fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Assign to
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setOpen(false);
                  const prev = current;
                  setCurrent(u);
                  startTransition(async () => {
                    const r = await assignLead(leadId, u.id);
                    if (!r.ok) setCurrent(prev);
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
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-display)",
                    background: `oklch(0.56 0.14 ${u.avatarHue})`,
                  }}
                >
                  {initials(u.name)}
                </span>
                {u.name}
              </button>
            ))}
            <div style={{ height: 1, background: "var(--hairline)", margin: "4px 0" }} />
            <button
              onClick={() => {
                setOpen(false);
                const prev = current;
                setCurrent(null);
                startTransition(async () => {
                  const r = await assignLead(leadId, null);
                  if (!r.ok) setCurrent(prev);
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
                color: "var(--ink-3)",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "1px dashed var(--border-strong)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 10,
                }}
              >
                —
              </span>
              Unassigned
            </button>
          </div>
        </>
      )}
    </div>
  );
}
