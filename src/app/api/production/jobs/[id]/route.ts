import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.printJob.findUnique({
      where: { id: params.id },
      include: {
        order: { include: { customer: true } },
        product: true,
        printer: true,
        filamentSpool: true,
        printProfile: true,
        calibration: true,
        inspections: true,
      },
    });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const currentJob = await db.printJob.findUnique({
      where: { id: params.id },
      include: { printer: true, filamentSpool: true, order: true },
    });

    if (!currentJob) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // 1. ACTION: START PRINTING
    if (body.action === 'START') {
      const updated = await db.printJob.update({
        where: { id: params.id },
        data: {
          status: 'PRINTING',
          startedAt: new Date(),
        },
      });

      // Update printer status
      await db.printer.update({
        where: { id: currentJob.printerId },
        data: { status: 'PRINTING' },
      });

      return NextResponse.json(updated);
    }

    // 2. ACTION: COMPLETE PRINT (Auto-deduct filament & update printer stats)
    if (body.action === 'COMPLETE') {
      const actualTime = parseFloat(body.actualTimeHours) || currentJob.estimatedTimeHours || 1;
      const actualFilament = parseFloat(body.actualFilamentG) || currentJob.estimatedFilamentG || 50;
      const wasteFilament = parseFloat(body.wasteFilamentG) || 0;
      const totalFilamentUsed = actualFilament + wasteFilament;

      // Update Print Job
      const updatedJob = await db.printJob.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          result: 'SUCCESS',
          completedAt: new Date(),
          actualTimeHours: actualTime,
          actualFilamentG: actualFilament,
          wasteFilamentG: wasteFilament,
        },
      });

      // Update Printer Lifetime Stats (Section 15)
      await db.printer.update({
        where: { id: currentJob.printerId },
        data: {
          status: 'AVAILABLE',
          totalPrintHours: { increment: actualTime },
          totalJobs: { increment: 1 },
          successfulJobs: { increment: 1 },
        },
      });

      // Auto-deduct Filament from Spool (Section 16 & Section 48)
      if (currentJob.filamentSpoolId && currentJob.filamentSpool) {
        const spool = currentJob.filamentSpool;
        const newWeight = Math.max(0, spool.currentWeightG - totalFilamentUsed);
        const newUsed = spool.usedWeightG + actualFilament;
        const newWaste = spool.wasteWeightG + wasteFilament;
        const newStatus =
          newWeight <= 0 ? 'EMPTY' : newWeight <= spool.reorderLevelG ? 'LOW' : 'IN_USE';

        await db.filamentSpool.update({
          where: { id: spool.id },
          data: {
            currentWeightG: newWeight,
            usedWeightG: newUsed,
            wasteWeightG: newWaste,
            status: newStatus,
          },
        });

        // Trigger Notification if spool becomes LOW
        if (newStatus === 'LOW' || newStatus === 'EMPTY') {
          await db.notification.create({
            data: {
              type: 'LOW_STOCK',
              title: `Spool Low: ${spool.brand} ${spool.material} (${spool.spoolCode})`,
              message: `Only ${newWeight}g remaining on spool ${spool.spoolCode}. Reorder recommended.`,
              entityType: 'FilamentSpool',
              entityId: spool.id,
            },
          });
        }
      }

      // Update Order Item producedQty if linked
      if (currentJob.orderId && currentJob.productId) {
        const item = await db.orderItem.findFirst({
          where: { orderId: currentJob.orderId, productId: currentJob.productId },
        });
        if (item) {
          await db.orderItem.update({
            where: { id: item.id },
            data: { producedQty: { increment: currentJob.quantity } },
          });
        }
      }

      return NextResponse.json(updatedJob);
    }

    // 3. ACTION: FAIL PRINT
    if (body.action === 'FAIL') {
      const reason = body.failureReason || 'Bed adhesion / warping issue';
      const actualTime = parseFloat(body.actualTimeHours) || currentJob.estimatedTimeHours || 0.5;

      const updatedJob = await db.printJob.update({
        where: { id: params.id },
        data: {
          status: 'FAILED',
          result: body.result || 'FAILED',
          failureReason: reason,
          completedAt: new Date(),
          actualTimeHours: actualTime,
          qcStatus: 'FAILED',
        },
      });

      // Update printer stats
      await db.printer.update({
        where: { id: currentJob.printerId },
        data: {
          status: 'AVAILABLE',
          totalJobs: { increment: 1 },
          failedJobs: { increment: 1 },
        },
      });

      // Auto-log QC Inspection & Defect (Section 20 & 21)
      const count = await db.qualityInspection.count();
      await db.qualityInspection.create({
        data: {
          qcCode: `QC-2026-${String(count + 1).padStart(4, '0')}`,
          orderId: currentJob.orderId,
          productId: currentJob.productId,
          printJobId: currentJob.id,
          inspector: 'PrintXO Operator',
          inspectionStage: 'IN_PROCESS',
          specification: 'In-process print execution',
          result: 'FAILED',
          severity: 'MAJOR',
          defectType: body.defectType || 'WARPING',
          rootCause: reason,
          reprintRequired: true,
          notes: `Print failure on machine ${currentJob.printer?.name}. Reason: ${reason}`,
        },
      });

      return NextResponse.json(updatedJob);
    }

    // General field update
    const updated = await db.printJob.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.qcStatus && { qcStatus: body.qcStatus }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Print job update error:', error);
    return NextResponse.json({ error: 'Failed to update print job' }, { status: 500 });
  }
}
