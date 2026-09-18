import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (body.id) {
      await db.notification.update({
        where: { id: body.id },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({
        data: { isRead: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
