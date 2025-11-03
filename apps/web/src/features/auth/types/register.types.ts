import { z } from 'zod';

/**
 * Password regex:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Registration credentials schema
 * Validates all required fields for user registration
 */
export const RegisterCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),
  confirmPassword: z.string(),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must not exceed 50 characters')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Inferred TypeScript type from schema
 */
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;

/**
 * Registration request body (without confirmPassword)
 */
export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50).optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * Registration response types
 */
export interface RegisterSuccessResponse {
  success: true;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName?: string;
    };
    expiresAt: string;
  };
}

export interface RegisterErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;
