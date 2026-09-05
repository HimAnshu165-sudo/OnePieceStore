import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Fetch all users (excluding password)
    const users = await User.find({}).sort({ createdAt: -1 });

    // 4. Map to safe representation
    const safeUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        users: safeUsers,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while fetching users';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
