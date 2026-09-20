import { db } from '@/lib/db';

export async function generateGeminiInvoiceForOrder(orderId: string): Promise<any> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: true,
      invoices: true,
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);

  // Check if invoice already exists
  if (order.invoices && order.invoices.length > 0) {
    return order.invoices[0];
  }

  const count = await db.invoice.count();
  const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;

  // Check system config for GST
  const setting = await db.setting.findUnique({
    where: { key: 'PRINTXO_SYSTEM_CONFIG' },
  });
  let isGstEnabled = false;
  if (setting?.value) {
    try {
      const parsed = JSON.parse(setting.value);
      isGstEnabled = parsed.gstEnabled === true;
    } catch (e) {}
  }

  const state = (order.customer.state || '').trim().toLowerCase();
  const isIntraState = !state || state === 'karnataka' || state === 'ka';

  const subtotal = order.subtotal || 0;
  const discountTotal = order.discountTotal || 0;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  
  // If GST is disabled, tax MUST be 0
  const totalTax = isGstEnabled
    ? (order.taxAmount > 0 ? order.taxAmount : Math.round(taxableAmount * 0.18))
    : 0;

  const cgstAmount = isGstEnabled && isIntraState ? Math.round(totalTax / 2) : 0;
  const sgstAmount = isGstEnabled && isIntraState ? totalTax - cgstAmount : 0;
  const igstAmount = isGstEnabled && !isIntraState ? totalTax : 0;

  const grandTotal = taxableAmount + totalTax + (order.shippingCost || 0);

  const officialNote = isGstEnabled
    ? `Official electronic GST tax invoice for Order ${order.orderNumber}. Complies with HSN 8477 for 3D Additive Polymer Manufacturing. No physical signature required under Section 28 of IT Act 2000.`
    : `Official commercial bill of supply / invoice for Order ${order.orderNumber}. Non-GST supply. Complies with HSN 8477 for 3D Additive Polymer Manufacturing. No physical signature required under Section 28 of IT Act 2000.`;

  const newInvoice = await db.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      customerId: order.customerId,
      billingAddress: order.customer.address || order.shippingAddress || null,
      shippingAddress: order.shippingAddress || null,
      gstin: order.customer.gstin || null,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      subtotal,
      discountTotal,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      shippingAmount: order.shippingCost || 0,
      grandTotal,
      amountPaid: order.paymentStatus === 'PAID' ? grandTotal : 0,
      balanceDue: order.paymentStatus === 'PAID' ? 0 : grandTotal,
      status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
      notes: officialNote,
      items: {
        create: order.items.map((item) => ({
          description: item.name + (item.sku ? ` [${item.sku}]` : ''),
          hsnSacCode: '8477',
          quantity: item.quantity,
          rate: item.unitPrice,
          discount: item.discount,
          taxRate: isGstEnabled ? (item.taxRate || 18.0) : 0.0,
          amount: item.lineTotal,
        })),
      },
    },
    include: {
      items: true,
      customer: true,
    },
  });

  return newInvoice;
}
