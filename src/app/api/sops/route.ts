import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;

    const sops = await db.sop.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sops);
  } catch (error) {
    console.error('SOPs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch SOPs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.sop.count();
    const catPrefix = (body.category || 'GEN').substring(0, 3).toUpperCase();
    const sopCode = body.sopCode || `SOP-${catPrefix}-${String(count + 1).padStart(3, '0')}`;

    const newSop = await db.sop.create({
      data: {
        sopCode,
        title: body.title,
        category: body.category || 'PRINTING',
        purpose: body.purpose,
        scope: body.scope || 'All workshop technicians and print farm operators.',
        procedureSteps: body.procedureSteps,
        requiredTools: body.requiredTools || null,
        parameters: body.parameters || null,
        qualityCriteria: body.qualityCriteria || null,
        revision: parseInt(body.revision) || 1,
        owner: body.owner || 'PrintXO Lead Engineer',
        approvalStatus: body.approvalStatus || 'APPROVED',
        approvedBy: body.approvalStatus === 'APPROVED' ? (body.approvedBy || 'Studio Owner') : null,
      },
    });

    return NextResponse.json(newSop, { status: 201 });
  } catch (error) {
    console.error('SOP creation error:', error);
    return NextResponse.json({ error: 'Failed to create SOP' }, { status: 500 });
  }
}
