const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: {
      sku: {
        in: [
          'PRX-AERO-01',
          'PRX-ROBO-02',
          'PRX-MECH-03',
          'PRX-LIFT-04',
          'PRX-DRON-05',
          'PRX-DESK-06',
          'PRX-AERO-ARM-V1',
          'PRX-ROBO-BRK-V2'
        ]
      }
    },
    data: {
      isPublished: true
    }
  });
  console.log(`✓ Successfully published ${result.count} products to Storefront LIVE!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
