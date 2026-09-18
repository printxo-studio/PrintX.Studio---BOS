import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const result = searchParams.get('result');

    const where: any = {};
    if (stage && stage !== 'ALL') where.inspectionStage = stage;
    if (result && result !== 'ALL') where.result = result;

    const inspections = await db.qualityInspection.findMany({
      where,
      orderBy: { inspectionDate: 'desc' },
      include: {
        order: { include: { customer: true } },
        product: true,
        printJob: { include: { printer: true } },
        capas: true,
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Quality inspections GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.qualityInspection.count();
    const qcCode = body.qcCode || `QC-2026-${String(count + 1).padStart(4, '0')}`;

    const newInspection = await db.qualityInspection.create({
      data: {
        qcCode,
        orderId: body.orderId || null,
        productId: body.productId || null,
        printJobId: body.printJobId || null,
        inspector: body.inspector || 'PrintXO Quality Inspector',
        inspectionStage: body.inspectionStage || 'FINAL',
        specification: body.specification || 'Dimensional Accuracy & Interlayer Bonding',
        requiredValue: body.requiredValue || null,
        actualValue: body.actualValue || null,
        tolerance: body.tolerance || '±0.1mm',
        result: body.result || 'PASSED',
        severity: body.severity || (body.result === 'PASSED' ? 'MINOR' : 'MAJOR'),
        defectType: body.result === 'FAILED' ? (body.defectType || 'DIMENSIONAL') : null,
        rootCause: body.rootCause || null,
        correctiveAction: body.correctiveAction || null,
        preventiveAction: body.preventiveAction || null,
        reworkRequired: Boolean(body.reworkRequired),
        reprintRequired: Boolean(body.reprintRequired),
        notes: body.notes || null,
      },
      include: {
        order: true,
        product: true,
        printJob: true,
      },
    });

    // If print job is linked and QC failed, update job qcStatus
    if (body.printJobId) {
      await db.printJob.update({
        where: { id: body.printJobId },
        data: { qcStatus: body.result },
      });
    }

    // Auto-create Defect record if failed
    if (body.result === 'FAILED' && body.defectType) {
      await db.defect.create({
        data: {
          inspectionId: newInspection.id,
          defectType: body.defectType,
          description: body.rootCause || `Failed QC inspection: ${body.specification}`,
          severity: body.severity || 'MAJOR',
          costImpact: parseFloat(body.costImpact) || 450,
        },
      });
    }

    return NextResponse.json(newInspection, { status: 201 });
  } catch (error) {
    console.error('Quality inspection POST error:', error);
    return NextResponse.json({ error: 'Failed to create quality inspection' }, { status: 500 });
  }
}
