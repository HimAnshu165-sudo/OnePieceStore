import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { AuthTokenPayload, UserRole } from '@/types/auth';

export const AUTH_COOKIE_NAME = 'auth_token';
const DEFAULT_TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Retrieves the JWT Secret from environment variables.
 * Throws an error if not defined to prevent insecure defaults.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return secret;
}

/**
 * Hashes a plain-text password using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain-text password with a hashed password.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates and signs a JWT token containing user identification and role.
 */
export function createToken(
  payload: AuthTokenPayload,
  expiresIn: string = DEFAULT_TOKEN_EXPIRY
): string {
  const secret = getJwtSecret();
  // Ensure we only sign the expected fields
  const tokenPayload: AuthTokenPayload = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    if (!decoded || !decoded.userId || !decoded.role) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extracts the JWT token from NextRequest cookies or Authorization header.
 */
export function extractTokenFromRequest(
  req: NextRequest | Request
): string | null {
  // 1. Check cookies if NextRequest
  if ('cookies' in req && typeof req.cookies?.get === 'function') {
    const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (cookieToken) {
      return cookieToken;
    }
  }

  // 2. Check Cookie header directly (for standard Request or fallback)
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, current) => {
      const [name, ...val] = current.trim().split('=');
      if (name && val.length > 0) {
        acc[name] = decodeURIComponent(val.join('='));
      }
      return acc;
    }, {} as Record<string, string>);

    if (cookies[AUTH_COOKIE_NAME]) {
      return cookies[AUTH_COOKIE_NAME];
    }
  }

  // 3. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Retrieves the authenticated user token payload from the request.
 */
export async function getAuthenticatedUser(
  req: NextRequest | Request
): Promise<AuthTokenPayload | null> {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

/**
 * Sets the secure HTTP-only authentication cookie on a NextResponse.
 */
export function setAuthCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

/**
 * Clears the authentication cookie from a NextResponse.
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/**
 * Guard utility for user-protected API routes.
 * Returns { user } if authenticated, or { error: NextResponse } if unauthenticated (401).
 */
export async function requireAuth(
  req: NextRequest | Request
): Promise<
  { user: AuthTokenPayload; error?: never } | { error: NextResponse; user?: never }
> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in to continue.',
        },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Guard utility for admin-protected API routes.
 * Returns { user } if user has 'admin' role,
 * Returns 401 if unauthenticated, or 403 if authenticated but not admin.
 */
export async function requireAdmin(
  req: NextRequest | Request
): Promise<
  { user: AuthTokenPayload; error?: never } | { error: NextResponse; user?: never }
> {
  const authCheck = await requireAuth(req);
  if (authCheck.error) {
    return authCheck;
  }

  if (authCheck.user.role !== ('admin' as UserRole)) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Forbidden. Administrator access required.',
        },
        { status: 403 }
      ),
    };
  }

  return { user: authCheck.user };
}

/**
 * Convenience helper to extract and decode JWT payload without throwing error.
 */
export function getAuthTokenPayload(req: NextRequest | Request): AuthTokenPayload | null {
  const token = extractTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
