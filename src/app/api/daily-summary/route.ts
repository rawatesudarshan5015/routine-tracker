import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import DailySummary from '@/lib/db/models/DailySummary';
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = { userId: new Types.ObjectId(user.userId) };

    if (date) {
      const logDate = new Date(date);
      logDate.setHours(0, 0, 0, 0);
      query.logDate = logDate;
    } else if (startDate && endDate) {
      query.logDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const summaries = await DailySummary.find(query).sort({ logDate: -1 });

    return NextResponse.json(summaries, { status: 200 });
  } catch (error: any) {
    console.error('Daily summary error:', error);
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
      dsaProblems = 0,
      projectHours = 0,
      commitsPushed = 0,
      systemDesignTopic,
      applicationsSent = 0,
      mockInterviews = 0,
      energyRating,
      blocker,
      top3Priorities = [],
    } = body;

    if (!logDate) {
      return NextResponse.json(
        { error: 'Log date is required' },
        { status: 400 }
      );
    }

    // Check if summary already exists for this date
    const existing = await DailySummary.findOne({
      userId: new Types.ObjectId(user.userId),
      logDate: new Date(logDate),
    });

    if (existing) {
      // Update existing
      const updated = await DailySummary.findByIdAndUpdate(
        existing._id,
        {
          dsaProblems,
          projectHours,
          commitsPushed,
          systemDesignTopic,
          applicationsSent,
          mockInterviews,
          energyRating,
          blocker,
          top3Priorities,
          updatedAt: new Date(),
        },
        { new: true }
      );
      return NextResponse.json(updated, { status: 200 });
    }

    // Create new
    const summary = await DailySummary.create({
      userId: new Types.ObjectId(user.userId),
      logDate: new Date(logDate),
      dsaProblems,
      projectHours,
      commitsPushed,
      systemDesignTopic,
      applicationsSent,
      mockInterviews,
      energyRating,
      blocker,
      top3Priorities,
    });

    return NextResponse.json(summary, { status: 201 });
  } catch (error: any) {
    console.error('Daily summary error:', error);
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
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }

    const summary = await DailySummary.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(user.userId),
      },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(summary, { status: 200 });
  } catch (error: any) {
    console.error('Daily summary error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
