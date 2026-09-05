import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import {
  isValidObjectId,
  validateUpdateUserInput,
} from '@/lib/validations/admin';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * Helper to extract id from context.params in Next.js App Router
 */
async function getIdFromContext(context: RouteContext): Promise<string> {
  const resolved = await Promise.resolve(context.params);
  return resolved?.id || '';
}

/**
 * GET /api/admin/users/:id
 * Admin-only: Fetch a single user by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);

    // 2. Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID format',
        },
        { status: 400 }
      );
    }

    // 3. Connect to database
    await connectToDatabase();

    // 4. Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // 5. Return safe user data
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

/**
 * PUT /api/admin/users/:id
 * Admin-only: Update user name, email, or role
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);

    // 2. Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID format',
        },
        { status: 400 }
      );
    }

    // 3. Parse and validate update payload
    const body = await req.json().catch(() => null);
    const validation = validateUpdateUserInput(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, role } = validation.data;

    // 4. Connect to database
    await connectToDatabase();

    // 5. Check if target user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // 6. If email is being changed, check for conflicts with other users
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'An account with this email already exists',
          },
          { status: 409 }
        );
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (role) {
      user.role = role;
    }

    // 7. Save changes
    await user.save();

    // 8. Return updated safe user
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
      error instanceof Error ? error.message : 'An error occurred while updating user';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/:id
 * Admin-only: Delete a user
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authorize admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck.error) {
      return adminCheck.error;
    }

    const id = await getIdFromContext(context);

    // 2. Validate MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID format',
        },
        { status: 400 }
      );
    }

    // 3. Prevent admin from accidentally deleting their own account
    if (adminCheck.user.userId === id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot delete your own admin account',
        },
        { status: 400 }
      );
    }

    // 4. Connect to database
    await connectToDatabase();

    // 5. Delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while deleting user';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
