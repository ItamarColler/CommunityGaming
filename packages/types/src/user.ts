import { z } from 'zod';
import {
  UserType,
  PlayStyle,
  GoalType,
  MotivationType,
  ContentType,
  CommunicationChannel,
  LongTermVision,
  MissionIntent,
  CollaborationOpenness,
  IncentiveSystem,
  AnalyticsMetric,
  BrandCategory,
  CampaignObjective,
  PartnerType,
  ConversionMetric,
  PlatformType,
} from '@prisma/client';

// Re-export all enums from Prisma for consistent imports
export {
  UserType,
  PlayStyle,
  GoalType,
  MotivationType,
  ContentType,
  CommunicationChannel,
  LongTermVision,
  MissionIntent,
  CollaborationOpenness,
  IncentiveSystem,
  AnalyticsMetric,
  BrandCategory,
  CampaignObjective,
  PartnerType,
  ConversionMetric,
  PlatformType,
};

// Core enums
export const UserTypeSchema = z.nativeEnum(UserType);
export const PlayStyleSchema = z.nativeEnum(PlayStyle);
export const GoalTypeSchema = z.nativeEnum(GoalType);
export const MotivationTypeSchema = z.nativeEnum(MotivationType);
export const ContentTypeSchema = z.nativeEnum(ContentType);
export const CommunicationChannelSchema = z.nativeEnum(CommunicationChannel);

// Gamer enums
export const LongTermVisionSchema = z.nativeEnum(LongTermVision);

// Leader enums
export const MissionIntentSchema = z.nativeEnum(MissionIntent);
export const CollaborationOpennessSchema = z.nativeEnum(CollaborationOpenness);
export const IncentiveSystemSchema = z.nativeEnum(IncentiveSystem);
export const AnalyticsMetricSchema = z.nativeEnum(AnalyticsMetric);
export const PlatformTypeSchema = z.nativeEnum(PlatformType);

// Sponsor enums
export const BrandCategorySchema = z.nativeEnum(BrandCategory);
export const CampaignObjectiveSchema = z.nativeEnum(CampaignObjective);
export const PartnerTypeSchema = z.nativeEnum(PartnerType);
export const ConversionMetricSchema = z.nativeEnum(ConversionMetric);

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

  // Identity
  country: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),

  // Gaming Interests
  favoriteGames: z.array(z.string()).default([]),
  playStyle: PlayStyleSchema.optional().nullable(),

  // Growth Intent
  goalType: GoalTypeSchema.optional().nullable(),
  weeklyCommitment: z.number().int().min(0).max(168).optional().nullable(), // Max 168 hours in a week
  achievementMotivation: MotivationTypeSchema.optional().nullable(),

  // Discovery Preferences
  contentTypes: z.array(ContentTypeSchema).default([]),
  communicationChannels: z.array(CommunicationChannelSchema).default([]),

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

// User profile update schema (for PATCH endpoints)
export const UpdateUserProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatar: z.string().url().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  favoriteGames: z.array(z.string()).optional(),
  playStyle: PlayStyleSchema.optional(),
  goalType: GoalTypeSchema.optional(),
  weeklyCommitment: z.number().int().min(0).max(168).optional(),
  achievementMotivation: MotivationTypeSchema.optional(),
  contentTypes: z.array(ContentTypeSchema).optional(),
  communicationChannels: z.array(CommunicationChannelSchema).optional(),
});

// ============================================
// ROLE-SPECIFIC PROFILE SCHEMAS
// ============================================

// Gamer Profile Schema
export const GamerProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  currentRank: z.string().max(50).optional().nullable(),
  preferredGameModes: z.array(z.string()).default([]),
  shortTermGoal: z.string().max(500).optional().nullable(),
  longTermVision: LongTermVisionSchema.optional().nullable(),
  willingToMentor: z.boolean().default(false),
  shareAchievements: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateGamerProfileSchema = z.object({
  currentRank: z.string().max(50).optional(),
  preferredGameModes: z.array(z.string()).max(10).optional(),
  shortTermGoal: z.string().max(500).optional(),
  longTermVision: LongTermVisionSchema.optional(),
  willingToMentor: z.boolean().optional(),
  shareAchievements: z.boolean().optional(),
});

export const UpdateGamerProfileSchema = CreateGamerProfileSchema.partial();

// Leader Platform Schema
export const LeaderPlatformSchema = z.object({
  id: z.string().uuid(),
  leaderProfileId: z.string().uuid(),
  platformType: PlatformTypeSchema,
  platformHandle: z.string().min(1).max(100),
  isVerified: z.boolean().default(false),
  createdAt: z.coerce.date(),
});

