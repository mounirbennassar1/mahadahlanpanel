"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { LeadStatus } from "@prisma/client";
import { STATUS_ORDER } from "@/lib/status";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await requireSession();
  if (!STATUS_ORDER.includes(status)) return { ok: false as const, error: "Invalid status" };

  await prisma.lead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function assignLead(leadId: string, userId: string | null) {
  await requireSession();
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return { ok: false as const, error: "User not found" };
  }
  await prisma.lead.update({ where: { id: leadId }, data: { assigneeId: userId } });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
