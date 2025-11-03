import { SignJWT, jwtVerify } from 'jose';
import type { PublicUser } from '@community-gaming/types';
import { cookies } from 'next/headers';

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-change-in-production-min-32-chars'
);

const SESSION_COOKIE_NAME = 'session';
const REFRESH_COOKIE_NAME = 'refresh_token';

// Session duration: 15 minutes
const SESSION_DURATION = 15 * 60 * 1000;
// Refresh duration: 7 days
const REFRESH_DURATION = 7 * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

/**
 * Create a new session token
 */
export async function createSessionToken(user: PublicUser): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION;

  return new SignJWT({
    userId: user.id,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .setIssuedAt()
    .sign(SESSION_SECRET);
}

/**
 * Create a refresh token (longer lived)
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const expiresAt = Date.now() + REFRESH_DURATION;

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .setIssuedAt()
    .sign(SESSION_SECRET);
}

/**
 * Verify and decode a session token
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Set session cookie (httpOnly, secure in production)
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

/**
 * Set refresh token cookie
 */
export async function setRefreshCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: REFRESH_DURATION / 1000,
    path: '/api/auth',
  });
}

/**
 * Get session from cookie
 */
export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

/**
 * Get refresh token from cookie
 */
export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE_NAME)?.value || null;
}

/**
 * Clear all auth cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

/**
 * Validate CSRF protection header
 */
export function validateCSRFHeader(request: Request): boolean {
  const csrfHeader = request.headers.get('X-Requested-With');
  return csrfHeader === 'XMLHttpRequest';
}
