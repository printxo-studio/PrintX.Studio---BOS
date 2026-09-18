import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        printJobs: true,
        invoices: true,
        shipments: true,
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.order.count();
    const orderNumber = `ORD-2026-${String(count + 1).padStart(4, '0')}`;

    const newOrder = await db.order.create({
      data: {
        orderNumber,
        customerId: body.customerId,
        quoteId: body.quoteId || null,
        orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 86400000),
        priority: body.priority || 'NORMAL',
        subtotal: parseFloat(body.subtotal) || 0,
        discountTotal: parseFloat(body.discountTotal) || 0,
        taxAmount: parseFloat(body.taxAmount) || 0,
        shippingCost: parseFloat(body.shippingCost) || 0,
        totalAmount: parseFloat(body.totalAmount) || 0,
        paymentStatus: body.paymentStatus || 'PENDING',
        productionStatus: body.productionStatus || 'PENDING',
        qcStatus: body.qcStatus || 'PENDING',
        shippingStatus: body.shippingStatus || 'PENDING',
        overallStatus: body.overallStatus || 'CONFIRMED',
        shippingAddress: body.shippingAddress || null,
        notes: body.notes || null,
        items: {
          create: (body.items || []).map((item: any) => ({
            productId: item.productId || null,
            name: item.name,
            sku: item.sku || null,
            description: item.description || null,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            taxRate: parseFloat(item.taxRate) || 18.0,
            lineTotal: parseFloat(item.lineTotal) || 0,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
