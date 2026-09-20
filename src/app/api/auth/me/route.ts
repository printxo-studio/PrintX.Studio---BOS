import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/session';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
  });
}
