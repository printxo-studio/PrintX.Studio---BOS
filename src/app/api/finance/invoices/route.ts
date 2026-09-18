import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSystemSettings } from '@/lib/settings';

export async function GET() {
  try {
    const invoices = await db.invoice.findMany({
      orderBy: { invoiceDate: 'desc' },
      include: {
        customer: true,
        order: true,
        items: true,
        payments: true,
      },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;

    const sysSettings = await getSystemSettings();
    const subtotal = parseFloat(body.subtotal) || 0;
    const discountTotal = parseFloat(body.discountTotal) || 0;
    const taxableAmount = subtotal - discountTotal;
    const shippingAmount = parseFloat(body.shippingAmount) || 0;
    const defaultTax = sysSettings.gstEnabled ? (sysSettings.defaultGstRate || 18.0) : 0.0;
    const taxRate = body.taxRate !== undefined ? parseFloat(body.taxRate) : defaultTax;
    const totalTax = sysSettings.gstEnabled ? Math.round((taxableAmount + shippingAmount) * (taxRate / 100)) : 0;

    // CGST + SGST (9% each for Karnataka intra-state)
    const isIntraState = body.isIntraState !== false;
    const cgstAmount = isIntraState ? Math.round(totalTax / 2) : 0;
    const sgstAmount = isIntraState ? totalTax - cgstAmount : 0;
    const igstAmount = isIntraState ? 0 : totalTax;
    const grandTotal = taxableAmount + shippingAmount + totalTax;

    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerId: body.customerId,
        orderId: body.orderId || null,
        billingAddress: body.billingAddress || null,
        shippingAddress: body.shippingAddress || null,
        gstin: body.gstin || null,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 15 * 86400000),
        paymentTerms: body.paymentTerms || 'Due on Receipt',
        subtotal,
        discountTotal,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        shippingAmount,
        grandTotal,
        amountPaid: 0,
        balanceDue: grandTotal,
        status: body.status || 'ISSUED',
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            description: item.description || '3D Printing Manufacturing Services',
            hsnSacCode: item.hsnSacCode || '8477',
            quantity: parseInt(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            discount: parseFloat(item.discount) || 0,
            taxRate,
            amount: parseFloat(item.amount) || (parseInt(item.quantity) || 1) * (parseFloat(item.rate) || 0),
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
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
