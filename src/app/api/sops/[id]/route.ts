import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sop = await db.sop.findUnique({
      where: { id: params.id },
    });
    if (!sop) return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
    return NextResponse.json(sop);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SOP' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.sop.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.category && { category: body.category }),
        ...(body.purpose && { purpose: body.purpose }),
        ...(body.scope !== undefined && { scope: body.scope }),
        ...(body.procedureSteps !== undefined && { procedureSteps: body.procedureSteps }),
        ...(body.requiredTools !== undefined && { requiredTools: body.requiredTools }),
        ...(body.parameters !== undefined && { parameters: body.parameters }),
        ...(body.qualityCriteria !== undefined && { qualityCriteria: body.qualityCriteria }),
        ...(body.revision !== undefined && { revision: parseInt(body.revision) || 1 }),
        ...(body.owner !== undefined && { owner: body.owner }),
        ...(body.approvalStatus !== undefined && { approvalStatus: body.approvalStatus }),
        lastUpdated: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('SOP update error:', error);
    return NextResponse.json({ error: 'Failed to update SOP' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.sop.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SOP delete error:', error);
    return NextResponse.json({ error: 'Failed to delete SOP' }, { status: 500 });
  }
}
