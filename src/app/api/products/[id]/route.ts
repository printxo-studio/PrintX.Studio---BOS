import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
        designFiles: {
          orderBy: { createdAt: 'desc' },
        },
        printJobs: {
          orderBy: { createdAt: 'desc' },
          include: { printer: true, filamentSpool: true },
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
        },
        orderItems: {
          include: { order: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Section 12: Release New Revision / Version
    if (body.action === 'NEW_VERSION') {
      const current = await db.product.findUnique({ where: { id: params.id } });
      if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

      const newVersionString = body.version || `${(parseFloat(current.currentVersion) + 0.1).toFixed(1)}`;
      const currentVersionsCount = await db.productVersion.count({ where: { productId: params.id } });

      // Create historical version record
      await db.productVersion.create({
        data: {
          productId: params.id,
          version: newVersionString,
          revision: currentVersionsCount + 1,
          changeLog: body.changeLog || 'Engineering design modification & parameter optimization',
          stlFileUrl: body.stlFileUrl || null,
          threeMfUrl: body.threeMfUrl || null,
          stepFileUrl: body.stepFileUrl || null,
          active: true,
        },
      });

      // Update product current version
      const updatedProduct = await db.product.update({
        where: { id: params.id },
        data: {
          currentVersion: newVersionString,
        },
        include: { versions: true },
      });

      return NextResponse.json(updatedProduct);
    }

    // Normal update
    const sellingPrice = body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : undefined;
    const productionCost = body.productionCost !== undefined ? parseFloat(body.productionCost) : undefined;

    const updated = await db.product.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.sku && { sku: body.sku }),
        ...(body.category && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.materialName && { materialName: body.materialName }),
        ...(body.recommendedPrinter !== undefined && { recommendedPrinter: body.recommendedPrinter }),
        ...(body.nozzleSize !== undefined && { nozzleSize: parseFloat(body.nozzleSize) }),
        ...(body.layerHeight !== undefined && { layerHeight: parseFloat(body.layerHeight) }),
        ...(body.infillPercent !== undefined && { infillPercent: parseInt(body.infillPercent) }),
        ...(body.wallCount !== undefined && { wallCount: parseInt(body.wallCount) }),
        ...(body.standardPrintTimeHours !== undefined && { standardPrintTimeHours: parseFloat(body.standardPrintTimeHours) }),
        ...(body.standardFilamentGrams !== undefined && { standardFilamentGrams: parseFloat(body.standardFilamentGrams) }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(productionCost !== undefined && { productionCost }),
        ...(body.isPublished !== undefined && { isPublished: Boolean(body.isPublished) }),
        ...(body.stockQuantity !== undefined && { stockQuantity: parseInt(body.stockQuantity) }),
        ...(body.dimensions !== undefined && { dimensions: body.dimensions }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.colorOptions !== undefined && { colorOptions: body.colorOptions }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
