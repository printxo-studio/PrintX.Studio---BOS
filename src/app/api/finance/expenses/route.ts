import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const expenses = await db.expense.findMany({
      orderBy: { expenseDate: 'desc' },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await db.expense.count();
    const expenseCode = `EXP-2026-${String(count + 1).padStart(3, '0')}`;

    const newExpense = await db.expense.create({
      data: {
        expenseCode,
        category: body.category || 'OTHER',
        amount: parseFloat(body.amount),
        description: body.description,
        supplierName: body.supplierName || null,
        paymentMethod: body.paymentMethod || 'UPI',
        referenceNumber: body.referenceNumber || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
