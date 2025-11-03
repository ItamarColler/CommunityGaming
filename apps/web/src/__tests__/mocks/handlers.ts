import { http, HttpResponse } from 'msw';
import type { AuthResponse, RefreshResponse, User } from '@/features/auth/types';

const API_BASE = 'http://localhost:3000/api/auth';

// Mock user data
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * MSW handlers for auth API routes
 */
export const handlers = [
  // POST /api/auth/login
  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Check CSRF header
    if (request.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid request', code: 'CSRF_ERROR' },
        } satisfies AuthResponse,
        { status: 403 }
      );
    }

    // Validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(body.password)) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
            code: 'VALIDATION_ERROR',
          },
        } satisfies AuthResponse,
        { status: 400 }
      );
    }

    // Mock successful login
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: { ...mockUser, email: body.email },
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      } satisfies AuthResponse,
      { status: 200 }
    );
  }),

  // POST /api/auth/refresh
  http.post(`${API_BASE}/refresh`, async ({ request }) => {
    // Check CSRF header
    if (request.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid request' },
        } satisfies RefreshResponse,
        { status: 403 }
      );
    }

    // Mock successful refresh
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: mockUser,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      } satisfies RefreshResponse,
      { status: 200 }
    );
  }),

  // POST /api/auth/logout
  http.post(`${API_BASE}/logout`, async ({ request }) => {
    // Check CSRF header
    if (request.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
      return HttpResponse.json(
        {
          success: false,
          error: { message: 'Invalid request' },
        },
        { status: 403 }
      );
    }

    // Mock successful logout
    return HttpResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  }),
];
