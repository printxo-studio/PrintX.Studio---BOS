import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true, quotes: true, complaints: true },
        },
      },
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await db.customer.count();
    const customerCode = `CUST-${String(count + 1).padStart(3, '0')}`;

    const newCustomer = await db.customer.create({
      data: {
        customerCode,
        name: body.name,
        company: body.company || null,
        phone: body.phone || null,
        email: body.email || null,
        gstin: body.gstin || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || 'Karnataka',
        pincode: body.pincode || null,
        customerType: body.customerType || 'B2B',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
