import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });
    if (!shipment) return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    return NextResponse.json(shipment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const isDelivered = body.status === 'DELIVERED';

    const updated = await db.shipment.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
        ...(body.courierName && { courierName: body.courierName }),
        ...(body.delayReason !== undefined && { delayReason: body.delayReason }),
        ...(isDelivered && { deliveredDate: new Date() }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { order: true },
    });

    // Sync order status
    if (updated.orderId && body.status) {
      if (body.status === 'DELIVERED') {
        await db.order.update({
          where: { id: updated.orderId },
          data: { shippingStatus: 'DELIVERED' },
        });
      } else if (body.status === 'IN_TRANSIT' || body.status === 'SHIPPED') {
        await db.order.update({
          where: { id: updated.orderId },
          data: { shippingStatus: 'SHIPPED' },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Shipment PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.shipment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
}
