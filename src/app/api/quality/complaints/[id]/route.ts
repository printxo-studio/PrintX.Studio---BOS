import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const complaint = await db.complaint.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        order: { include: { items: { include: { product: true } } } },
        product: true,
        capas: true,
      },
    });
    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    return NextResponse.json(complaint);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const isResolving = body.status === 'RESOLVED' || body.status === 'CLOSED';

    const updated = await db.complaint.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.resolution !== undefined && { resolution: body.resolution }),
        ...(isResolving && { resolutionDate: new Date() }),
        ...(body.severity && { severity: body.severity }),
        ...(body.owner && { owner: body.owner }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { customer: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Complaint PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.complaint.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
  }
}