export const CreateLeaderPlatformSchema = z.object({
  platformType: PlatformTypeSchema,
  platformHandle: z.string().min(1).max(100),
  isVerified: z.boolean().optional(),
});

// Leader Profile Schema
export const LeaderProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  communityName: z.string().min(3).max(100),
  genreFocus: z.string().min(1).max(50),
  memberSizeGoal: z.number().int().positive().optional().nullable(),
  missionIntent: MissionIntentSchema,
  collaborationOpenness: CollaborationOpennessSchema,
  incentiveSystem: IncentiveSystemSchema,
  desiredMetrics: z.array(AnalyticsMetricSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateLeaderProfileSchema = z.object({
  communityName: z.string().min(3).max(100),
  genreFocus: z.string().min(1).max(50),
  memberSizeGoal: z.number().int().positive().optional(),
  missionIntent: MissionIntentSchema,
  collaborationOpenness: CollaborationOpennessSchema,
  incentiveSystem: IncentiveSystemSchema,
  desiredMetrics: z.array(AnalyticsMetricSchema).optional(),
  platforms: z.array(CreateLeaderPlatformSchema).optional(),
});

export const UpdateLeaderProfileSchema = z.object({
  communityName: z.string().min(3).max(100).optional(),
  genreFocus: z.string().min(1).max(50).optional(),
  memberSizeGoal: z.number().int().positive().optional(),
  missionIntent: MissionIntentSchema.optional(),
  collaborationOpenness: CollaborationOpennessSchema.optional(),
  incentiveSystem: IncentiveSystemSchema.optional(),
  desiredMetrics: z.array(AnalyticsMetricSchema).optional(),
});

// Sponsor Profile Schema
export const SponsorProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  brandName: z.string().min(3).max(100),
  category: BrandCategorySchema,
  targetAudience: z.array(z.string()).default([]),
  objective: CampaignObjectiveSchema,
  budgetRange: z.number().int().nonnegative().optional().nullable(),
  preferredPartnerTypes: z.array(PartnerTypeSchema).default([]),
  conversionMetrics: z.array(ConversionMetricSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateSponsorProfileSchema = z.object({
  brandName: z.string().min(3).max(100),
  category: BrandCategorySchema,
  targetAudience: z.array(z.string()).min(1, 'At least one target audience required'),
  objective: CampaignObjectiveSchema,
  budgetRange: z.number().int().nonnegative().optional(),
  preferredPartnerTypes: z.array(PartnerTypeSchema).optional(),
  conversionMetrics: z.array(ConversionMetricSchema).optional(),
});

export const UpdateSponsorProfileSchema = z.object({
  brandName: z.string().min(3).max(100).optional(),
  category: BrandCategorySchema.optional(),
  targetAudience: z.array(z.string()).optional(),
  objective: CampaignObjectiveSchema.optional(),
  budgetRange: z.number().int().nonnegative().optional(),
  preferredPartnerTypes: z.array(PartnerTypeSchema).optional(),
  conversionMetrics: z.array(ConversionMetricSchema).optional(),
});

// Full User with Profiles
export const UserWithProfilesSchema = UserSchema.extend({
  gamerProfile: GamerProfileSchema.optional().nullable(),
  leaderProfile: LeaderProfileSchema.extend({
    platforms: z.array(LeaderPlatformSchema).optional(),
  })
    .optional()
    .nullable(),
  sponsorProfile: SponsorProfileSchema.optional().nullable(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;

export type GamerProfile = z.infer<typeof GamerProfileSchema>;
export type CreateGamerProfile = z.infer<typeof CreateGamerProfileSchema>;
export type UpdateGamerProfile = z.infer<typeof UpdateGamerProfileSchema>;

export type LeaderPlatform = z.infer<typeof LeaderPlatformSchema>;
export type CreateLeaderPlatform = z.infer<typeof CreateLeaderPlatformSchema>;

export type LeaderProfile = z.infer<typeof LeaderProfileSchema>;
export type CreateLeaderProfile = z.infer<typeof CreateLeaderProfileSchema>;
export type UpdateLeaderProfile = z.infer<typeof UpdateLeaderProfileSchema>;

export type SponsorProfile = z.infer<typeof SponsorProfileSchema>;
export type CreateSponsorProfile = z.infer<typeof CreateSponsorProfileSchema>;
export type UpdateSponsorProfile = z.infer<typeof UpdateSponsorProfileSchema>;

export type UserWithProfiles = z.infer<typeof UserWithProfilesSchema>;
