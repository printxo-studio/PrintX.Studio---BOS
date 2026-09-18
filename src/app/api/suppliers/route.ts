import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { inventoryItems: true } },
      },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Suppliers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.supplier.count();
    const supplierCode = body.supplierCode || `SUP-${String(count + 1).padStart(3, '0')}`;

    const newSupplier = await db.supplier.create({
      data: {
        supplierCode,
        name: body.name,
        contactPerson: body.contactPerson || null,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        gstin: body.gstin || null,
        category: body.category || 'Consumables',
        rating: parseFloat(body.rating) || 5.0,
        leadTimeDays: parseInt(body.leadTimeDays) || 3,
        paymentTerms: body.paymentTerms || 'Net 30',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error('Supplier creation error:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
