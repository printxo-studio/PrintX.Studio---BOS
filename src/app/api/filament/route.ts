import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const spools = await db.filamentSpool.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { printJobs: true } },
      },
    });

    const enriched = spools.map((s) => ({
      ...s,
      remainingPercent: Math.max(0, Math.min(100, Math.round((s.currentWeightG / s.initialWeightG) * 100))),
      calculatedCostPerGram: s.spoolCost > 0 ? (s.spoolCost / s.initialWeightG).toFixed(2) : '1.80',
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Filament GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch spools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.filamentSpool.count();
    const materialCode = (body.material || 'PLA').substring(0, 4).toUpperCase();
    const spoolCode = body.spoolCode || `SPL-${materialCode}-${String(count + 1).padStart(3, '0')}`;

    const initialWeightG = parseFloat(body.initialWeightG) || 1000;
    const spoolCost = parseFloat(body.spoolCost) || 1800;
    const costPerGram = Math.round((spoolCost / initialWeightG) * 100) / 100;

    const newSpool = await db.filamentSpool.create({
      data: {
        spoolCode,
        brand: body.brand || 'Polymaker',
        material: body.material || 'PLA',
        series: body.series || null,
        color: body.color || 'Black',
        colorHex: body.colorHex || '#18181b',
        diameter: parseFloat(body.diameter) || 1.75,
        initialWeightG,
        currentWeightG: initialWeightG,
        usedWeightG: 0,
        wasteWeightG: 0,
        spoolCost,
        costPerGram,
        supplier: body.supplier || null,
        batchLotNumber: body.batchLotNumber || null,
        storageLocation: body.storageLocation || 'Drybox Rack A1',
        dryingStatus: body.dryingStatus || 'DRIED',
        status: 'IN_STOCK',
        reorderLevelG: parseFloat(body.reorderLevelG) || 200,
      },
    });

    return NextResponse.json(newSpool, { status: 201 });
  } catch (error) {
    console.error('Spool creation error:', error);
    return NextResponse.json({ error: 'Failed to create spool' }, { status: 500 });
  }
}
