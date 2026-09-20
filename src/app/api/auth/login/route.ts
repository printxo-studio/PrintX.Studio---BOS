import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createSessionToken, COOKIE_NAME } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    const maxAgeDays = rememberMe ? 30 : 7;
    const token = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      maxAgeDays
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeDays * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
