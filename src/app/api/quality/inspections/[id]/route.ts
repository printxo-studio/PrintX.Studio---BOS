import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const inspection = await db.qualityInspection.findUnique({
      where: { id: params.id },
      include: {
        order: { include: { customer: true } },
        product: true,
        printJob: { include: { printer: true, filamentSpool: true } },
        defects: true,
        capas: true,
      },
    });
    if (!inspection) return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inspection' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await db.qualityInspection.update({
      where: { id: params.id },
      data: {
        ...(body.result && { result: body.result }),
        ...(body.defectType !== undefined && { defectType: body.defectType }),
        ...(body.severity && { severity: body.severity }),
        ...(body.reworkRequired !== undefined && { reworkRequired: Boolean(body.reworkRequired) }),
        ...(body.reprintRequired !== undefined && { reprintRequired: Boolean(body.reprintRequired) }),
        ...(body.rootCause !== undefined && { rootCause: body.rootCause }),
        ...(body.correctiveAction !== undefined && { correctiveAction: body.correctiveAction }),
        ...(body.preventiveAction !== undefined && { preventiveAction: body.preventiveAction }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Inspection PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.qualityInspection.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inspection' }, { status: 500 });
  }
}
