import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const experiments = await db.rndExperiment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        spool: true,
        printProfile: true,
        calibration: true,
      },
    });

    return NextResponse.json(experiments);
  } catch (error) {
    console.error('R&D GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch R&D experiments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.rndExperiment.count();
    const experimentCode = body.experimentCode || `EXP-2026-${String(count + 1).padStart(4, '0')}`;

    const newExp = await db.rndExperiment.create({
      data: {
        experimentCode,
        title: body.title,
        objective: body.objective,
        hypothesis: body.hypothesis || null,
        productId: body.productId || null,
        material: body.material || 'PA-CF',
        spoolId: body.spoolId || null,
        printProfileId: body.printProfileId || null,
        calibrationId: body.calibrationId || null,
        variablesTested: body.variablesTested || null,
        controlValues: body.controlValues || null,
        testValues: body.testValues || null,
        measurements: body.measurements || null,
        resultsSummary: body.resultsSummary || null,
        failureOccurred: body.failureOccurred === true || body.failureOccurred === 'true',
        cost: parseFloat(body.cost) || 0,
        conclusion: body.conclusion || null,
        recommendedSettings: body.recommendedSettings || null,
        status: body.status || 'IDEA',
      },
      include: {
        product: true,
        spool: true,
        printProfile: true,
        calibration: true,
      },
    });

    return NextResponse.json(newExp, { status: 201 });
  } catch (error) {
    console.error('R&D experiment creation error:', error);
    return NextResponse.json({ error: 'Failed to create R&D experiment' }, { status: 500 });
  }
}
