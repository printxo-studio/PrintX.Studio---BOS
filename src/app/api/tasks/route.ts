import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (priority && priority !== 'ALL') where.priority = priority;

    const tasks = await db.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { customer: true } },
        printer: true,
        product: true,
        capa: true,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newTask = await db.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        priority: body.priority || 'MEDIUM',
        status: body.status || 'TODO',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        customerId: body.customerId || null,
        orderId: body.orderId || null,
        productId: body.productId || null,
        printerId: body.printerId || null,
        capaId: body.capaId || null,
        experimentId: body.experimentId || null,
      },
      include: {
        order: true,
        printer: true,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
