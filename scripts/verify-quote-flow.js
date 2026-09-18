const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWorkflow() {
  const cust = await prisma.customer.findFirst({ where: { customerCode: 'CUST-AERO-01' } });
  console.log('Customer:', cust.name);

  // 1. Create quote
  const quote = await prisma.quote.create({
    data: {
      quoteNumber: 'QTE-2026-TEST',
      customerId: cust.id,
      validUntil: new Date(Date.now() + 30 * 86400000),
      subtotal: 2400,
      taxAmount: 432,
      grandTotal: 2832,
      status: 'ACCEPTED',
      items: {
        create: [
          {
            name: 'PA-CF Drone Propeller Guard',
            quantity: 2,
            unitPrice: 1200,
            taxRate: 18.0,
            lineTotal: 2400,
            material: 'PA-CF',
            printTimeHours: 5.0,
            filamentGrams: 140,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log('✓ Quote created:', quote.quoteNumber, 'Total: ₹' + quote.grandTotal);

  // 2. Convert to Order
  const orderCount = await prisma.order.count();
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-' + String(orderCount + 1).padStart(4, '0'),
      customerId: cust.id,
      quoteId: quote.id,
      orderDate: new Date(),
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      totalAmount: quote.grandTotal,
      overallStatus: 'CONFIRMED',
      items: {
        create: quote.items.map((qi) => ({
          name: qi.name,
          quantity: qi.quantity,
          unitPrice: qi.unitPrice,
          taxRate: qi.taxRate,
          lineTotal: qi.lineTotal,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: 'CONVERTED' },
  });

  console.log('✓ Converted into Order:', order.orderNumber, 'Items count:', order.items.length);
}

testWorkflow()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
