import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const shipments = await db.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
      },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error('Shipments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.shipment.count();
    const shipmentCode = body.shipmentCode || `SHP-2026-${String(count + 1).padStart(4, '0')}`;

    const newShipment = await db.shipment.create({
      data: {
        shipmentCode,
        orderId: body.orderId,
        courierName: body.courierName || 'Delhivery',
        trackingNumber: body.trackingNumber || null,
        trackingUrl: body.trackingUrl || null,
        shipDate: body.shipDate ? new Date(body.shipDate) : new Date(),
        expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : new Date(Date.now() + 3 * 86400000),
        shippingCost: parseFloat(body.shippingCost) || 250,
        status: body.status || 'SHIPPED',
        notes: body.notes || null,
      },
      include: {
        order: { include: { customer: true } },
      },
    });

    // Update order shipping status if order linked
    if (body.orderId) {
      await db.order.update({
        where: { id: body.orderId },
        data: {
          shippingStatus: body.status === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED',
        },
      });
    }

    return NextResponse.json(newShipment, { status: 201 });
  } catch (error) {
    console.error('Shipment creation error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
