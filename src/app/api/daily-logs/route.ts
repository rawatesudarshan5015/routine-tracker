import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import DailyLog from '@/lib/db/models/DailyLog';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';

async function authenticateUser() {
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
    const user = await authenticateUser(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    const logs = await DailyLog.find({
      userId: new Types.ObjectId(user.userId),
      logDate: logDate,
    })
      .populate('activityBlockId')
      .sort({ createdAt: 1 });

    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    console.error('Daily logs error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    await dbConnect();

    const body = await request.json();
    const {
      logDate,
      activityBlockId,
      completed = false,
      actualStartTime,
      actualEndTime,
      notes,
      energyLevel,
    } = body;

    if (!logDate || !activityBlockId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const log = await DailyLog.create({
      userId: new Types.ObjectId(user.userId),
      logDate: new Date(logDate),
      activityBlockId: new Types.ObjectId(activityBlockId),
      completed,
      actualStartTime: actualStartTime ? new Date(actualStartTime) : undefined,
      actualEndTime: actualEndTime ? new Date(actualEndTime) : undefined,
      notes,
      energyLevel,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error('Daily logs error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    await dbConnect();

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const log = await DailyLog.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(user.userId),
      },
      updates,
      { new: true }
    ).populate('activityBlockId');

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(log, { status: 200 });
  } catch (error: any) {
    console.error('Daily logs error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const log = await DailyLog.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(user.userId),
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Log deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Daily logs error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
