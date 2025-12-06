import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import UserPlan from '@/lib/db/models/UserPlan';
import ActivityBlock from '@/lib/db/models/ActivityBlock';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { DEFAULT_PLANS } from '@/lib/db/seeds/defaultPlans';

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

// Get all default plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'default-plans') {
      // Return default plans without authentication
      return NextResponse.json(DEFAULT_PLANS, { status: 200 });
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Default plans error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

// Copy a default plan for the user
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    await dbConnect();

    const body = await request.json();
    const { planName } = body;

    if (!planName) {
      return NextResponse.json(
        { error: 'planName is required' },
        { status: 400 }
      );
    }

    // Find the default plan
    const defaultPlan = DEFAULT_PLANS.find((p) => p.name === planName);

    if (!defaultPlan) {
      return NextResponse.json(
        { error: 'Default plan not found' },
        { status: 404 }
      );
    }

    // Create user plan
    const userPlan = await UserPlan.create({
      userId: new Types.ObjectId(user.userId),
      name: defaultPlan.name,
      description: defaultPlan.description,
      dayType: defaultPlan.dayType,
    });

    // Create activity blocks for this plan
    const activities = defaultPlan.activities.map((activity, index) => ({
      planId: userPlan._id,
      name: activity.name,
      startTime: activity.startTime,
      endTime: activity.endTime,
      durationMinutes: calculateDuration(activity.startTime, activity.endTime),
      category: activity.category,
      dayType: defaultPlan.dayType,
      description: activity.description,
      order: index,
    }));

    await ActivityBlock.insertMany(activities);

    return NextResponse.json(
      {
        plan: userPlan,
        activities: activities,
        message: 'Default plan copied successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Default plans copy error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}
