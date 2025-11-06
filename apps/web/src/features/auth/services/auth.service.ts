import type { LoginRequest, LoginResponse, RefreshSessionResponse } from '@community-gaming/types';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001'}/auth`;

/**
 * Auth service handles client-side communication with auth API routes
 * All auth routes use httpOnly cookies for session management
 */
export const authService = {
  /**
   * Sign in with email and password
   * Returns user data and stores session in httpOnly cookie
   */
  async signIn(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CSRF protection - include custom header
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include', // Important: send cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        error: { message: 'Network error occurred', code: 'NETWORK_ERROR' },
      }));
      return error;
    }

    return response.json();
  },

  /**
   * Refresh the current session
   * Validates and refreshes the httpOnly session cookie
   */
  async refreshSession(): Promise<RefreshSessionResponse> {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return {
        success: false,
        error: { message: 'Failed to refresh session', code: 'REFRESH_FAILED' },
      };
    }

    return response.json();
  },

  /**
   * Sign out the current user
   * Clears httpOnly session cookie
   */
  async signOut(): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false };
    }

    return response.json();
  },
};
