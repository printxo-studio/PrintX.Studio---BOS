import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        quote: true,
        items: {
          include: { product: true },
        },
        printJobs: {
          include: {
            printer: true,
            filamentSpool: true,
            printProfile: true,
          },
        },
        invoices: {
          include: { payments: true },
        },
        shipments: true,
        inspections: {
          include: { defects: true },
        },
        complaints: true,
        tasks: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order detail API error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await db.order.update({
      where: { id: params.id },
      data: {
        ...(body.overallStatus && { overallStatus: body.overallStatus }),
        ...(body.productionStatus && { productionStatus: body.productionStatus }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.qcStatus && { qcStatus: body.qcStatus }),
        ...(body.shippingStatus && { shippingStatus: body.shippingStatus }),
        ...(body.priority && { priority: body.priority }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        ...(body.shippingAddress !== undefined && { shippingAddress: body.shippingAddress }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
