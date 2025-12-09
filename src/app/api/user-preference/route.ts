import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

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

export async function GET() {
  try {
    const user = await authenticateUser();
    await dbConnect();
    const userDoc = await User.findById(user.userId).select('selectedPlanId selectedPlanName');
    
    return NextResponse.json({
      selectedPlanId: userDoc?.selectedPlanId || null,
      selectedPlanName: userDoc?.selectedPlanName || null,
    });
  } catch (error) {
    console.error('Error fetching user preference:', error);
    return NextResponse.json({ error: 'Failed to fetch preference' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser();
    const { planId, planName } = await request.json();
    
    await dbConnect();
    
    // Update user's selected plan preference
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { 
        selectedPlanId: planId,
        selectedPlanName: planName,
      },
      { new: true }
    );

    return NextResponse.json({
      selectedPlanId: updatedUser?.selectedPlanId || null,
      selectedPlanName: updatedUser?.selectedPlanName || null,
    });
  } catch (error) {
    console.error('Error updating user preference:', error);
    return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await authenticateUser();
    await dbConnect();
    
    // Clear user's selected plan preference
    await User.findByIdAndUpdate(
      user.userId,
      { 
        selectedPlanId: null,
        selectedPlanName: null,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing user preference:', error);
    return NextResponse.json({ error: 'Failed to clear preference' }, { status: 500 });
  }
}
