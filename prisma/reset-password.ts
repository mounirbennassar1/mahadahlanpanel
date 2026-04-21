import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Usage: npx tsx prisma/reset-password.ts <email> <new-password>");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
    select: { email: true, role: true },
  });
  console.log(`✓ Password reset for ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
