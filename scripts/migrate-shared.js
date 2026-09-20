const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing individual DDL execution...');
  const statements = [
    'ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT true;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "stockQuantity" INTEGER DEFAULT 50;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "slug" TEXT;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" JSONB;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "colorOptions" JSONB;',
    'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dimensions" TEXT;',
    'ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT DEFAULT \'Standard Surface\';',
  ];

  for (const sql of statements) {
    console.log('Executing:', sql);
    await prisma.$executeRawUnsafe(sql);
  }
  console.log('✓ All DDL statements executed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
