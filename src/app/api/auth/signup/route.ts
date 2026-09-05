import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { validateRegisterInput } from '@/lib/validations/auth';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // 1. Validate payload
    const validation = validateRegisterInput(body);
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

    const { name, email, password } = validation.data;

    // 2. Connect to database
    await connectToDatabase();

    // 3. Check for duplicate email (case-insensitive)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists',
        },
        { status: 400 }
      );
    }

    // 4. Create user - enforce role "user"
    // STRICT SECURITY: Normal signups ALWAYS create a "user" account.
    // Client role input is discarded.
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    // 5. Generate JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // 6. Build response (safe user representation without password or JWT)
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: safeUser,
      },
      { status: 201 }
    );

    // 7. Store JWT in secure HTTP-only cookie
    return setAuthCookie(response, token);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred during signup';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
