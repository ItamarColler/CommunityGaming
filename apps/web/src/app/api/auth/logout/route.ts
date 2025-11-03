import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clearAuthCookies, validateCSRFHeader } from '@/lib/auth/session';

/**
 * POST /api/auth/logout
 * Sign out the current user
 * Clears all auth cookies
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF protection check
    if (!validateCSRFHeader(request)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid request' },
        },
        { status: 403 }
      );
    }

    // Clear auth cookies
    await clearAuthCookies();

    // TODO: Optional - invalidate refresh token in database/Redis
    // This adds extra security by blacklisting the token

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Internal server error' },
      },
      { status: 500 }
    );
  }
}
