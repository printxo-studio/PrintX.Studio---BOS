import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exp = await db.rndExperiment.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        spool: true,
        printProfile: true,
        calibration: true,
      },
    });
    if (!exp) return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
    return NextResponse.json(exp);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await db.rndExperiment.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.status && { status: body.status }),
        ...(body.conclusion !== undefined && { conclusion: body.conclusion }),
        ...(body.resultsSummary !== undefined && { resultsSummary: body.resultsSummary }),
        ...(body.measurements !== undefined && { measurements: body.measurements }),
        ...(body.recommendedSettings !== undefined && { recommendedSettings: body.recommendedSettings }),
        ...(body.cost !== undefined && { cost: parseFloat(body.cost) }),
        ...(body.failureOccurred !== undefined && { failureOccurred: Boolean(body.failureOccurred) }),
      },
      include: {
        product: true,
        spool: true,
        printProfile: true,
        calibration: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('R&D PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update experiment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.rndExperiment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete experiment' }, { status: 500 });
  }
}
