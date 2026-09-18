import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { orderDate: 'desc' },
          include: { items: true },
        },
        quotes: {
          orderBy: { date: 'desc' },
          include: { items: true },
        },
        invoices: {
          orderBy: { invoiceDate: 'desc' },
          include: { payments: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        complaints: {
          orderBy: { date: 'desc' },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Auto-calculate customer commercial metrics (Section 8)
    const totalOrders = customer.orders.length;
    const totalRevenue = customer.invoices
      .filter((inv) => inv.status !== 'CANCELLED')
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const outstandingBalance = customer.invoices
      .filter((inv) => inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID')
      .reduce((sum, inv) => sum + inv.balanceDue, 0);

    return NextResponse.json({
      ...customer,
      metrics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        outstandingBalance,
      },
    });
  } catch (error) {
    console.error('Customer detail API error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await db.customer.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.gstin !== undefined && { gstin: body.gstin }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.pincode !== undefined && { pincode: body.pincode }),
        ...(body.customerType && { customerType: body.customerType }),
        ...(body.status && { status: body.status }),
        ...(body.rating !== undefined && { rating: parseFloat(body.rating) }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
