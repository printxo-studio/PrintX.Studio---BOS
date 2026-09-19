import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cal = await db.calibration.findUnique({
      where: { id: params.id },
      include: {
        printer: true,
        printProfiles: true,
        printJobs: { take: 5, orderBy: { createdAt: 'desc' }, include: { product: true } },
      },
    });
    if (!cal) return NextResponse.json({ error: 'Calibration not found' }, { status: 404 });
    return NextResponse.json(cal);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calibration' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await db.calibration.update({
      where: { id: params.id },
      data: {
        ...(body.calibrationType && { calibrationType: body.calibrationType }),
        ...(body.filamentMaterial && { filamentMaterial: body.filamentMaterial }),
        ...(body.recommendedValue && { recommendedValue: body.recommendedValue }),
        ...(body.measuredValue !== undefined && { measuredValue: body.measuredValue }),
        ...(body.result && { result: body.result }),
        ...(body.approvalStatus && { approvalStatus: body.approvalStatus }),
        ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.nextCalibrationDue !== undefined && {
          nextCalibrationDue: body.nextCalibrationDue ? new Date(body.nextCalibrationDue) : null,
        }),
      },
      include: { printer: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Calibration PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update calibration' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.calibration.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete calibration' }, { status: 500 });
  }
}
