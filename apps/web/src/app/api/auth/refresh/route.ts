import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getSessionFromCookie,
  getRefreshTokenFromCookie,
  verifySessionToken,
  createSessionToken,
  setSessionCookie,
  validateCSRFHeader,
} from '@/lib/auth/session';
import { UserType, type RefreshSessionResponse, type PublicUser } from '@community-gaming/types';

/**
 * POST /api/auth/refresh
 * Refresh the current session using refresh token
 * Updates the session cookie with new expiration
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF protection check
    if (!validateCSRFHeader(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid request', code: 'CSRF_ERROR' },
        } satisfies RefreshSessionResponse,
        { status: 403 }
      );
    }

    // Check for existing session
    const session = await getSessionFromCookie();

    if (!session) {
      // Try to use refresh token
      const refreshToken = await getRefreshTokenFromCookie();

      if (!refreshToken) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'No valid session or refresh token', code: 'NO_SESSION' },
          } satisfies RefreshSessionResponse,
          { status: 401 }
        );
      }

      // Verify refresh token
      const refreshPayload = await verifySessionToken(refreshToken);

      if (!refreshPayload) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Invalid refresh token', code: 'INVALID_TOKEN' },
          } satisfies RefreshSessionResponse,
          { status: 401 }
        );
      }

      // TODO: Fetch user from identity service using refreshPayload.userId
      const user = await mockFetchUser(refreshPayload.userId);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: { message: 'User not found', code: 'USER_NOT_FOUND' },
          } satisfies RefreshSessionResponse,
          { status: 401 }
        );
      }

      // Create new session
      const newSessionToken = await createSessionToken(user);
      await setSessionCookie(newSessionToken);

      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      return NextResponse.json(
        {
          success: true,
          data: {
            expiresAt,
          },
        } satisfies RefreshSessionResponse,
        { status: 200 }
      );
    }

    // Session exists, fetch user and create new token
    // TODO: Fetch user from identity service
    const user = await mockFetchUser(session.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        } satisfies RefreshSessionResponse,
        { status: 401 }
      );
    }

    // Create new session token with extended expiration
    const newSessionToken = await createSessionToken(user);
    await setSessionCookie(newSessionToken);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          expiresAt,
        },
      } satisfies RefreshSessionResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error', code: 'SERVER_ERROR' },
      } satisfies RefreshSessionResponse,
      { status: 500 }
    );
  }
}

/**
 * Mock fetch user - REPLACE WITH REAL API CALL
 * This should call your identity service backend
 */
async function mockFetchUser(userId: string): Promise<PublicUser | null> {
  // Mock: Return a user
  return {
    id: userId,
    email: 'user@example.com',
    username: 'user',
    displayName: 'User',
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
