import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await db.lead.count();
    const leadCode = `LEAD-2026-${String(count + 1).padStart(3, '0')}`;

    const newLead = await db.lead.create({
      data: {
        leadCode,
        name: body.name,
        company: body.company || null,
        phone: body.phone || null,
        email: body.email || null,
        requirement: body.requirement || null,
        budget: body.budget ? parseFloat(body.budget) : null,
        status: body.status || 'NEW',
        source: body.source || 'WEBSITE',
        priority: body.priority || 'MEDIUM',
        notes: body.notes || null,
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
