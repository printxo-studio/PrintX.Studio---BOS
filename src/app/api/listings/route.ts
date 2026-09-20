import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          select: { id: true, version: true, active: true, stlFileUrl: true },
        },
      },
    });

    const listings = products.map((p) => {
      let imagesList: any[] = [];
      if (Array.isArray(p.images)) {
        imagesList = p.images;
      } else if (p.imageUrl) {
        imagesList = [{ url: p.imageUrl, altText: p.name }];
      }

      let colorList: string[] = [];
      if (Array.isArray(p.colorOptions)) {
        colorList = p.colorOptions as string[];
      } else if (typeof p.colorOptions === 'string') {
        try {
          colorList = JSON.parse(p.colorOptions);
        } catch {
          colorList = [p.colorOptions];
        }
      }

      const generatedSlug =
        p.slug ||
        p.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const margin =
        p.sellingPrice && p.sellingPrice > 0
          ? Math.round((((p.sellingPrice - (p.productionCost || 0)) / p.sellingPrice) * 100) * 10) / 10
          : 0;

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        slug: generatedSlug,
        category: p.category || 'General',
        productType: p.productType || 'STANDARD',
        description: p.description || '',
        sellingPrice: p.sellingPrice || 0,
        productionCost: p.productionCost || 0,
        estimatedMargin: margin,
        stockQuantity: p.stockQuantity ?? 50,
        isPublished: p.isPublished !== false,
        status: p.status || 'ACTIVE',
        dimensions: p.dimensions || '120 x 85 x 65 mm',
        materialName: p.materialName || 'PLA+',
        colorOptions: colorList.length > 0 ? colorList : ['Matte Black', 'Studio Crimson', 'Signal White'],
        imageUrl: p.imageUrl || imagesList[0]?.url || '/logo-icon.svg',
        images: imagesList,
        standardPrintTimeHours: p.standardPrintTimeHours || 4,
        standardFilamentGrams: p.standardFilamentGrams || 150,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ success: true, count: listings.length, listings });
  } catch (error: any) {
    console.error('Listings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Listing name is required' }, { status: 400 });
    }

    const count = await db.product.count();
    const sku =
      body.sku?.trim() ||
      `PRX-LIST-${String(count + 1).padStart(3, '0')}`;

    const slug =
      body.slug?.trim() ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const sellingPrice = parseFloat(body.sellingPrice) || 999;
    const compareAtPrice = body.compareAtPrice ? parseFloat(body.compareAtPrice) : null;
    const productionCost = parseFloat(body.productionCost) || 250;
    const estimatedMargin =
      sellingPrice > 0
        ? Math.round((((sellingPrice - productionCost) / sellingPrice) * 100) * 10) / 10
        : 0;

    let parsedImages = body.images;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch {
        parsedImages = [{ url: parsedImages, altText: body.name }];
      }
    }
    if (!Array.isArray(parsedImages)) {
      parsedImages = body.imageUrl ? [{ url: body.imageUrl, altText: body.name }] : [];
    }

    let parsedColors = body.colorOptions;
    if (typeof parsedColors === 'string') {
      try {
        parsedColors = JSON.parse(parsedColors);
      } catch {
        parsedColors = parsedColors.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(parsedColors)) {
      parsedColors = ['Matte Black', 'Studio Crimson', 'Signal White'];
    }

    const newListing = await db.product.create({
      data: {
        sku,
        name: body.name.trim(),
        slug,
        category: body.category || 'Functional & Engineering',
        productType: body.productType || 'STANDARD',
        description: body.description || '',
        sellingPrice,
        productionCost,
        estimatedMargin,
        stockQuantity: parseInt(body.stockQuantity, 10) || 50,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
        status: body.status || 'ACTIVE',
        dimensions: body.dimensions || '120 x 85 x 65 mm',
        materialName: body.materialName || 'PLA+',
        colorOptions: parsedColors,
        imageUrl: body.imageUrl || parsedImages[0]?.url || null,
        images: parsedImages,
        standardPrintTimeHours: parseFloat(body.standardPrintTimeHours) || 4,
        standardFilamentGrams: parseFloat(body.standardFilamentGrams) || 120,
      },
    });

    return NextResponse.json({ success: true, listing: newListing });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create listing' }, { status: 500 });
  }
}
