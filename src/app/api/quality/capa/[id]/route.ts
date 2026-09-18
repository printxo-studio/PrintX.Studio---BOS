import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const capa = await db.capa.findUnique({
      where: { id: params.id },
      include: {
        complaint: { include: { customer: true, order: true } },
        qcInspection: { include: { product: true, printJob: true } },
      },
    });
    if (!capa) return NextResponse.json({ error: 'CAPA not found' }, { status: 404 });
    return NextResponse.json(capa);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CAPA' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const isClosing = body.status === 'CLOSED';

    const updated = await db.capa.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.containmentAction !== undefined && { containmentAction: body.containmentAction }),
        ...(body.rootCauseAnalysis !== undefined && { rootCauseAnalysis: body.rootCauseAnalysis }),
        ...(body.correctiveAction && { correctiveAction: body.correctiveAction }),
        ...(body.preventiveAction && { preventiveAction: body.preventiveAction }),
        ...(body.verificationMethod !== undefined && { verificationMethod: body.verificationMethod }),
        ...(body.effectivenessCheck !== undefined && { effectivenessCheck: body.effectivenessCheck }),
        ...(isClosing && { closureDate: new Date() }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        complaint: true,
        qcInspection: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('CAPA PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update CAPA' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.capa.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete CAPA' }, { status: 500 });
  }
}
