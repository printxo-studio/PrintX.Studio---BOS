import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const spool = await db.filamentSpool.findUnique({
      where: { id: params.id },
      include: {
        printJobs: {
          orderBy: { createdAt: 'desc' },
          include: { product: true, printer: true },
        },
      },
    });

    if (!spool) return NextResponse.json({ error: 'Spool not found' }, { status: 404 });
    return NextResponse.json(spool);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch spool' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const current = await db.filamentSpool.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: 'Spool not found' }, { status: 404 });

    const newWeight =
      body.currentWeightG !== undefined
        ? Math.max(0, parseFloat(body.currentWeightG))
        : current.currentWeightG;

    const newStatus =
      newWeight <= 0
        ? 'EMPTY'
        : newWeight <= current.reorderLevelG
        ? 'LOW'
        : body.status || current.status;

    const costPerSpool = body.costPerSpool !== undefined ? parseFloat(body.costPerSpool) : undefined;
    const initialWeightG = body.initialWeightG !== undefined ? parseFloat(body.initialWeightG) : undefined;
    const costPerGram =
      costPerSpool !== undefined && initialWeightG && initialWeightG > 0
        ? costPerSpool / initialWeightG
        : body.costPerGram !== undefined
        ? parseFloat(body.costPerGram)
        : undefined;

    const updated = await db.filamentSpool.update({
      where: { id: params.id },
      data: {
        currentWeightG: newWeight,
        status: newStatus,
        ...(body.spoolCode && { spoolCode: body.spoolCode }),
        ...(body.brand && { brand: body.brand }),
        ...(body.material && { material: body.material }),
        ...(body.colorName && { colorName: body.colorName }),
        ...(body.colorHex && { colorHex: body.colorHex }),
        ...(initialWeightG !== undefined && { initialWeightG }),
        ...(costPerSpool !== undefined && { costPerSpool }),
        ...(costPerGram !== undefined && { costPerGram }),
        ...(body.reorderLevelG !== undefined && { reorderLevelG: parseFloat(body.reorderLevelG) }),
        ...(body.batchNumber !== undefined && { batchNumber: body.batchNumber }),
        ...(body.dryingStatus && { dryingStatus: body.dryingStatus }),
        ...(body.storageLocation !== undefined && { storageLocation: body.storageLocation }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update spool' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.filamentSpool.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete spool' }, { status: 500 });
  }
}
