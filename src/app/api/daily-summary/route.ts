import { NextRequest, NextResponse } from 'next/server';
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
    const user = await authenticateUser();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: any = { userId: new Types.ObjectId(user.userId) };

    if (date) {
      // Parse date and get start and end of day
      const logDate = new Date(date);
      logDate.setUTCHours(0, 0, 0, 0);
      const nextDay = new Date(logDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      
      query.logDate = {
        $gte: logDate,
        $lt: nextDay,
      };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
      
      query.logDate = {
        $gte: start,
        $lte: end,
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
    const user = await authenticateUser();
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

    // Parse date properly - handle both formats (YYYY-MM-DD string and ISO string)
    const dateObj = new Date(logDate);
    dateObj.setUTCHours(0, 0, 0, 0);

    // Check if summary already exists for this date
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await DailySummary.findOne({
      userId: new Types.ObjectId(user.userId),
      logDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
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
      logDate: dateObj,
      dsaProblems,
      projectHours,
      commitsPushed,
      systemDesignTopic,
      applicationsSent,
      mockInterviews,
      energyRating,
      blocker,
      top3Priorities: top3Priorities.filter((p: string) => p.trim()),
    });

    console.log('Daily summary created:', summary);
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
    const user = await authenticateUser();
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
