import { prisma } from '../db/prisma.client';
import { Prisma } from '@prisma/client';
import type {
  OnboardingRole,
  OnboardingStep,
  OnboardingProgressData,
  ProfileSetup,
  GamerIntent,
  LeaderIntent,
  SponsorIntent,
  GamerGoals,
  LeaderGoals,
  SponsorGoals,
  Preferences,
} from '@community-gaming/types';

type IntentData = GamerIntent | LeaderIntent | SponsorIntent;
type GoalsData = GamerGoals | LeaderGoals | SponsorGoals;

/**
 * Onboarding Service
 * Handles all onboarding-related business logic
 */
class OnboardingService {
  /**
   * Start onboarding for a user
   * @param userId - User ID
   * @param role - Selected role
   * @returns Created onboarding progress
   */
  async startOnboarding(userId: string, role: OnboardingRole): Promise<OnboardingProgressData> {
    // Check if user already has onboarding progress
    const existingProgress = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (existingProgress) {
      // If already completed, don't allow restart
      if (existingProgress.isCompleted) {
        throw new Error('Onboarding already completed');
      }

      // Return existing progress
      return existingProgress as OnboardingProgressData;
    }

    // Create new onboarding progress
    const progress = await prisma.onboardingProgress.create({
      data: {
        userId,
        selectedRole: role,
        currentStep: 'profile',
        completedSteps: ['welcome'],
        completionScore: 5,
      },
    });

    return progress as OnboardingProgressData;
  }

  /**
   * Get onboarding progress for a user
   * @param userId - User ID
   * @returns Onboarding progress or null if not found
   */
  async getProgress(userId: string): Promise<OnboardingProgressData | null> {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    return progress as OnboardingProgressData | null;
  }

