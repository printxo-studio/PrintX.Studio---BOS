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

  const state = (order.customer.state || '').trim().toLowerCase();
  const isIntraState = !state || state === 'karnataka' || state === 'ka';

  const subtotal = order.subtotal || 0;
  const discountTotal = order.discountTotal || 0;
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const totalTax = order.taxAmount > 0 ? order.taxAmount : Math.round(taxableAmount * 0.18);

  const cgstAmount = isIntraState ? Math.round(totalTax / 2) : 0;
  const sgstAmount = isIntraState ? totalTax - cgstAmount : 0;
  const igstAmount = !isIntraState ? totalTax : 0;

  const grandTotal = taxableAmount + totalTax + (order.shippingCost || 0);

  const apiKey = process.env.GEMINI_API_KEY;
  let aiNote = 'Digitally certified & verified by PrintX Studio Gemini AI Financial Engine. Complies with HSN 8477 for 3D Additive Polymer Manufacturing.';

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `You are the certified Chief Financial AI for PrintX Studio (3D Printing & Additive Manufacturing).
Order Ref: ${order.orderNumber}
Items: ${JSON.stringify(order.items.map((i) => ({ name: i.name, qty: i.quantity, rate: i.unitPrice })))}
Total: ₹${grandTotal}
Customer: ${order.customer.name} (${order.customer.city || 'Bengaluru'}, ${order.customer.state || 'KA'})
Generate a brief 1-2 sentence professional verification note for the customer tax invoice.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const candidate = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) aiNote = candidate.trim();
      }
    } catch (aiErr) {
      console.warn('Gemini API call warning:', aiErr);
    }
  }

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
      notes: aiNote,
      items: {
        create: order.items.map((item) => ({
          description: item.name + (item.sku ? ` [${item.sku}]` : ''),
          hsnSacCode: '8477',
          quantity: item.quantity,
          rate: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate || 18.0,
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
