import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSystemSettings } from '@/lib/settings';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const count = await db.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;

    const sysSettings = await getSystemSettings();
    // GST Breakdown: Intra-state (Karnataka) = CGST 9% + SGST 9%, Inter-state = IGST 18%
    const isIntraState = !order.customer.state || order.customer.state.toLowerCase() === 'karnataka';
    const totalTax = sysSettings.gstEnabled ? order.taxAmount : 0;
    const cgstAmount = sysSettings.gstEnabled && isIntraState ? Math.round(totalTax / 2) : 0;
    const sgstAmount = sysSettings.gstEnabled && isIntraState ? totalTax - cgstAmount : 0;
    const igstAmount = sysSettings.gstEnabled && !isIntraState ? totalTax : 0;

    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId: order.customerId,
        billingAddress: order.customer.address || order.shippingAddress || null,
        shippingAddress: order.shippingAddress || null,
        gstin: order.customer.gstin || null,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 86400000), // Net 15 days default
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        taxableAmount: order.subtotal - order.discountTotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        shippingAmount: order.shippingCost,
        grandTotal: order.totalAmount,
        amountPaid: order.paymentStatus === 'PAID' ? order.totalAmount : 0,
        balanceDue: order.paymentStatus === 'PAID' ? 0 : order.totalAmount,
        status: order.paymentStatus === 'PAID' ? 'PAID' : 'ISSUED',
        items: {
          create: order.items.map((item) => ({
            description: item.name + (item.sku ? ` (${item.sku})` : ''),
            hsnSacCode: '8477',
            quantity: item.quantity,
            rate: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            amount: item.lineTotal,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