  /**
   * Update current step
   * @param userId - User ID
   * @param step - New current step
   */
  async updateCurrentStep(userId: string, step: OnboardingStep): Promise<void> {
    await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        currentStep: step,
        lastStepAt: new Date(),
      },
    });
  }

  /**
   * Save profile data
   * @param userId - User ID
   * @param data - Profile data
   * @returns Updated progress
   */
  async saveProfileData(
    userId: string,
    data: Partial<ProfileSetup>
  ): Promise<OnboardingProgressData> {
    const progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        profileData: data as Prisma.InputJsonValue,
        completionScore: 20,
        lastStepAt: new Date(),
      },
    });

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes('profile')) {
      await prisma.onboardingProgress.update({
        where: { userId },
        data: {
          completedSteps: [...progress.completedSteps, 'profile'],
        },
      });
    }

    return progress as OnboardingProgressData;
  }

  /**
   * Save intent data
   * @param userId - User ID
   * @param data - Intent data
   * @returns Updated progress
   */
  async saveIntentData(userId: string, data: Partial<IntentData>): Promise<OnboardingProgressData> {
    const progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        intentData: data as Prisma.InputJsonValue,
        completionScore: 40,
        lastStepAt: new Date(),
      },
    });

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes('intent')) {
      await prisma.onboardingProgress.update({
        where: { userId },
        data: {
          completedSteps: [...progress.completedSteps, 'intent'],
        },
      });
    }

    return progress as OnboardingProgressData;
  }

  /**
   * Save goals data
   * @param userId - User ID
   * @param data - Goals data
   * @returns Updated progress
   */
  async saveGoalsData(userId: string, data: Partial<GoalsData>): Promise<OnboardingProgressData> {
    const progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        goalsData: data as Prisma.InputJsonValue,
        completionScore: 60,
        lastStepAt: new Date(),
      },
    });

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes('goals')) {
      await prisma.onboardingProgress.update({
        where: { userId },
        data: {
          completedSteps: [...progress.completedSteps, 'goals'],
        },
      });
    }

    return progress as OnboardingProgressData;
  }

  /**
   * Save preferences data
   * @param userId - User ID
   * @param data - Preferences data
   * @returns Updated progress
   */
  async savePreferencesData(
    userId: string,
    data: Partial<Preferences>
  ): Promise<OnboardingProgressData> {
    const progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        preferencesData: data as Prisma.InputJsonValue,
        completionScore: 80,
        lastStepAt: new Date(),
      },
    });

    // Add to completed steps if not already there
    if (!progress.completedSteps.includes('preferences')) {
      await prisma.onboardingProgress.update({
        where: { userId },
        data: {
          completedSteps: [...progress.completedSteps, 'preferences'],
        },
      });
    }

    return progress as OnboardingProgressData;
  }

  /**
   * Complete onboarding
   * @param userId - User ID
   * @returns Completion data with recommendations
   */
  async completeOnboarding(userId: string): Promise<{
    completionScore: number;
    missingFields: string[];
    recommendations: Record<string, number>;
    nextSteps: string[];
  }> {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      throw new Error('Onboarding progress not found');
    }

    // Calculate completion score and missing fields
    const missingFields: string[] = [];
    let completionScore = 100;

    if (
      !progress.profileData ||
      Object.keys(progress.profileData as Record<string, unknown>).length === 0
    ) {
      missingFields.push('profile');
      completionScore -= 20;
    }

    if (
      !progress.intentData ||
      Object.keys(progress.intentData as Record<string, unknown>).length === 0
    ) {
      missingFields.push('intent');
      completionScore -= 20;
    }

    if (
      !progress.goalsData ||
      Object.keys(progress.goalsData as Record<string, unknown>).length === 0
    ) {
      missingFields.push('goals');
      completionScore -= 20;
    }

    if (
      !progress.preferencesData ||
      Object.keys(progress.preferencesData as Record<string, unknown>).length === 0
    ) {
      missingFields.push('preferences');
      completionScore -= 20;
    }

    // Mock recommendations based on role
    const recommendations: Record<string, number> = {};
    const nextSteps: string[] = [];

    if (progress.selectedRole === 'gamer') {
      recommendations.communities = 25;
      recommendations.missions = 12;
      nextSteps.push('Join your first community');
      nextSteps.push('Complete your first mission');
      nextSteps.push('Connect with other gamers');
    } else if (progress.selectedRole === 'leader') {
      recommendations.communities = 8;
      recommendations.mentors = 5;
      nextSteps.push('Create your first community');
      nextSteps.push('Set up community guidelines');
      nextSteps.push('Invite your first members');
    } else if (progress.selectedRole === 'sponsor') {
      recommendations.leaders = 15;
      recommendations.sponsors = 8;
      nextSteps.push('Browse available communities');
      nextSteps.push('Create your first campaign');
      nextSteps.push('Set up your brand profile');
    }

    // Mark as completed
    await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        isCompleted: true,
        completionScore,
        completedAt: new Date(),
        currentStep: 'complete',
        completedSteps: [...progress.completedSteps, 'complete'],
      },
    });

    return {
      completionScore,
      missingFields,
      recommendations,
      nextSteps,
    };
  }

  /**
   * Get match preview for user's preferences
   * @param userId - User ID
   * @returns Match counts for potential connections
   */
  async getMatchPreview(userId: string): Promise<Record<string, number>> {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return {};
    }

    // Mock match counts based on role and data
    // In production, this would query actual database for matching users/communities
    const matchCounts: Record<string, number> = {};

    if (progress.selectedRole === 'gamer') {
      matchCounts.players = Math.floor(Math.random() * 100) + 50;
      matchCounts.communities = Math.floor(Math.random() * 30) + 10;
      matchCounts.events = Math.floor(Math.random() * 20) + 5;
    } else if (progress.selectedRole === 'leader') {
      matchCounts.communities = Math.floor(Math.random() * 15) + 5;
      matchCounts.members = Math.floor(Math.random() * 200) + 100;
      matchCounts.collaborators = Math.floor(Math.random() * 10) + 3;
    } else if (progress.selectedRole === 'sponsor') {
      matchCounts.communities = Math.floor(Math.random() * 25) + 10;
      matchCounts.leaders = Math.floor(Math.random() * 20) + 8;
      matchCounts.campaigns = Math.floor(Math.random() * 15) + 5;
    }

    return matchCounts;
  }

  /**
   * Skip onboarding for a user
   * @param userId - User ID
   */
  async skipOnboarding(userId: string): Promise<void> {
    const progress = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    if (!progress) {
      // Create a minimal progress entry
      await prisma.onboardingProgress.create({
        data: {
          userId,
          selectedRole: 'gamer', // Default to gamer
          currentStep: 'complete',
          completedSteps: [],
          completionScore: 0,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    } else {
      // Mark as completed with current score
      await prisma.onboardingProgress.update({
        where: { userId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          currentStep: 'complete',
        },
      });
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
