import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { validateLoginInput } from '@/lib/validations/auth';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    // 1. Validate payload
    const validation = validateLoginInput(body);
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

    const { email, password } = validation.data;

    // 2. Connect to database
    await connectToDatabase();

    // 3. Find user (email is lowercased during validation)
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic error to prevent account enumeration
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // 4. Compare passwords using bcrypt
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

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
      { status: 200 }
    );

    // 7. Store JWT in secure HTTP-only cookie
    return setAuthCookie(response, token);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
