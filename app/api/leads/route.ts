import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(32),
  city: z.string().trim().min(2).max(80),
});

const ALLOWED_ORIGINS = (process.env.LANDING_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))
      ? origin
      : ALLOWED_ORIGINS[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"));

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key" }, { status: 401, headers: cors });
  }

  const source = await prisma.leadSource.findUnique({
    where: { apiKeyHash: hashApiKey(apiKey) },
  });
  if (!source || !source.active) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: cors });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400, headers: cors }
    );
  }

  const lead = await prisma.lead.create({
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      sourceId: source.id,
    },
    select: { id: true, submittedAt: true },
  });

  return NextResponse.json(
    { ok: true, id: lead.id, submittedAt: lead.submittedAt, source: source.slug },
    { status: 201, headers: cors }
  );
}
