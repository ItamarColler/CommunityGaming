import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  displayName: z.string().optional(),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Auth session schema
export const AuthSessionSchema = z.object({
  user: UserSchema,
  expiresAt: z.string().datetime(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

// Login credentials schema
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

// Auth state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: string | null;
}

// API Response types
export interface AuthSuccessResponse {
  success: true;
  data: {
    user: User;
    expiresAt: string;
  };
}

export interface AuthErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

// Refresh token response
export interface RefreshResponse {
  success: boolean;
  data?: {
    user: User;
    expiresAt: string;
  };
  error?: {
    message: string;
  };
}
