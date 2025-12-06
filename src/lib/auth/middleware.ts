import { NextRequest, NextResponse } from 'next/server';

export async function withAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token is valid
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
        headers: {
          Cookie: `auth-token=${token}`,
        },
      });

      const { user } = await response.json();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Add user to request context
      (request as any).user = user;
      return handler(request, context);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
