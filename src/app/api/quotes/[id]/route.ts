import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: true,
        orders: true,
      },
    });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check for duplication action
    if (body.action === 'DUPLICATE') {
      const original = await db.quote.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!original) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

      const count = await db.quote.count();
      const quoteNumber = `QTE-2026-${String(count + 1).padStart(4, '0')}`;

      const duplicated = await db.quote.create({
        data: {
          quoteNumber,
          customerId: original.customerId,
          validUntil: new Date(Date.now() + 30 * 86400000),
          preparedBy: original.preparedBy,
          paymentTerms: original.paymentTerms,
          deliveryEstimate: original.deliveryEstimate,
          notes: `Duplicated from ${original.quoteNumber}. ${original.notes || ''}`,
          status: 'DRAFT',
          subtotal: original.subtotal,
          discountTotal: original.discountTotal,
          taxAmount: original.taxAmount,
          grandTotal: original.grandTotal,
          estimatedCost: original.estimatedCost,
          estimatedProfit: original.estimatedProfit,
          marginPercent: original.marginPercent,
          materialCost: original.materialCost,
          printCost: original.printCost,
          postProcessCost: original.postProcessCost,
          packagingCost: original.packagingCost,
          shippingCost: original.shippingCost,
          items: {
            create: original.items.map((i) => ({
              name: i.name,
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              discount: i.discount,
              taxRate: i.taxRate,
              lineTotal: i.lineTotal,
              material: i.material,
              printTimeHours: i.printTimeHours,
              filamentGrams: i.filamentGrams,
            })),
          },
        },
      });
      return NextResponse.json(duplicated);
    }

    const updated = await db.quote.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.validUntil && { validUntil: new Date(body.validUntil) }),
        ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
        ...(body.deliveryEstimate !== undefined && { deliveryEstimate: body.deliveryEstimate }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Quote update error:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.quote.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
