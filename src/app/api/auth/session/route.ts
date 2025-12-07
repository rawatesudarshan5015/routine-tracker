import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        user: {
          id: payload.userId,
          email: payload.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
