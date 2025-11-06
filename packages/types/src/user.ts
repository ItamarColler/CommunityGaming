import { z } from 'zod';
import { UserType } from '@prisma/client';

// Re-export UserType from Prisma for consistent imports
export { UserType };

export const UserTypeSchema = z.nativeEnum(UserType);

// Full User schema matching database model
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  passwordHash: z.string(),
  displayName: z.string().max(50).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  userType: UserTypeSchema.default(UserType.PLAYER),

  // OAuth providers
  oauthProvider: z.string().optional().nullable(),
  oauthId: z.string().optional().nullable(),

  // Account status
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isBanned: z.boolean().default(false),

  // Timestamps
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().optional().nullable(),
});

// Public user schema (without sensitive fields)
export const PublicUserSchema = UserSchema.omit({
  passwordHash: true,
  oauthProvider: true,
  oauthId: true,
});

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
