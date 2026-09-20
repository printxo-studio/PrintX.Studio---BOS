const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Coupon" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
      "value" DOUBLE PRECISION NOT NULL,
      "minOrderValue" DOUBLE PRECISION DEFAULT 0,
      "maxDiscount" DOUBLE PRECISION,
      "usageLimit" INTEGER,
      "timesUsed" INTEGER NOT NULL DEFAULT 0,
      "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "validTo" TIMESTAMP(3),
      "isActive" BOOLEAN NOT NULL DEFAULT true
    );
  `);
  console.log('✓ Coupon table created or verified.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
