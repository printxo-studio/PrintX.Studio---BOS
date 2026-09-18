import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const printers = await db.printer.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        printJobs: {
          where: { status: 'PRINTING' },
          include: { product: true, filamentSpool: true },
        },
        maintenances: {
          orderBy: { performedAt: 'desc' },
          take: 3,
        },
      },
    });
    return NextResponse.json(printers);
  } catch (error) {
    console.error('Printers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch printers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.printer.count();
    const printerCode = body.printerCode || `PRT-${String(count + 1).padStart(3, '0')}`;

    const newPrinter = await db.printer.create({
      data: {
        printerCode,
        name: body.name,
        manufacturer: body.manufacturer || 'Bambu Lab',
        model: body.model || 'P1S',
        serialNumber: body.serialNumber || null,
        location: body.location || 'Farm Rack 1',
        nozzleSize: parseFloat(body.nozzleSize) || 0.4,
        nozzleType: body.nozzleType || 'Hardened Steel',
        purchaseCost: parseFloat(body.purchaseCost) || 0,
        status: body.status || 'AVAILABLE',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newPrinter, { status: 201 });
  } catch (error) {
    console.error('Printer creation error:', error);
    return NextResponse.json({ error: 'Failed to create printer' }, { status: 500 });
  }
}
