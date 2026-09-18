import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const items = await db.inventoryItem.findMany({
      where,
      orderBy: [{ status: 'asc' }, { itemName: 'asc' }],
      include: {
        supplier: true,
      },
    });

    // Compute dynamic status based on quantity vs reorderLevel if not set
    const enriched = items.map((item) => {
      let computedStatus = item.status;
      if (item.quantity <= 0) {
        computedStatus = 'OUT_OF_STOCK';
      } else if (item.quantity <= item.reorderLevel * 0.5) {
        computedStatus = 'CRITICAL';
      } else if (item.quantity <= item.reorderLevel) {
        computedStatus = 'LOW_STOCK';
      } else {
        computedStatus = 'IN_STOCK';
      }
      return {
        ...item,
        status: computedStatus,
        totalValue: Math.round(item.quantity * item.unitCost * 100) / 100,
      };
    });

    const finalItems = lowStockOnly
      ? enriched.filter((i) => i.status !== 'IN_STOCK')
      : enriched;

    // Aggregates for inventory summary
    const totalItems = enriched.length;
    const totalValue = enriched.reduce((sum, i) => sum + i.totalValue, 0);
    const lowStockCount = enriched.filter((i) => i.status === 'LOW_STOCK' || i.status === 'CRITICAL').length;
    const outOfStockCount = enriched.filter((i) => i.status === 'OUT_OF_STOCK').length;

    return NextResponse.json({
      items: finalItems,
      summary: {
        totalItems,
        totalValue,
        lowStockCount,
        outOfStockCount,
      },
    });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.inventoryItem.count();
    const categoryPrefix = (body.category || 'ITEM').substring(0, 3).toUpperCase();
    const sku = body.sku || `INV-${categoryPrefix}-${String(count + 1).padStart(3, '0')}`;

    const quantity = parseFloat(body.quantity) || 0;
    const unitCost = parseFloat(body.unitCost) || 0;
    const reorderLevel = parseFloat(body.reorderLevel) || 5;

    let status = 'IN_STOCK';
    if (quantity <= 0) status = 'OUT_OF_STOCK';
    else if (quantity <= reorderLevel * 0.5) status = 'CRITICAL';
    else if (quantity <= reorderLevel) status = 'LOW_STOCK';

    const newItem = await db.inventoryItem.create({
      data: {
        sku,
        itemName: body.itemName,
        category: body.category || 'CONSUMABLES',
        quantity,
        unit: body.unit || 'PCS',
        unitCost,
        totalValue: quantity * unitCost,
        reorderLevel,
        storageLocation: body.storageLocation || 'Main Workshop Shelf',
        supplierId: body.supplierId || null,
        status,
        notes: body.notes || null,
      },
      include: {
        supplier: true,
      },
    });

    // Create low stock notification if added below threshold
    if (status !== 'IN_STOCK') {
      await db.notification.create({
        data: {
          type: 'LOW_STOCK',
          title: `Low Workshop Inventory: ${newItem.itemName}`,
          message: `Stock level for ${newItem.itemName} is ${newItem.quantity} ${newItem.unit} (Reorder level: ${newItem.reorderLevel}).`,
          entityType: 'InventoryItem',
          entityId: newItem.id,
        },
      });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
