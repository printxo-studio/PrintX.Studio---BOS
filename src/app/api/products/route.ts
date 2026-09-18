import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: true,
        designFiles: true,
        _count: {
          select: { orderItems: true, printJobs: true, inspections: true },
        },
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.product.count();
    const sku = body.sku || `PRX-PROD-${String(count + 1).padStart(3, '0')}`;

    const sellingPrice = parseFloat(body.sellingPrice) || 0;
    const productionCost = parseFloat(body.productionCost) || 0;
    const estimatedMargin =
      sellingPrice > 0 ? Math.round(((sellingPrice - productionCost) / sellingPrice) * 1000) / 10 : 0;

    const newProduct = await db.product.create({
      data: {
        sku,
        name: body.name,
        category: body.category || 'Functional',
        productType: body.productType || 'STANDARD',
        description: body.description || null,
        status: body.status || 'ACTIVE',
        currentVersion: '1.0',

        // Manufacturing Defaults (Section 12)
        materialName: body.materialName || 'PLA',
        recommendedPrinter: body.recommendedPrinter || null,
        nozzleSize: parseFloat(body.nozzleSize) || 0.4,
        layerHeight: parseFloat(body.layerHeight) || 0.2,
        infillPercent: parseInt(body.infillPercent) || 20,
        wallCount: parseInt(body.wallCount) || 3,
        supportRequired: body.supportRequired === true,
        standardPrintTimeHours: parseFloat(body.standardPrintTimeHours) || 0,
        standardFilamentGrams: parseFloat(body.standardFilamentGrams) || 0,

        // Commercials
        sellingPrice,
        productionCost,
        estimatedMargin,

        // Auto-create Initial Version 1.0 (Section 12)
        versions: {
          create: {
            version: '1.0',
            revision: 1,
            changeLog: 'Initial standard production release',
            stlFileUrl: body.stlFileUrl || null,
            threeMfUrl: body.threeMfUrl || null,
            stepFileUrl: body.stepFileUrl || null,
            cadFileUrl: body.cadFileUrl || null,
            active: true,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
