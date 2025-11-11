import { z } from 'zod';
import {
  PlayStyleSchema,
  GoalTypeSchema,
  MotivationTypeSchema,
  ContentTypeSchema,
  CommunicationChannelSchema,
  LongTermVisionSchema,
  MissionIntentSchema,
  CollaborationOpennessSchema,
  IncentiveSystemSchema,
  AnalyticsMetricSchema,
  PlatformTypeSchema,
  BrandCategorySchema,
  CampaignObjectiveSchema,
  PartnerTypeSchema,
  ConversionMetricSchema,
} from './user';

// ============================================
// ONBOARDING ROLE TYPES
// ============================================

export type OnboardingRole = 'gamer' | 'leader' | 'sponsor';

export const OnboardingRoleSchema = z.enum(['gamer', 'leader', 'sponsor']);

export type OnboardingStep = 'welcome' | 'profile' | 'intent' | 'goals' | 'preferences' | 'complete';

export const OnboardingStepSchema = z.enum([
  'welcome',
  'profile',
  'intent',
  'goals',
  'preferences',
  'complete',
]);

// ============================================
// STEP DATA SCHEMAS
// ============================================

// Step 1: Profile Setup (Shared across all roles)
export const ProfileSetupSchema = z.object({
  displayName: z.string().min(3).max(50),
  avatar: z.string().url().optional(),
  country: z.string().length(2), // ISO country code
  timezone: z.string(), // IANA timezone
  favoriteGames: z.array(z.string()).min(1).max(10),
  playStyle: PlayStyleSchema,
});

export type ProfileSetup = z.infer<typeof ProfileSetupSchema>;

// Step 2A: Gamer Intent
export const GamerIntentSchema = z.object({
  primaryGoal: GoalTypeSchema,
  shortTermGoal: z.string().max(500).optional(),
  longTermVision: LongTermVisionSchema,
});

export type GamerIntent = z.infer<typeof GamerIntentSchema>;

// Step 2B: Leader Intent
export const LeaderIntentSchema = z.object({
  communityName: z.string().min(3).max(100),
  genreFocus: z.string().min(1).max(50),
  memberSizeGoal: z.number().int().positive().optional(),
  missionIntent: MissionIntentSchema,
  collaborationOpenness: CollaborationOpennessSchema,
});

export type LeaderIntent = z.infer<typeof LeaderIntentSchema>;

// Step 2C: Sponsor Intent
export const SponsorIntentSchema = z.object({
  brandName: z.string().min(3).max(100),
  category: BrandCategorySchema,
  targetAudience: z.array(z.string()).min(1, 'At least one target audience required'),
  objective: CampaignObjectiveSchema,
});

export type SponsorIntent = z.infer<typeof SponsorIntentSchema>;

// Step 3A: Gamer Goals
export const GamerGoalsSchema = z.object({
  weeklyCommitment: z.number().int().min(0).max(168),
  achievementMotivation: MotivationTypeSchema,
  currentRank: z.string().max(50).optional(),
  preferredGameModes: z.array(z.string()).max(10),
  willingToMentor: z.boolean(),
});

export type GamerGoals = z.infer<typeof GamerGoalsSchema>;

// Step 3B: Leader Goals
export const LeaderGoalsSchema = z.object({
  incentiveSystem: IncentiveSystemSchema,
  desiredMetrics: z.array(AnalyticsMetricSchema),
  platforms: z
    .array(
      z.object({
        platformType: PlatformTypeSchema,
        platformHandle: z.string().min(1).max(100),
      })
    )
    .min(1, 'At least one platform required'),
});

export type LeaderGoals = z.infer<typeof LeaderGoalsSchema>;

// Step 3C: Sponsor Goals
export const SponsorGoalsSchema = z.object({
  budgetRange: z.number().int().nonnegative().optional(),
  preferredPartnerTypes: z.array(PartnerTypeSchema),
  conversionMetrics: z.array(ConversionMetricSchema),
});

export type SponsorGoals = z.infer<typeof SponsorGoalsSchema>;

// Step 4: Discovery Preferences (Shared)
export const PreferencesSchema = z.object({
  contentTypes: z.array(ContentTypeSchema),
  communicationChannels: z.array(CommunicationChannelSchema),
  notificationFrequency: z.enum(['realtime', 'daily', 'weekly']),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

// ============================================
// ONBOARDING PROGRESS TYPES
// ============================================

export const OnboardingProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  selectedRole: OnboardingRoleSchema,
  currentStep: OnboardingStepSchema,
  completedSteps: z.array(OnboardingStepSchema),

  // Step data
  profileData: ProfileSetupSchema.optional().nullable(),
  intentData: z
    .union([GamerIntentSchema, LeaderIntentSchema, SponsorIntentSchema])
    .optional()
    .nullable(),
  goalsData: z.union([GamerGoalsSchema, LeaderGoalsSchema, SponsorGoalsSchema]).optional().nullable(),
  preferencesData: PreferencesSchema.optional().nullable(),

  completionScore: z.number().int().min(0).max(100),
  isCompleted: z.boolean(),

  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().optional().nullable(),
  lastStepAt: z.coerce.date(),
});

export type OnboardingProgress = z.infer<typeof OnboardingProgressSchema>;

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Start onboarding
export const StartOnboardingRequestSchema = z.object({
  role: OnboardingRoleSchema,
});

export type StartOnboardingRequest = z.infer<typeof StartOnboardingRequestSchema>;

export const StartOnboardingResponseSchema = z.object({
  progressId: z.string().uuid(),
  selectedRole: OnboardingRoleSchema,
  currentStep: OnboardingStepSchema,
  completionScore: z.number(),
});

export type StartOnboardingResponse = z.infer<typeof StartOnboardingResponseSchema>;

// Update step data
export const UpdateStepDataRequestSchema = z.object({
  step: OnboardingStepSchema,
  data: z.record(z.any()), // Generic data object
});

export type UpdateStepDataRequest = z.infer<typeof UpdateStepDataRequestSchema>;

export const UpdateStepDataResponseSchema = z.object({
  completionScore: z.number().int().min(0).max(100),
  nextStep: OnboardingStepSchema.optional(),
  isCompleted: z.boolean(),
});

export type UpdateStepDataResponse = z.infer<typeof UpdateStepDataResponseSchema>;

// Complete onboarding
export const CompleteOnboardingResponseSchema = z.object({
  completionScore: z.number().int().min(0).max(100),
  missingFields: z.array(z.string()),
  recommendations: z.object({
    communities: z.number().optional(),
    missions: z.number().optional(),
    mentors: z.number().optional(),
    leaders: z.number().optional(),
    sponsors: z.number().optional(),
  }),
  nextSteps: z.array(z.string()),
});

export type CompleteOnboardingResponse = z.infer<typeof CompleteOnboardingResponseSchema>;

// Match preview
export const MatchPreviewSchema = z.object({
  count: z.number().int().nonnegative(),
  samples: z.array(z.record(z.any())).max(3),
});

export type MatchPreview = z.infer<typeof MatchPreviewSchema>;
