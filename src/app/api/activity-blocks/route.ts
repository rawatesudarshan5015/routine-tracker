import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import ActivityBlock from '@/lib/db/models/ActivityBlock';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

async function authenticateUser(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Unauthorized');
  }

  return payload;
}

export async function GET(request: NextRequest) {
  try {
    await authenticateUser(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const dayType = searchParams.get('dayType');
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: 'planId parameter is required' },
        { status: 400 }
      );
    }

    // Build query based on parameters
    const query: any = { planId };
    
    // Only add dayType filter if it's provided
    if (dayType) {
      query.dayType = dayType;
    }

    const blocks = await ActivityBlock.find(query).sort({ startTime: 1 });

    return NextResponse.json(blocks, { status: 200 });
  } catch (error: any) {
    console.error('Activity blocks error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticateUser(request);
    await dbConnect();

    const body = await request.json();
    const {
      planId,
      name,
      startTime,
      endTime,
      durationMinutes,
      category,
      dayType = 'weekday',
      description,
    } = body;

    if (!planId || !name || !startTime || !endTime || !durationMinutes || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const block = await ActivityBlock.create({
      planId,
      name,
      startTime,
      endTime,
      durationMinutes,
      category,
      dayType,
      description,
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error: any) {
    console.error('Activity blocks error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
