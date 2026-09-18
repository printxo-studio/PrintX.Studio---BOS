import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const material = searchParams.get('material');
    const status = searchParams.get('status');

    const where: any = {};
    if (material && material !== 'ALL') where.material = material;
    if (status && status !== 'ALL') where.status = status;

    const profiles = await db.printProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        calibration: { include: { printer: true } },
        _count: { select: { printJobs: true } },
      },
    });

    const enriched = profiles.map((p) => {
      const total = p.totalPrints;
      const success = p.successfulPrints;
      const failure = p.failedPrints;
      const successRate = total > 0 ? Math.round((success / total) * 100) : 100;
      const failureRate = total > 0 ? Math.round((failure / total) * 100) : 0;
      return {
        ...p,
        successRate,
        failureRate,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Print profiles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch print profiles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.printProfile.count();
    const matPrefix = (body.material || 'PLA').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const profileCode = body.profileCode || `PRF-${matPrefix}-${String(count + 1).padStart(3, '0')}`;

    const newProfile = await db.printProfile.create({
      data: {
        profileCode,
        name: body.name,
        printerModel: body.printerModel || 'Bambu Lab X1-Carbon',
        material: body.material || 'PLA',
        nozzleSize: parseFloat(body.nozzleSize) || 0.4,
        layerHeight: parseFloat(body.layerHeight) || 0.2,
        wallLoops: parseInt(body.wallLoops) || 3,
        topLayers: parseInt(body.topLayers) || 4,
        bottomLayers: parseInt(body.bottomLayers) || 3,
        infillPercent: parseInt(body.infillPercent) || 20,
        infillPattern: body.infillPattern || 'Gyroid',
        printSpeed: parseInt(body.printSpeed) || 150,
        nozzleTemp: parseInt(body.nozzleTemp) || 215,
        bedTemp: parseInt(body.bedTemp) || 60,
        coolingFanSpeed: parseInt(body.coolingFanSpeed) || 100,
        retractionDistance: parseFloat(body.retractionDistance) || 0.8,
        retractionSpeed: parseInt(body.retractionSpeed) || 30,
        supportType: body.supportType || 'None',
        slicerName: body.slicerName || 'OrcaSlicer',
        slicerVersion: body.slicerVersion || 'v2.0.0',
        version: body.version || '1.0',
        status: body.status || 'APPROVED',
        approvedBy: body.status === 'APPROVED' ? (body.approvedBy || 'Chief Engineer') : null,
        calibrationId: body.calibrationId || null,
        notes: body.notes || null,
      },
      include: {
        calibration: true,
      },
    });

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error('Print profile creation error:', error);
    return NextResponse.json({ error: 'Failed to create print profile' }, { status: 500 });
  }
}
