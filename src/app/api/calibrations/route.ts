import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const printerId = searchParams.get('printerId');

    const where: any = {};
    if (type && type !== 'ALL') where.calibrationType = type;
    if (status && status !== 'ALL') where.approvalStatus = status;
    if (printerId && printerId !== 'ALL') where.printerId = printerId;

    const calibrations = await db.calibration.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        printer: true,
        _count: { select: { printJobs: true, printProfiles: true } },
      },
    });

    return NextResponse.json(calibrations);
  } catch (error) {
    console.error('Calibrations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch calibrations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.calibration.count();
    const calibrationCode = body.calibrationCode || `CAL-2026-${String(count + 1).padStart(4, '0')}`;

    const newCalibration = await db.calibration.create({
      data: {
        calibrationCode,
        printerId: body.printerId,
        material: body.material || 'PLA',
        brand: body.brand || null,
        nozzleSize: parseFloat(body.nozzleSize) || 0.4,
        calibrationType: body.calibrationType || 'FIRST_LAYER',
        parameterName: body.parameterName,
        previousValue: body.previousValue || null,
        testValue: body.testValue || null,
        measuredValue: body.measuredValue || null,
        recommendedValue: body.recommendedValue,
        tolerance: body.tolerance || '±0.05mm',
        result: body.result || 'PASSED',
        operator: body.operator || 'PrintXO Engineer',
        approvalStatus: body.approvalStatus || 'APPROVED',
        approvedBy: body.approvalStatus === 'APPROVED' ? (body.approvedBy || 'Lead Engineer') : null,
        nextCalibrationDue: body.nextCalibrationDue ? new Date(body.nextCalibrationDue) : null,
        notes: body.notes || null,
      },
      include: {
        printer: true,
      },
    });

    return NextResponse.json(newCalibration, { status: 201 });
  } catch (error) {
    console.error('Calibration creation error:', error);
    return NextResponse.json({ error: 'Failed to create calibration' }, { status: 500 });
  }
}
