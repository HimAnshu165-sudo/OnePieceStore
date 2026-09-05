import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user from cookie or Authorization header
    const authCheck = await requireAuth(req);
    if (authCheck.error) {
      return authCheck.error;
    }

    // 2. Connect to database
    await connectToDatabase();

    // 3. Retrieve user profile
    const user = await User.findById(authCheck.user.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // 4. Return safe user data without password
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
      country: user.country || 'Japan',
      status: user.status || 'active',
      avatar: user.avatar || '',
      addresses: user.addresses || [],
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while fetching user';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authCheck = await requireAuth(req);
    if (authCheck.error) {
      return authCheck.error;
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const allowedFields = [
      'name',
      'phone',
      'address',
      'city',
      'state',
      'postalCode',
      'country',
      'avatar',
      'addresses',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await User.findByIdAndUpdate(
      authCheck.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const safeUser = {
      id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone || '',
      address: updated.address || '',
      city: updated.city || '',
      state: updated.state || '',
      postalCode: updated.postalCode || '',
      country: updated.country || 'Japan',
      status: updated.status || 'active',
      avatar: updated.avatar || '',
      addresses: updated.addresses || [],
      createdAt: updated.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
