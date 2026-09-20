import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, listing: product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(body.sellingPrice) || 0;
    if (body.productionCost !== undefined) updateData.productionCost = parseFloat(body.productionCost) || 0;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(body.stockQuantity, 10);
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.materialName !== undefined) updateData.materialName = body.materialName;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    if (body.images !== undefined) {
      let parsed = body.images;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = [{ url: parsed, altText: body.name || 'Listing' }];
        }
      }
      updateData.images = parsed;
    }

    if (body.colorOptions !== undefined) {
      let colors = body.colorOptions;
      if (typeof colors === 'string') {
        try {
          colors = JSON.parse(colors);
        } catch {
          colors = colors.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      updateData.colorOptions = colors;
    }

    // Recalculate margin if sellingPrice or productionCost updated
    if (updateData.sellingPrice !== undefined || updateData.productionCost !== undefined) {
      const current = await db.product.findUnique({ where: { id: params.id } });
      if (current) {
        const sp = updateData.sellingPrice ?? current.sellingPrice ?? 0;
        const pc = updateData.productionCost ?? current.productionCost ?? 0;
        updateData.estimatedMargin =
          sp > 0 ? Math.round((((sp - pc) / sp) * 100) * 10) / 10 : 0;
      }
    }

    const updated = await db.product.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if product is tied to orders
    const count = await db.orderItem.count({ where: { productId: params.id } });
    if (count > 0) {
      // Soft unpublish if order history exists
      await db.product.update({
        where: { id: params.id },
        data: { isPublished: false, status: 'ARCHIVED' },
      });
      return NextResponse.json({
        success: true,
        message: 'Listing unlinked from storefront and archived (orders exist for this product).',
      });
    }

    await db.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Listing permanently deleted' });
  } catch (error: any) {
    console.error('Delete listing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete listing' }, { status: 500 });
  }
}
