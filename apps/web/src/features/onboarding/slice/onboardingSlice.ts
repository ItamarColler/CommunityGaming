import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OnboardingState, IntentData, GoalsData } from '../types/onboarding.types';
import type {
  OnboardingRole,
  OnboardingStep,
  ProfileSetup,
  Preferences,
} from '@community-gaming/types';

// Initial state
const initialState: OnboardingState = {
  progressId: null,
  selectedRole: null,
  currentStep: 'welcome',
  completedSteps: [],
  completionScore: 0,

  profileData: {},
  intentData: {},
  goalsData: {},
  preferencesData: {},

  isLoading: false,
  isSaving: false,
  error: null,

  matchPreview: {},

  isCompleted: false,
  missingFields: [],
  nextSteps: [],
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    // Start onboarding
    startOnboarding(state, action: PayloadAction<{ role: OnboardingRole; progressId: string }>) {
      state.selectedRole = action.payload.role;
      state.progressId = action.payload.progressId;
      state.currentStep = 'profile';
      state.completedSteps = ['welcome'];
      state.completionScore = 5;
      state.error = null;
    },

    // Set current step
    setCurrentStep(state, action: PayloadAction<OnboardingStep>) {
      state.currentStep = action.payload;
    },

    // Complete a step with profile data
    completeProfileStep(state, action: PayloadAction<Partial<ProfileSetup>>) {
      if (!state.completedSteps.includes('profile')) {
        state.completedSteps.push('profile');
      }
      state.profileData = { ...state.profileData, ...action.payload };
    },

    // Complete a step with intent data
    completeIntentStep(state, action: PayloadAction<Partial<IntentData>>) {
      if (!state.completedSteps.includes('intent')) {
        state.completedSteps.push('intent');
      }
      state.intentData = { ...state.intentData, ...action.payload };
    },

    // Complete a step with goals data
    completeGoalsStep(state, action: PayloadAction<Partial<GoalsData>>) {
      if (!state.completedSteps.includes('goals')) {
        state.completedSteps.push('goals');
      }
      state.goalsData = { ...state.goalsData, ...action.payload };
    },

    // Complete a step with preferences data
    completePreferencesStep(state, action: PayloadAction<Partial<Preferences>>) {
      if (!state.completedSteps.includes('preferences')) {
        state.completedSteps.push('preferences');
      }
      state.preferencesData = { ...state.preferencesData, ...action.payload };
    },

    // Update step data without completing (for auto-save)
    updateProfileData(state, action: PayloadAction<Partial<ProfileSetup>>) {
      state.profileData = { ...state.profileData, ...action.payload };
    },

    updateIntentData(state, action: PayloadAction<Partial<IntentData>>) {
      state.intentData = { ...state.intentData, ...action.payload };
    },

    updateGoalsData(state, action: PayloadAction<Partial<GoalsData>>) {
      state.goalsData = { ...state.goalsData, ...action.payload };
    },

    updatePreferencesData(state, action: PayloadAction<Partial<Preferences>>) {
      state.preferencesData = { ...state.preferencesData, ...action.payload };
    },

    // Update completion score
    updateCompletionScore(state, action: PayloadAction<number>) {
      state.completionScore = action.payload;
    },

    // Update match preview
    updateMatchPreview(state, action: PayloadAction<Partial<OnboardingState['matchPreview']>>) {
      state.matchPreview = { ...state.matchPreview, ...action.payload };
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Set saving state
    setSaving(state, action: PayloadAction<boolean>) {
      state.isSaving = action.payload;
    },

    // Set error
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Complete onboarding
    setOnboardingCompleted(
      state,
      action: PayloadAction<{
        completionScore: number;
        missingFields: string[];
        nextSteps: string[];
      }>
    ) {
      state.isCompleted = true;
      state.completionScore = action.payload.completionScore;
      state.missingFields = action.payload.missingFields;
      state.nextSteps = action.payload.nextSteps;
      state.currentStep = 'complete';
      if (!state.completedSteps.includes('complete')) {
        state.completedSteps.push('complete');
      }
    },

    // Reset onboarding
    resetOnboarding() {
      return initialState;
    },

    // Load existing progress
    loadProgress(
      state,
      action: PayloadAction<{
        progressId: string;
        selectedRole: OnboardingRole;
        currentStep: OnboardingStep;
        completedSteps: OnboardingStep[];
        completionScore: number;
        profileData?: Partial<ProfileSetup>;
        intentData?: Partial<IntentData>;
        goalsData?: Partial<GoalsData>;
        preferencesData?: Partial<Preferences>;
      }>
    ) {
      const {
        progressId,
        selectedRole,
        currentStep,
        completedSteps,
        completionScore,
        profileData,
        intentData,
        goalsData,
        preferencesData,
      } = action.payload;

      state.progressId = progressId;
      state.selectedRole = selectedRole;
      state.currentStep = currentStep;
      state.completedSteps = completedSteps;
      state.completionScore = completionScore;

      if (profileData) state.profileData = profileData;
      if (intentData) state.intentData = intentData;
      if (goalsData) state.goalsData = goalsData;
      if (preferencesData) state.preferencesData = preferencesData;
    },
  },
});

export const {
  startOnboarding,
  setCurrentStep,
  completeProfileStep,
  completeIntentStep,
  completeGoalsStep,
  completePreferencesStep,
  updateProfileData,
  updateIntentData,
  updateGoalsData,
  updatePreferencesData,
  updateCompletionScore,
  updateMatchPreview,
  setLoading,
  setSaving,
  setError,
  setOnboardingCompleted,
  resetOnboarding,
  loadProgress,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
