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
import { LoginSchema } from '../dto/login.dto';
import { UserType, type LoginResponse, type PublicUser } from '@community-gaming/types';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Sets httpOnly session and refresh cookies
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF protection check
    if (!validateCSRFHeader(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid request', code: 'CSRF_ERROR' },
        } satisfies LoginResponse,
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate using Zod
    const validation = validateBody(LoginSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: validation.errors?.join(', ') || 'Validation failed',
            code: 'VALIDATION_ERROR',
          },
        } satisfies LoginResponse,
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    // TODO: Replace with actual API call to identity service
    // For now, mock authentication (REMOVE IN PRODUCTION)
    const mockUser = await mockAuthenticateUser(email, password);

    if (!mockUser) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid credentials', code: 'AUTH_FAILED' },
        } satisfies LoginResponse,
        { status: 401 }
      );
    }

    // Create session and refresh tokens
    const sessionToken = await createSessionToken(mockUser);
    const refreshToken = await createRefreshToken(mockUser.id);

    // Set httpOnly cookies
    await setSessionCookie(sessionToken);
    await setRefreshCookie(refreshToken);

    // Calculate expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          user: mockUser,
          expiresAt,
        },
      } satisfies LoginResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error', code: 'SERVER_ERROR' },
      } satisfies LoginResponse,
      { status: 500 }
    );
  }
}

/**
 * Mock authentication - REPLACE WITH REAL API CALL
 * This should call your identity service backend
 */
async function mockAuthenticateUser(email: string, password: string): Promise<PublicUser | null> {
  // Mock: Accept any email with password that meets requirements
  // In production, this calls your identity service
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return null;
  }

  // Mock user data
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email,
    username: email.split('@')[0],
    displayName: email.split('@')[0],
    avatar: null,
    userType: UserType.PLAYER,
    isVerified: false,
    isActive: true,
    isBanned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };
}
