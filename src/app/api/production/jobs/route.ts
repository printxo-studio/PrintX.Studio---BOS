import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const jobs = await db.printJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { customer: true } },
        product: true,
        printer: true,
        filamentSpool: true,
        printProfile: true,
        calibration: true,
      },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Print jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch print jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.printJob.count();
    const jobCode = `JOB-2026-${String(count + 1).padStart(4, '0')}`;

    // Verify spool availability if spoolId provided
    if (body.filamentSpoolId && body.estimatedFilamentG) {
      const spool = await db.filamentSpool.findUnique({ where: { id: body.filamentSpoolId } });
      if (spool && spool.currentWeightG < parseFloat(body.estimatedFilamentG)) {
        return NextResponse.json(
          { error: `Insufficient filament on spool ${spool.spoolCode} (${spool.currentWeightG}g remaining, required: ${body.estimatedFilamentG}g)` },
          { status: 400 }
        );
      }
    }

    const newJob = await db.printJob.create({
      data: {
        jobCode,
        orderId: body.orderId || null,
        productId: body.productId || null,
        printerId: body.printerId,
        filamentSpoolId: body.filamentSpoolId || null,
        printProfileId: body.printProfileId || null,
        calibrationId: body.calibrationId || null,
        operator: body.operator || 'PrintXO Studio Owner',
        quantity: parseInt(body.quantity) || 1,
        estimatedTimeHours: parseFloat(body.estimatedTimeHours) || 0,
        estimatedFilamentG: parseFloat(body.estimatedFilamentG) || 0,
        status: body.status || 'QUEUED',
        qcStatus: 'PENDING',
        notes: body.notes || null,
      },
      include: {
        printer: true,
        product: true,
        filamentSpool: true,
      },
    });

    // If assigned to a printer immediately and status is PRINTING, update printer status
    if (body.status === 'PRINTING') {
      await db.printer.update({
        where: { id: body.printerId },
        data: { status: 'PRINTING' },
      });
      await db.printJob.update({
        where: { id: newJob.id },
        data: { startedAt: new Date() },
      });
    }

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Print job creation error:', error);
    return NextResponse.json({ error: 'Failed to create print job' }, { status: 500 });
  }
}
