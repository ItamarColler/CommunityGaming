import type {
  OnboardingRole,
  OnboardingStep,
  ProfileSetup,
  GamerIntent,
  LeaderIntent,
  SponsorIntent,
  GamerGoals,
  LeaderGoals,
  SponsorGoals,
  Preferences,
} from '@community-gaming/types';

// Union types for role-specific data
export type IntentData = GamerIntent | LeaderIntent | SponsorIntent;
export type GoalsData = GamerGoals | LeaderGoals | SponsorGoals;

// Match preview counts
export interface MatchPreviewCounts {
  communities?: number;
  members?: number;
  sponsors?: number;
}

// Web-specific Onboarding state for Redux
export interface OnboardingState {
  // Progress tracking
  progressId: string | null;
  selectedRole: OnboardingRole | null;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  completionScore: number; // 0-100

  // Step data
  profileData: Partial<ProfileSetup>;
  intentData: Partial<IntentData>;
  goalsData: Partial<GoalsData>;
  preferencesData: Partial<Preferences>;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Match preview
  matchPreview: MatchPreviewCounts;

  // Completion state
  isCompleted: boolean;
  missingFields: string[];
  nextSteps: string[];
}
