import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const capas = await db.capa.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        complaint: { include: { customer: true } },
        qcInspection: { include: { product: true } },
      },
    });

    return NextResponse.json(capas);
  } catch (error) {
    console.error('CAPA GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch CAPAs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.capa.count();
    const capaCode = body.capaCode || `CAPA-2026-${String(count + 1).padStart(3, '0')}`;

    const newCapa = await db.capa.create({
      data: {
        capaCode,
        complaintId: body.complaintId || null,
        qcInspectionId: body.qcInspectionId || null,
        problemStatement: body.problemStatement,
        containmentAction: body.containmentAction || null,
        rootCauseMethod: body.rootCauseMethod || '5_WHY',
        rootCauseAnalysis: body.rootCauseAnalysis || null,
        correctiveAction: body.correctiveAction || 'Update machine parameter',
        preventiveAction: body.preventiveAction || 'Mandate inspection check in SOP',
        owner: body.owner || 'PrintXO Quality Lead',
        dueDate: body.dueDate ? new Date(body.dueDate) : new Date(Date.now() + 7 * 86400000),
        verificationMethod: body.verificationMethod || null,
        effectivenessCheck: body.effectivenessCheck || null,
        status: body.status || 'OPEN',
        notes: body.notes || null,
      },
      include: {
        complaint: true,
        qcInspection: true,
      },
    });

    return NextResponse.json(newCapa, { status: 201 });
  } catch (error) {
    console.error('CAPA creation error:', error);
    return NextResponse.json({ error: 'Failed to create CAPA' }, { status: 500 });
  }
}
