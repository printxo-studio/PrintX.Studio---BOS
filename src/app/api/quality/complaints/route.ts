import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const complaints = await db.complaint.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        customer: true,
        order: true,
        product: true,
        capas: true,
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Complaints GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer complaints' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await db.complaint.count();
    const complaintCode = body.complaintCode || `CMP-2026-${String(count + 1).padStart(3, '0')}`;

    const newComplaint = await db.complaint.create({
      data: {
        complaintCode,
        customerId: body.customerId,
        orderId: body.orderId || null,
        productId: body.productId || null,
        issueTitle: body.issueTitle,
        severity: body.severity || 'MEDIUM',
        description: body.description,
        evidenceUrl: body.evidenceUrl || null,
        status: body.status || 'OPEN',
        owner: body.owner || 'PrintXO Customer Success Lead',
        notes: body.notes || null,
      },
      include: {
        customer: true,
        order: true,
      },
    });

    // Create high-priority notification
    await db.notification.create({
      data: {
        type: 'CUSTOMER_COMPLAINT',
        title: `Customer Complaint: ${newComplaint.complaintCode}`,
        message: `${newComplaint.customer.name} reported: ${newComplaint.issueTitle} (${newComplaint.severity} severity).`,
        entityType: 'Complaint',
        entityId: newComplaint.id,
      },
    });

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error) {
    console.error('Complaint creation error:', error);
    return NextResponse.json({ error: 'Failed to log customer complaint' }, { status: 500 });
  }
}
