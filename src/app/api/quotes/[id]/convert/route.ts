import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await db.quote.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        customer: true,
        orders: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Section 48 Validation: Quote cannot be converted twice
    if (quote.status === 'CONVERTED' || quote.orders.length > 0) {
      return NextResponse.json(
        { error: 'This quote has already been converted into an order.' },
        { status: 400 }
      );
    }

    // Generate next Order Number: ORD-2026-XXXX
    const orderCount = await db.order.count();
    const orderNumber = `ORD-2026-${String(orderCount + 1).padStart(4, '0')}`;

    // Create Order and OrderItems directly from Quote
    const newOrder = await db.order.create({
      data: {
        orderNumber,
        customerId: quote.customerId,
        quoteId: quote.id,
        orderDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 86400000), // Default 7 days manufacturing lead time
        priority: 'NORMAL',
        subtotal: quote.subtotal,
        discountTotal: quote.discountTotal,
        taxAmount: quote.taxAmount,
        shippingCost: quote.shippingCost,
        totalAmount: quote.grandTotal,
        paymentStatus: 'PENDING',
        productionStatus: 'PENDING',
        qcStatus: 'PENDING',
        shippingStatus: 'PENDING',
        overallStatus: 'CONFIRMED',
        shippingAddress: quote.customer.address || null,
        notes: `Generated from accepted quotation ${quote.quoteNumber}. ${quote.notes || ''}`,
        items: {
          create: quote.items.map((qi) => ({
            productId: qi.productId || null,
            name: qi.name,
            description: qi.description,
            quantity: qi.quantity,
            unitPrice: qi.unitPrice,
            discount: qi.discount,
            taxRate: qi.taxRate,
            lineTotal: qi.lineTotal,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Mark Quote as CONVERTED
    await db.quote.update({
      where: { id: quote.id },
      data: { status: 'CONVERTED' },
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Convert quote to order error:', error);
    return NextResponse.json(
      { error: 'Failed to convert quote to order' },
      { status: 500 }
    );
  }
}
