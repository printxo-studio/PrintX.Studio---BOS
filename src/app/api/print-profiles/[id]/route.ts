import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await db.printProfile.findUnique({
      where: { id: params.id },
      include: {
        calibration: { include: { printer: true } },
        printJobs: { take: 5, orderBy: { createdAt: 'desc' }, include: { printer: true, product: true } },
      },
    });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await db.printProfile.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slicerName && { slicerName: body.slicerName }),
        ...(body.status && { status: body.status }),
        ...(body.version && { version: body.version }),
        ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
        ...(body.printSpeed !== undefined && { printSpeed: parseInt(body.printSpeed) }),
        ...(body.nozzleTemp !== undefined && { nozzleTemp: parseInt(body.nozzleTemp) }),
        ...(body.bedTemp !== undefined && { bedTemp: parseInt(body.bedTemp) }),
        ...(body.layerHeight !== undefined && { layerHeight: parseFloat(body.layerHeight) }),
        ...(body.infillPercent !== undefined && { infillPercent: parseInt(body.infillPercent) }),
        ...(body.infillPattern && { infillPattern: body.infillPattern }),
        ...(body.wallCount !== undefined && { wallCount: parseInt(body.wallCount) }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { calibration: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Print profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.printProfile.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}
