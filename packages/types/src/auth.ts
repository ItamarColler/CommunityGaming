import { z } from 'zod';
import { PublicUserSchema } from './user';

// Re-export validation schemas

// Password validation regex - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Login validation
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register validation
export const RegisterRequestSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z
      .string()
      .max(50, 'Display name must be at most 50 characters')
      .optional()
      .default(''),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Refresh session validation
export const RefreshSessionRequestSchema = z.object({
  refreshToken: z.string().optional(),
});

// User creation validation (for backend)
export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50).optional(),
  userType: z.enum(['PLAYER', 'CREATOR', 'MODERATOR', 'ADMIN']).optional(),
});

// User update validation
export const UpdateUserInputSchema = z
  .object({
    email: z.string().email().optional(),
    displayName: z.string().min(1).max(50).optional(),
    avatar: z.string().url().optional(),
  })
  .partial();

// Session schema matching database model
export const SessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

// Refresh token schema matching database model
export const RefreshTokenSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
});

// Authenticated user schema (with tokens)
export const AuthenticatedUserSchema = PublicUserSchema.extend({
  token: z.string(),
  refreshToken: z.string(),
});

// Login response schema
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      user: AuthenticatedUserSchema,
      expiresAt: z.string(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
});

// Register response schema
export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      user: PublicUserSchema,
      expiresAt: z.string(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
});

// Refresh session response schema
export const RefreshSessionResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      expiresAt: z.string(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string(),
    })
    .optional(),
});

// Auth session type (used in client state)
export const AuthSessionSchema = z.object({
  user: PublicUserSchema,
  expiresAt: z.string(),
});

// Auth state type (used in Redux/state management)
export const AuthStateSchema = z.object({
  session: AuthSessionSchema.nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

// Export types
export type Session = z.infer<typeof SessionSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RefreshSessionResponse = z.infer<typeof RefreshSessionResponseSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshSessionRequest = z.infer<typeof RefreshSessionRequestSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
