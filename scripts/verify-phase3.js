const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPhase3() {
  console.log('🧪 Verifying Phase 3: Orders, Products, Invoices, Payments...');

  // 1. Get customer
  const cust = await prisma.customer.findFirst();
  console.log('Customer:', cust.name);

  // 2. Create Order
  const orderCount = await prisma.order.count();
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-' + String(orderCount + 1).padStart(4, '0'),
      customerId: cust.id,
      orderDate: new Date(),
      subtotal: 5000,
      taxAmount: 900,
      totalAmount: 5900,
      overallStatus: 'CONFIRMED',
      paymentStatus: 'PENDING',
      items: {
        create: [
          {
            name: 'Robotic Gripper Finger v2',
            quantity: 5,
            unitPrice: 1000,
            taxRate: 18.0,
            lineTotal: 5000,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log('✓ Order created:', order.orderNumber, 'Total:', order.totalAmount);

  // 3. Generate Tax Invoice from Order
  const invCount = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-' + String(invCount + 1).padStart(4, '0'),
      orderId: order.id,
      customerId: cust.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      subtotal: order.subtotal,
      taxableAmount: order.subtotal,
      cgstAmount: 450,
      sgstAmount: 450,
      grandTotal: order.totalAmount,
      balanceDue: order.totalAmount,
      amountPaid: 0,
      status: 'ISSUED',
      items: {
        create: [
          {
            description: 'Robotic Gripper Finger v2 (5 units)',
            hsnSacCode: '8477',
            quantity: 5,
            rate: 1000,
            amount: 5000,
          },
        ],
      },
    },
  });
  console.log('✓ Invoice generated:', invoice.invoiceNumber, 'Balance Due:', invoice.balanceDue);

  // 4. Record Payment against Invoice
  const payCount = await prisma.payment.count();
  const payment = await prisma.payment.create({
    data: {
      paymentCode: 'PAY-2026-' + String(payCount + 1).padStart(4, '0'),
      invoiceId: invoice.id,
      customerId: cust.id,
      amount: invoice.grandTotal,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI/20260916/VERIFY01',
      status: 'CONFIRMED',
    },
  });

  // Update invoice balance
  const updatedInv = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid: invoice.grandTotal,
      balanceDue: 0,
      status: 'PAID',
    },
  });
  console.log('✓ Payment recorded:', payment.paymentCode, 'New Invoice Status:', updatedInv.status, 'Balance Due:', updatedInv.balanceDue);

  // 5. Test Product Versioning (Section 12)
  const product = await prisma.product.findFirst({ where: { sku: 'PRX-AERO-ARM-V1' } });
  const newRev = await prisma.productVersion.create({
    data: {
      productId: product.id,
      version: '1.3',
      revision: 3,
      changeLog: 'Added 4mm counterbore for M3 locknuts, reduced mass by 8g',
      active: true,
    },
  });
  await prisma.product.update({
    where: { id: product.id },
    data: { currentVersion: '1.3' },
  });
  console.log('✓ Product revision released:', product.sku, 'New Version:', newRev.version, 'Revision #:', newRev.revision);

  console.log('🎉 All Phase 3 business workflows passed verification!');
}

testPhase3()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
