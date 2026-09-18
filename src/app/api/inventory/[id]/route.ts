import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await db.inventoryItem.findUnique({
      where: { id: params.id },
      include: { supplier: true },
    });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const current = await db.inventoryItem.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    let newQuantity = current.quantity;

    if (body.action === 'ADJUST') {
      // Delta adjustment: positive to add, negative to consume
      const delta = parseFloat(body.delta) || 0;
      newQuantity = Math.max(0, current.quantity + delta);
    } else if (body.quantity !== undefined) {
      newQuantity = Math.max(0, parseFloat(body.quantity));
    }

    const reorderLevel = body.reorderLevel !== undefined ? parseFloat(body.reorderLevel) : current.reorderLevel;
    const unitCost = body.unitCost !== undefined ? parseFloat(body.unitCost) : current.unitCost;

    let computedStatus = 'IN_STOCK';
    if (newQuantity <= 0) computedStatus = 'OUT_OF_STOCK';
    else if (newQuantity <= reorderLevel * 0.5) computedStatus = 'CRITICAL';
    else if (newQuantity <= reorderLevel) computedStatus = 'LOW_STOCK';

    const updated = await db.inventoryItem.update({
      where: { id: params.id },
      data: {
        quantity: newQuantity,
        totalValue: Math.round(newQuantity * unitCost * 100) / 100,
        status: computedStatus,
        ...(body.itemName && { itemName: body.itemName }),
        ...(body.category && { category: body.category }),
        ...(body.unit && { unit: body.unit }),
        ...(body.unitCost !== undefined && { unitCost }),
        ...(body.reorderLevel !== undefined && { reorderLevel }),
        ...(body.storageLocation !== undefined && { storageLocation: body.storageLocation }),
        ...(body.supplierId !== undefined && { supplierId: body.supplierId || null }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: { supplier: true },
    });

    // Alert notification if stock fell to low or critical
    if ((computedStatus === 'LOW_STOCK' || computedStatus === 'CRITICAL' || computedStatus === 'OUT_OF_STOCK') && current.status === 'IN_STOCK') {
      await db.notification.create({
        data: {
          type: 'LOW_STOCK',
          title: `Low Stock: ${updated.itemName}`,
          message: `${updated.itemName} reached ${updated.quantity} ${updated.unit}. Reorder threshold is ${updated.reorderLevel}.`,
          entityType: 'InventoryItem',
          entityId: updated.id,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Inventory PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.inventoryItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
