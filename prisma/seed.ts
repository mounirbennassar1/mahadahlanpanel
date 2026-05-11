import { PrismaClient, LeadStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateApiKey } from "../lib/api-key";
import "dotenv/config";

const prisma = new PrismaClient();

// Slugs match the route segments under app/(landings)/<slug>/ in the
// landingpages project. The slug is what each landing sends as `source`,
// and what we render in the dashboard filters.
const SOURCES = [
  { slug: "hair", label: "علاج تساقط الشعر" },
  { slug: "botox", label: "البوتوكس والفيلر" },
  { slug: "hyperpigmentation", label: "علاج التصبّغات" },
  { slug: "dark-circles", label: "علاج الهالات حول العين" },
  { slug: "acne", label: "علاج حب الشباب" },
  { slug: "facial", label: "العناية بالبشرة والهايدرافيشل" },
  { slug: "stretchmarks", label: "علاج التشققات وعلامات التمدد" },
];

const TEAM = [
  { email: "layla@mahadahlan.com", name: "Layla Harbi", role: "MANAGER" as const, hue: 295 },
  { email: "omar@mahadahlan.com", name: "Omar Al-Farsi", role: "AGENT" as const, hue: 220 },
  { email: "nour@mahadahlan.com", name: "Nour Saleh", role: "AGENT" as const, hue: 155 },
  { email: "yousef@mahadahlan.com", name: "Yousef Khalil", role: "AGENT" as const, hue: 30 },
  { email: "hala@mahadahlan.com", name: "Hala Rashed", role: "AGENT" as const, hue: 330 },
];

const CITIES = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Taif", "Abha", "Khobar"];
const NAMES = [
  "Fatima Al-Zahra",
  "Ahmad Mahmoud",
  "Sara Al-Mansour",
  "Yousef Al-Qahtani",
  "Nadia Saad",
  "Omar Bin Ghazi",
  "Khalid Rahmani",
  "Layla Khoury",
  "Reem Al-Harbi",
  "Mazen Fayez",
  "Hanan Al-Ghamdi",
  "Tariq Sultan",
  "Noor Al-Balawi",
  "Faisal Al-Shehri",
  "Mariam Al-Sabah",
];

const STATUS_POOL: LeadStatus[] = [
  "INQUIRY",
  "INQUIRY",
  "INQUIRY",
  "INQUIRY",
  "CONFIRMED",
  "CONFIRMED",
  "BOOKED",
  "BOOKED",
  "NO_ANSWER",
  "CANCELLED",
  "NOT_INTERESTED",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefix = rand(["50", "55", "54", "53", "56"]);
  const a = String(Math.floor(100 + Math.random() * 900));
  const b = String(Math.floor(1000 + Math.random() * 9000));
  return `+966 ${prefix} ${a} ${b}`;
}

const DEFAULT_ADMIN_EMAIL = "admin@mahadahlan.com";
const DEFAULT_ADMIN_PASSWORD = "Mahadahlan@2026";
const DEFAULT_ADMIN_NAME = "Mahadahlan Admin";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME;

  console.log("→ Seeding admin…");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: "ADMIN", passwordHash },
    create: { email: adminEmail, name: adminName, role: "ADMIN", passwordHash, avatarHue: 295 },
  });

  console.log("→ Seeding team…");
  const users = [];
  for (const t of TEAM) {
    const u = await prisma.user.upsert({
      where: { email: t.email },
      update: { name: t.name, role: t.role, avatarHue: t.hue },
      create: {
        email: t.email,
        name: t.name,
        role: t.role,
        avatarHue: t.hue,
        passwordHash: await bcrypt.hash("mahadahlan-temp", 12),
      },
    });
    users.push(u);
  }

  console.log("→ Seeding sources (with fresh API keys)…");
  const sourceRecords = [];
  for (const src of SOURCES) {
    const { key, hash, hint } = generateApiKey(src.slug);
    const record = await prisma.leadSource.upsert({
      where: { slug: src.slug },
      update: { label: src.label, apiKeyHash: hash, apiKeyHint: hint, active: true },
      create: { slug: src.slug, label: src.label, apiKeyHash: hash, apiKeyHint: hint, active: true },
    });
    sourceRecords.push(record);
    console.log(`   ${src.slug.padEnd(12)} → ${key}`);
  }

  console.log("→ Seeding sample leads…");
  const existing = await prisma.lead.count();
  if (existing === 0) {
    const leadsData = [];
    for (let i = 0; i < 180; i++) {
      const daysBack = Math.floor(Math.random() * 30);
      const hoursBack = Math.floor(Math.random() * 24);
      const submittedAt = new Date(Date.now() - daysBack * 86400000 - hoursBack * 3600000);
      leadsData.push({
        fullName: rand(NAMES),
        phone: randomPhone(),
        city: rand(CITIES),
        status: rand(STATUS_POOL),
        sourceId: rand(sourceRecords).id,
        assigneeId: Math.random() > 0.3 ? rand(users).id : null,
        submittedAt,
      });
    }
    await prisma.lead.createMany({ data: leadsData });
    console.log(`   Created ${leadsData.length} leads.`);
  } else {
    console.log(`   Skipping — ${existing} leads already exist.`);
  }

  console.log("\n✓ Seed complete.\n");
  console.log("━".repeat(60));
  console.log("  ADMIN LOGIN");
  console.log("━".repeat(60));
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("━".repeat(60));
  console.log("\n  Team members (password: mahadahlan-temp):");
  for (const t of TEAM) console.log(`    - ${t.email}`);
  console.log("\n  (Keep the API keys printed above — they will not be shown again.)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
