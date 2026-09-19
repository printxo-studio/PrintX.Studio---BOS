import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const printer = await db.printer.findUnique({
      where: { id: params.id },
      include: {
        printJobs: {
          orderBy: { createdAt: 'desc' },
          include: { product: true, filamentSpool: true, order: true },
        },
        maintenances: {
          orderBy: { performedAt: 'desc' },
        },
        calibrations: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!printer) return NextResponse.json({ error: 'Printer not found' }, { status: 404 });
    return NextResponse.json(printer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch printer' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Add Maintenance Log (Section 15)
    if (body.action === 'ADD_MAINTENANCE') {
      const maintenance = await db.printerMaintenance.create({
        data: {
          printerId: params.id,
          maintenanceType: body.maintenanceType || 'ROUTINE',
          description: body.description,
          cost: parseFloat(body.cost) || 0,
          performedBy: body.performedBy || 'PrintXO Operator',
          notes: body.notes || null,
        },
      });

      // Increment printer maintenance cost
      await db.printer.update({
        where: { id: params.id },
        data: {
          maintenanceCost: { increment: parseFloat(body.cost) || 0 },
        },
      });

      return NextResponse.json(maintenance);
    }

    const updated = await db.printer.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.model && { model: body.model }),
        ...(body.serialNumber !== undefined && { serialNumber: body.serialNumber }),
        ...(body.status && { status: body.status }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.nozzleSize !== undefined && { nozzleSize: parseFloat(body.nozzleSize) }),
        ...(body.nozzleType !== undefined && { nozzleType: body.nozzleType }),
        ...(body.hourlyCostRate !== undefined && { hourlyCostRate: parseFloat(body.hourlyCostRate) }),
        ...(body.ipAddress !== undefined && { ipAddress: body.ipAddress }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Printer update error:', error);
    return NextResponse.json({ error: 'Failed to update printer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.printer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete printer' }, { status: 500 });
  }
}
