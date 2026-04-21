import { createHash, randomBytes } from "node:crypto";

export function generateApiKey(slug: string): { key: string; hash: string; hint: string } {
  const raw = randomBytes(24).toString("base64url");
  const key = `mdp_${slug}_${raw}`;
  return { key, hash: hashApiKey(key), hint: key.slice(0, 8) + "…" + key.slice(-4) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
