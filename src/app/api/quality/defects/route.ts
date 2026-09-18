import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFECT_CATALOG } from '@/lib/constants';

export async function GET() {
  try {
    const defects = await db.defect.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inspection: {
          include: {
            printJob: { include: { printer: true, product: true } },
            product: true,
          },
        },
      },
    });

    // Also get all failed inspections with defectType
    const failedInspections = await db.qualityInspection.findMany({
      where: { result: 'FAILED', defectType: { not: null } },
      include: { product: true, printJob: { include: { printer: true } } },
    });

    // Calculate Pareto breakdown
    const typeMap: Record<string, { count: number; totalCost: number; severity: Record<string, number> }> = {};

    DEFECT_CATALOG.forEach((d) => {
      typeMap[d.id] = { count: 0, totalCost: 0, severity: { MINOR: 0, MAJOR: 0, CRITICAL: 0 } };
    });

    failedInspections.forEach((fi) => {
      const type = fi.defectType || 'OTHER';
      if (!typeMap[type]) {
        typeMap[type] = { count: 0, totalCost: 0, severity: { MINOR: 0, MAJOR: 0, CRITICAL: 0 } };
      }
      typeMap[type].count += 1;
      typeMap[type].totalCost += 450; // default estimated rework/reprint cost
      const sev = fi.severity || 'MAJOR';
      typeMap[type].severity[sev] = (typeMap[type].severity[sev] || 0) + 1;
    });

    defects.forEach((d) => {
      if (!typeMap[d.defectType]) {
        typeMap[d.defectType] = { count: 0, totalCost: 0, severity: { MINOR: 0, MAJOR: 0, CRITICAL: 0 } };
      }
      typeMap[d.defectType].totalCost += d.costImpact;
    });

    const totalDefects = Object.values(typeMap).reduce((acc, curr) => acc + curr.count, 0);

    const paretoData = Object.entries(typeMap)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => {
        const catalogEntry = DEFECT_CATALOG.find((c) => c.id === type);
        const name = catalogEntry ? catalogEntry.name : type;
        return {
          type,
          name,
          count: data.count,
          totalCost: data.totalCost,
          percentage: totalDefects > 0 ? Math.round((data.count / totalDefects) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      defects,
      paretoData,
      totalDefects,
      totalScrapCost: paretoData.reduce((sum, p) => sum + p.totalCost, 0),
    });
  } catch (error) {
    console.error('Defects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch defect analytics' }, { status: 500 });
  }
}
