import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_PRICING_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      printers,
      activeJobs,
      queuedJobs,
      lowSpools,
      urgentTasks,
      criticalCapas,
      todaysInvoices,
      todaysJobs,
      todaysShipments,
    ] = await Promise.all([
      db.printer.findMany({
        include: {
          printJobs: {
            where: { status: 'PRINTING' },
            include: {
              product: true,
              order: { include: { customer: true } },
              filamentSpool: true,
            },
            take: 1,
          },
        },
        orderBy: { printerCode: 'asc' },
      }),
      db.printJob.findMany({
        where: { status: 'PRINTING' },
        include: {
          printer: true,
          product: true,
          order: { include: { customer: true } },
          filamentSpool: true,
        },
        orderBy: { startedAt: 'asc' },
      }),
      db.printJob.findMany({
        where: { status: { in: ['QUEUED', 'SCHEDULED'] } },
        include: {
          printer: true,
          product: true,
          order: { include: { customer: true } },
        },
        take: 6,
        orderBy: { createdAt: 'asc' },
      }),
      db.filamentSpool.findMany({
        where: {
          OR: [
            { status: 'LOW' },
            { currentWeightG: { lte: 250 } },
          ],
        },
        take: 5,
      }),
      db.task.findMany({
        where: {
          status: { not: 'DONE' },
          priority: { in: ['HIGH', 'URGENT'] },
        },
        include: { assignee: true },
        take: 5,
        orderBy: { dueDate: 'asc' },
      }),
      db.capa.findMany({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        take: 4,
        orderBy: { createdAt: 'desc' },
      }),
      db.invoice.findMany({
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
      }),
      db.printJob.findMany({
        where: {
          createdAt: { gte: today },
        },
      }),
      db.shipment.findMany({
        where: {
          status: { in: ['PENDING', 'PACKED', 'SHIPPED'] },
        },
        include: { order: { include: { customer: true } } },
        take: 5,
      }),
    ]);

    // Live Printer Fleet Telemetry
    const fleetStatus = {
      total: printers.length,
      printing: printers.filter((p) => p.status === 'PRINTING').length,
      available: printers.filter((p) => p.status === 'AVAILABLE').length,
      maintenance: printers.filter((p) => p.status === 'MAINTENANCE' || p.status === 'CALIBRATION').length,
      error: printers.filter((p) => p.status === 'ERROR' || p.status === 'OFFLINE').length,
    };

    // Calculate active electrical draw: active printing printers * avg watts
    const activeWatts = fleetStatus.printing * (DEFAULT_PRICING_CONFIG.powerConsumptionWatts || 250);
    const hourlyElectricityCost = Math.round(
      (activeWatts / 1000) * (DEFAULT_PRICING_CONFIG.electricityRatePerKwh || 9.5) * 10
    ) / 10;

    // Today's Pulse
    const todaysRevenue = todaysInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const todaysJobsCompleted = todaysJobs.filter((j) => j.status === 'COMPLETED').length;
    const todaysWasteG = todaysJobs.reduce((sum, j) => sum + (j.wasteFilamentG || 0), 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      fleetStatus,
      activeWatts,
      hourlyElectricityCost,
      todaysPulse: {
        revenue: todaysRevenue,
        jobsCompleted: todaysJobsCompleted,
        wasteG: todaysWasteG,
        activeJobsCount: activeJobs.length,
      },
      printers: printers.map((p) => {
        const activeJob = p.printJobs[0] || null;
        let progressPct = 0;
        let remainingHours = 0;

        if (activeJob && activeJob.startedAt) {
          const startTime = new Date(activeJob.startedAt).getTime();
          const nowTime = Date.now();
          const elapsedHours = (nowTime - startTime) / (1000 * 60 * 60);
          const totalEst = activeJob.estimatedTimeHours || 4;
          progressPct = Math.min(100, Math.max(5, Math.round((elapsedHours / totalEst) * 100)));
          remainingHours = Math.max(0, Math.round((totalEst - elapsedHours) * 10) / 10);
        }

        return {
          id: p.id,
          code: p.printerCode,
          name: p.name,
          model: p.model,
          location: p.location,
          nozzleSize: p.nozzleSize,
          nozzleType: p.nozzleType,
          status: p.status,
          activeJob: activeJob
            ? {
                id: activeJob.id,
                jobCode: activeJob.jobCode,
                productName: activeJob.product?.name || 'Custom Component',
                customerName: activeJob.order?.customer?.name || 'Walk-in Client',
                material: activeJob.filamentSpool?.material || 'PLA',
                color: activeJob.filamentSpool?.color || 'Black',
                progressPct,
                remainingHours,
                startedAt: activeJob.startedAt,
              }
            : null,
        };
      }),
      activeJobs,
      queuedJobs,
      lowSpools,
      urgentTasks,
      criticalCapas,
      todaysShipments,
    });
  } catch (error: any) {
    console.error('Command Center API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch command center state' },
      { status: 500 }
    );
  }
}
