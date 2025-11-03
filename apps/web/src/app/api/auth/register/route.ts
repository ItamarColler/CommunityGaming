import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  createSessionToken,
  createRefreshToken,
  setSessionCookie,
  setRefreshCookie,
  validateCSRFHeader,
} from '@/lib/auth/session';
import { validateBody } from '@/lib/validation/validate';
import { UserType, RegisterRequestSchema, type RegisterResponse, type PublicUser } from '@community-gaming/types';

/**
 * POST /api/auth/register
 * Register a new user account
 * Sets httpOnly session and refresh cookies upon successful registration
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF protection check
    if (!validateCSRFHeader(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid request', code: 'CSRF_ERROR' },
        } satisfies RegisterResponse,
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate using Zod
    const validation = validateBody(RegisterRequestSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: validation.errors?.join(', ') || 'Validation failed',
            code: 'VALIDATION_ERROR',
          },
        } satisfies RegisterResponse,
        { status: 400 }
      );
    }

    const { username, email, password, displayName } = validation.data!;

    // TODO: Replace with actual API call to identity service
    // For now, mock registration (REMOVE IN PRODUCTION)
    const result = await mockRegisterUser({
      username,
      email,
      password,
      displayName,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error,
            code: result.code,
          },
        } satisfies RegisterResponse,
        { status: result.status }
      );
    }

    const newUser = result.user;

    // Create session and refresh tokens
    const sessionToken = await createSessionToken(newUser);
    const refreshToken = await createRefreshToken(newUser.id);

    // Set httpOnly cookies
    await setSessionCookie(sessionToken);
    await setRefreshCookie(refreshToken);

    // Calculate expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          user: newUser,
          expiresAt,
        },
      } satisfies RegisterResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error', code: 'SERVER_ERROR' },
      } satisfies RegisterResponse,
      { status: 500 }
    );
  }
}

/**
 * Mock registration - REPLACE WITH REAL API CALL
 * This should call your identity service backend
 */
async function mockRegisterUser(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<
  | { success: true; user: PublicUser }
  | { success: false; error: string; code: string; status: number }
> {
  // Mock: Check if email already exists (in real app, check database)
  const existingEmails = ['test@example.com', 'admin@example.com'];
  if (existingEmails.includes(data.email.toLowerCase())) {
    return {
      success: false,
      error: 'Email already registered',
      code: 'EMAIL_EXISTS',
      status: 409,
    };
  }

  // Mock: Check if username already exists
  const existingUsernames = ['admin', 'test', 'user'];
  if (existingUsernames.includes(data.username.toLowerCase())) {
    return {
      success: false,
      error: 'Username already taken',
      code: 'USERNAME_EXISTS',
      status: 409,
    };
  }

  // Mock: Validate password strength (already done by Zod, but double-check in production)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(data.password)) {
    return {
      success: false,
      error: 'Password does not meet requirements',
      code: 'WEAK_PASSWORD',
      status: 400,
    };
  }

  // Mock: Create new user
  const newUser: PublicUser = {
    id: crypto.randomUUID(),
    email: data.email,
    username: data.username,
    displayName: data.displayName || data.username,
    avatar: null,
    userType: UserType.PLAYER,
    isVerified: false,
    isActive: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  // In production: Hash password, store in database, send verification email, etc.
  return {
    success: true,
    user: newUser,
  };
}
