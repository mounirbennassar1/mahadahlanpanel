"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key";

export async function rotateKeyAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Forbidden");

  const sourceId = String(formData.get("sourceId") ?? "");
  if (!sourceId) throw new Error("Missing sourceId");

  const source = await prisma.leadSource.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error("Source not found");

  const { key, hash, hint } = generateApiKey(source.slug);
  await prisma.leadSource.update({
    where: { id: source.id },
    data: { apiKeyHash: hash, apiKeyHint: hint },
  });

  revalidatePath("/dashboard/sources");
  redirect(`/dashboard/sources?newKey=${encodeURIComponent(key)}&slug=${encodeURIComponent(source.slug)}`);
}
