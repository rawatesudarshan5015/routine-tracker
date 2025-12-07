import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import CustomActivityBlock from '@/lib/db/models/CustomActivityBlock';
import UserPlan from '@/lib/db/models/UserPlan';
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

export async function GET(_: NextRequest, { params }: any) {
  try {
    const user = await authenticateUser();
    await dbConnect();

    const { planId } = params;

    // Verify plan belongs to user
    const plan = await UserPlan.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(user.userId),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const activities = await CustomActivityBlock.find({
      planId: new Types.ObjectId(planId),
    }).sort({ order: 1 });

    return NextResponse.json(activities, { status: 200 });
  } catch (error: any) {
    console.error('Plan activities error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: any) {
  try {
    const user = await authenticateUser();
    await dbConnect();

    const { planId } = params;
    const body = await request.json();

    // Verify plan belongs to user
    const plan = await UserPlan.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(user.userId),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const {
      name,
      startTime,
      endTime,
      durationMinutes,
      category,
      description,
    } = body;

    if (!name || !startTime || !endTime || !durationMinutes || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the next order number
    const lastActivity = await CustomActivityBlock.findOne({
      planId: new Types.ObjectId(planId),
    }).sort({ order: -1 });

    const nextOrder = lastActivity ? lastActivity.order + 1 : 0;

    const activity = await CustomActivityBlock.create({
      planId: new Types.ObjectId(planId),
      name,
      startTime,
      endTime,
      durationMinutes,
      category,
      description,
      order: nextOrder,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    console.error('Plan activities error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
