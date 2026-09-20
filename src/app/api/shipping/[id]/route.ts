import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function notifyWebsiteShipment(shipment: any, orderNumber: string) {
  const websiteUrl = process.env.WEBSITE_API_URL || 'http://localhost:3000';
  try {
    await fetch(`${websiteUrl}/api/sync/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        carrier: shipment.courierName,
        trackingNumber: shipment.trackingNumber,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        shippedAt: shipment.shipDate,
        notes: shipment.notes,
      }),
    });
    console.log(`✓ Notified website of shipment update for ${orderNumber}`);
  } catch (e: any) {
    console.warn('Website shipment notification warning:', e.message);
  }
}

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

    if (updated.orderId && body.status) {
      await db.order.update({
        where: { id: updated.orderId },
        data: { shippingStatus: body.status === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED' },
      });
    }

    if (updated.order?.orderNumber) {
      await notifyWebsiteShipment(updated, updated.order.orderNumber);
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
