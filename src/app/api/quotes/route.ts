import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSystemSettings } from '@/lib/settings';

export async function GET() {
  try {
    const quotes = await db.quote.findMany({
      orderBy: { date: 'desc' },
      include: {
        customer: true,
        items: true,
      },
    });
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Quotes list error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Auto-generate quote number: QTE-2026-XXXX
    const count = await db.quote.count();
    const year = new Date().getFullYear();
    const quoteNumber = `QTE-${year}-${String(count + 1).padStart(4, '0')}`;

    // Valid until: default 30 days from now
    const validUntil = body.validUntil
      ? new Date(body.validUntil)
      : new Date(Date.now() + 30 * 86400000);

    const sysSettings = await getSystemSettings();
    const defaultTax = sysSettings.gstEnabled ? (sysSettings.defaultGstRate || 18.0) : 0.0;
    const taxRate = body.taxRate !== undefined ? parseFloat(body.taxRate) : defaultTax;

    const newQuote = await db.quote.create({
      data: {
        quoteNumber,
        customerId: body.customerId,
        validUntil,
        preparedBy: body.preparedBy || 'PrintXO Studio Owner',
        paymentTerms: body.paymentTerms || '50% Advance, 50% Before Dispatch',
        deliveryEstimate: body.deliveryEstimate || '3-5 Working Days',
        notes: body.notes || null,
        status: body.status || 'DRAFT',

        // Cost & Pricing breakdown
        designCost: parseFloat(body.designCost) || 0,
        cadCost: parseFloat(body.cadCost) || 0,
        materialCost: parseFloat(body.materialCost) || 0,
        printCost: parseFloat(body.printCost) || 0,
        postProcessCost: parseFloat(body.postProcessCost) || 0,
        packagingCost: parseFloat(body.packagingCost) || 0,
        shippingCost: parseFloat(body.shippingCost) || 0,
        otherCost: parseFloat(body.otherCost) || 0,

        subtotal: parseFloat(body.subtotal) || 0,
        discountType: body.discountType || 'PERCENT',
        discountValue: parseFloat(body.discountValue) || 0,
        discountTotal: parseFloat(body.discountTotal) || 0,
        taxRate: taxRate,
        taxAmount: parseFloat(body.taxAmount) || 0,
        grandTotal: parseFloat(body.grandTotal) || 0,
        estimatedCost: parseFloat(body.estimatedCost) || 0,
        estimatedProfit: parseFloat(body.estimatedProfit) || 0,
        marginPercent: parseFloat(body.marginPercent) || 0,

        // Line Items
        items: {
          create: (body.items || []).map((item: any) => ({
            name: item.name,
            description: item.description || null,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            taxRate: parseFloat(item.taxRate) || 18.0,
            lineTotal: parseFloat(item.lineTotal) || 0,
            material: item.material || 'PLA',
            printTimeHours: item.printTimeHours ? parseFloat(item.printTimeHours) : null,
            filamentGrams: item.filamentGrams ? parseFloat(item.filamentGrams) : null,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    console.error('Quote create error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
