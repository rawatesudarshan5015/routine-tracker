import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { hashPassword, comparePasswords } from '@/lib/auth/password';
import { createToken, setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password, isSignUp } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (isSignUp) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        email,
        password: hashedPassword,
      });

      return NextResponse.json(
        { message: 'Account created successfully. Please sign in.' },
        { status: 201 }
      );
    } else {
      // Sign in
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Create JWT token
      const token = createToken({
        userId: user._id.toString(),
        email: user.email,
      });

      // Set auth cookie
      const response = NextResponse.json(
        {
          message: 'Signed in successfully',
          user: {
            id: user._id,
            email: user.email,
          },
        },
        { status: 200 }
      );

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
