// Seed default Config rows. Only inserts rows that don't already exist —
// admin changes are never overwritten on subsequent boots.

const prisma = require("./db");
const { DEFAULT_CONFIG } = require("@innovapie/shared");

async function main() {
  const existing = await prisma.config.findMany();
  const have = new Set(existing.map((r) => r.key));

  const entries = Object.entries(DEFAULT_CONFIG);
  for (const [key, value] of entries) {
    if (have.has(key)) {
      console.log(`[seed] skip '${key}' (already present)`);
      continue;
    }
    await prisma.config.create({
      data: { key, value: JSON.stringify(value) },
    });
    console.log(`[seed] inserted '${key}'`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
