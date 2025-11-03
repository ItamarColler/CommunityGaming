import { z } from 'zod';
import { PublicUserSchema } from './user';

// Re-export validation schemas
export { PASSWORD_REGEX } from './validation/auth';

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

// Login response schema
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: PublicUserSchema,
    expiresAt: z.string(),
  }).optional(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }).optional(),
});

// Register response schema
export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: PublicUserSchema,
    expiresAt: z.string(),
  }).optional(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }).optional(),
});

// Refresh session response schema
export const RefreshSessionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    expiresAt: z.string(),
  }).optional(),
  error: z.object({
    message: z.string(),
    code: z.string(),
  }).optional(),
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

// Re-export validation types and schemas
export {
  type LoginRequest,
  type RegisterRequest,
  type RefreshSessionRequest,
  LoginRequestSchema,
  RegisterRequestSchema,
  RefreshSessionRequestSchema,
} from './validation/auth';

// Export types
export type Session = z.infer<typeof SessionSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type RefreshSessionResponse = z.infer<typeof RefreshSessionResponseSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type AuthState = z.infer<typeof AuthStateSchema>;
