import type { RootState } from '@/lib/redux/store';

// Select the entire onboarding state
export const selectOnboarding = (state: RootState) => state.onboarding;

// Progress selectors
export const selectProgressId = (state: RootState) => state.onboarding.progressId;
export const selectSelectedRole = (state: RootState) => state.onboarding.selectedRole;
export const selectCurrentStep = (state: RootState) => state.onboarding.currentStep;
export const selectCompletedSteps = (state: RootState) => state.onboarding.completedSteps;
export const selectCompletionScore = (state: RootState) => state.onboarding.completionScore;

// Step data selectors
export const selectProfileData = (state: RootState) => state.onboarding.profileData;
export const selectIntentData = (state: RootState) => state.onboarding.intentData;
export const selectGoalsData = (state: RootState) => state.onboarding.goalsData;
export const selectPreferencesData = (state: RootState) => state.onboarding.preferencesData;

// UI state selectors
export const selectIsLoading = (state: RootState) => state.onboarding.isLoading;
export const selectIsSaving = (state: RootState) => state.onboarding.isSaving;
export const selectError = (state: RootState) => state.onboarding.error;

// Match preview selectors
export const selectMatchPreview = (state: RootState) => state.onboarding.matchPreview;

// Completion selectors
export const selectIsCompleted = (state: RootState) => state.onboarding.isCompleted;
export const selectMissingFields = (state: RootState) => state.onboarding.missingFields;
export const selectNextSteps = (state: RootState) => state.onboarding.nextSteps;

// Computed selectors
export const selectHasStarted = (state: RootState) => state.onboarding.progressId !== null;
