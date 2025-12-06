import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import UserPlan from '@/lib/db/models/UserPlan';
import CustomActivityBlock from '@/lib/db/models/CustomActivityBlock';
import ActivityBlock from '@/lib/db/models/ActivityBlock';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { Types } from 'mongoose';

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
    const user = await authenticateUser(request);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const dayType = searchParams.get('dayType');

    let query: any = { userId: new Types.ObjectId(user.userId) };
    if (dayType) {
      query.dayType = dayType;
    }

    const plans = await UserPlan.find(query).sort({ createdAt: -1 });

    return NextResponse.json(plans, { status: 200 });
  } catch (error: any) {
    console.error('Plans error:', error);
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
    const { name, description, dayType = 'weekday', activities = [] } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    const plan = await UserPlan.create({
      userId: new Types.ObjectId(user.userId),
      name,
      description,
      dayType,
    });

    // Create custom activity blocks if provided
    if (activities.length > 0) {
      const activityBlocks = activities.map((activity: any, index: number) => ({
        planId: plan._id,
        ...activity,
        order: index,
      }));

      await CustomActivityBlock.insertMany(activityBlocks);
    }

    const populatedPlan = await UserPlan.findById(plan._id);

    return NextResponse.json(populatedPlan, { status: 201 });
  } catch (error: any) {
    console.error('Plans error:', error);
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
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const plan = await UserPlan.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(user.userId),
      },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plan, { status: 200 });
  } catch (error: any) {
    console.error('Plans error:', error);
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
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Delete all activity blocks for this plan
    await ActivityBlock.deleteMany({
      planId: new Types.ObjectId(id),
    });

    // Delete all custom activity blocks for this plan
    await CustomActivityBlock.deleteMany({
      planId: new Types.ObjectId(id),
    });

    // Delete the plan
    const plan = await UserPlan.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(user.userId),
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Plan deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Plans error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
