const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = ['User', 'Customer', 'Product', 'Order', 'OrderItem', 'Shipment', 'Invoice'];
  for (const m of models) {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${m}'
      ORDER BY ordinal_position;
    `);
    console.log(`\n=== Table: ${m} ===`);
    console.log(cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
