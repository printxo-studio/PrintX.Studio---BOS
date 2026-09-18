import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await db.lead.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Check if converting to customer
    if (body.action === 'CONVERT_TO_CUSTOMER') {
      const lead = await db.lead.findUnique({ where: { id: params.id } });
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

      // Create new customer from lead data
      const count = await db.customer.count();
      const customerCode = `CUST-${String(count + 1).padStart(3, '0')}`;

      const customer = await db.customer.create({
        data: {
          customerCode,
          name: lead.name,
          company: lead.company,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          notes: `Converted from lead ${lead.leadCode}. Requirements: ${lead.requirement || 'N/A'}`,
        },
      });

      // Update lead to WON and link to customer
      const updatedLead = await db.lead.update({
        where: { id: params.id },
        data: {
          status: 'WON',
          customerId: customer.id,
        },
      });

      return NextResponse.json({ lead: updatedLead, customer });
    }

    // Normal update
    const updatedLead = await db.lead.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.requirement !== undefined && { requirement: body.requirement }),
        ...(body.budget !== undefined && { budget: parseFloat(body.budget) || null }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.lostReason !== undefined && { lostReason: body.lostReason }),
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.lead.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
