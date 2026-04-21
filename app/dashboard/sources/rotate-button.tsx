"use client";

import { useFormStatus } from "react-dom";

export function RotateKeyButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        background: "var(--surface)",
        border: "1px solid var(--hairline)",
        fontSize: 12.5,
        fontWeight: 500,
        color: "var(--ink-2)",
      }}
    >
      {pending ? "Rotating…" : "Rotate key"}
    </button>
  );
}
