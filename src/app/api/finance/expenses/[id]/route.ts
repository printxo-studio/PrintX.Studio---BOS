import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await db.expense.findUnique({
      where: { id: params.id },
    });
    if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.expense.update({
      where: { id: params.id },
      data: {
        ...(body.category && { category: body.category }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) || 0 }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.supplierName !== undefined && { supplierName: body.supplierName }),
        ...(body.paymentMethod !== undefined && { paymentMethod: body.paymentMethod }),
        ...(body.referenceNumber !== undefined && { referenceNumber: body.referenceNumber }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Expense update error:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Expense delete error:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
