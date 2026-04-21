"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signInAction(formData: FormData, redirectTo: string) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
      redirectTo,
    });
    return { ok: true as const };
  } catch (error) {
    console.error("[signIn] failed:", error);
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password." };
      }
      const cause = (error.cause as { err?: Error } | undefined)?.err?.message;
      return {
        error: cause
          ? `Sign-in failed: ${cause}`
          : `Sign-in failed (${error.type}). Check server logs.`,
      };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Sign-in failed: ${message}` };
  }
}
