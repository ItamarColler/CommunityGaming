import { getSessionFromCookie } from './session';
import type { RootState } from '@/lib/redux/store';
import { UserType, type PublicUser } from '@community-gaming/types';

/**
 * Preload auth state from server-side session cookie
 * Called in root layout to hydrate Redux with authenticated user
 */
export async function preloadAuthState(): Promise<Partial<RootState> | undefined> {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return undefined;
    }

    // TODO: Fetch full user data from identity service
    // For now, construct minimal user from session
    const user = await mockFetchUser(session.userId, session.email);

    if (!user) {
      return undefined;
    }

    // Calculate session expiration
    const expiresAt = new Date(session.exp * 1000).toISOString();

    return {
      auth: {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        sessionExpiresAt: expiresAt,
      },
    };
  } catch (error) {
    console.error('Failed to preload auth state:', error);
    return undefined;
  }
}

/**
 * Mock fetch user - REPLACE WITH REAL API CALL
 * This should call your identity service backend
 */
async function mockFetchUser(userId: string, email: string): Promise<PublicUser | null> {
  // In production, fetch from identity service using userId
  return {
    id: userId,
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
