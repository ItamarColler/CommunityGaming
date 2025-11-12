import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, POST, GET, PUT } from 'fastify-decorators';
import { createLogger } from '@community-gaming/utils';
import {
  StartOnboardingRequestSchema,
  UpdateStepRequestSchema,
  StatusCode,
  type StartOnboardingResponse,
  type GetProgressResponse,
  type UpdateStepResponse,
  type CompleteOnboardingResponse,
  type MatchPreviewResponse,
} from '@community-gaming/types';
import { onboardingService } from '../services/onboarding.service';
import type { AuthenticatedRequest } from '../types/request';

const logger = createLogger('onboarding-controller');

@Controller('/onboarding')
export default class OnboardingController {
  /**
   * POST /onboarding/start
   * Start onboarding for the authenticated user
   */
  @POST('/start')
  async startOnboarding(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      // Get user ID from authenticated request
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        } satisfies StartOnboardingResponse);
      }

      // Validate request body
      const validation = StartOnboardingRequestSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(StatusCode.BAD_REQUEST).send({
          success: false,
          error: {
            message: validation.error.errors[0].message,
            code: 'VALIDATION_ERROR',
          },
        } satisfies StartOnboardingResponse);
      }

      const { role } = validation.data;

      // Start onboarding
      const progress = await onboardingService.startOnboarding(userId, role);

      logger.info('Onboarding started', {
        userId,
        role,
        progressId: progress.id,
      });

      return reply.status(StatusCode.CREATED).send({
        success: true,
        data: {
          progressId: progress.id,
          selectedRole: progress.selectedRole,
          currentStep: progress.currentStep,
          completionScore: progress.completionScore,
        },
      } satisfies StartOnboardingResponse);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'Onboarding already completed') {
        return reply.status(StatusCode.CONFLICT).send({
          success: false,
          error: {
            message: 'Onboarding already completed',
            code: 'ALREADY_COMPLETED',
          },
        } satisfies StartOnboardingResponse);
      }

      logger.error('Failed to start onboarding:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      } satisfies StartOnboardingResponse);
    }
  }

  /**
   * GET /onboarding/progress
   * Get onboarding progress for the authenticated user
   */
  @GET('/progress')
  async getProgress(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        } satisfies GetProgressResponse);
      }

      const progress = await onboardingService.getProgress(userId);

      if (!progress) {
        return reply.status(StatusCode.NOT_FOUND).send({
          success: false,
          error: {
            message: 'Onboarding progress not found',
            code: 'NOT_FOUND',
          },
        } satisfies GetProgressResponse);
      }

      return reply.status(StatusCode.OK).send({
        success: true,
        data: {
          userId: progress.userId,
          progressId: progress.id,
          selectedRole: progress.selectedRole,
          currentStep: progress.currentStep,
          completedSteps: progress.completedSteps,
          completionScore: progress.completionScore,
          profileData: progress.profileData,
          intentData: progress.intentData,
          goalsData: progress.goalsData,
          preferencesData: progress.preferencesData,
          isCompleted: progress.isCompleted,
        },
      } satisfies GetProgressResponse);
    } catch (error: Error | unknown) {
      logger.error('Failed to get onboarding progress:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      } satisfies GetProgressResponse);
    }
  }

  /**
   * PUT /onboarding/step
   * Update step data for the authenticated user
   */
  @PUT('/step')
  async updateStep(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        } satisfies UpdateStepResponse);
      }

      // Validate request body
      const validation = UpdateStepRequestSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(StatusCode.BAD_REQUEST).send({
          success: false,
          error: {
            message: validation.error.errors[0].message,
            code: 'VALIDATION_ERROR',
          },
        } satisfies UpdateStepResponse);
      }

      const { step, data } = validation.data;

      // Update step data based on step type
      let progress;
      switch (step) {
        case 'profile':
          progress = await onboardingService.saveProfileData(userId, data);
          break;
        case 'intent':
          progress = await onboardingService.saveIntentData(userId, data);
          break;
        case 'goals':
          progress = await onboardingService.saveGoalsData(userId, data);
          break;
        case 'preferences':
          progress = await onboardingService.savePreferencesData(userId, data);
          break;
        default:
          return reply.status(StatusCode.BAD_REQUEST).send({
            success: false,
            error: {
              message: `Invalid step: ${step}`,
              code: 'INVALID_STEP',
            },
          } satisfies UpdateStepResponse);
      }

      logger.info('Onboarding step updated', {
        userId,
        step,
        completionScore: progress.completionScore,
      });

      return reply.status(StatusCode.OK).send({
        success: true,
        data: {
          currentStep: progress.currentStep,
          completedSteps: progress.completedSteps,
          completionScore: progress.completionScore,
        },
      } satisfies UpdateStepResponse);
    } catch (error: Error | unknown) {
      logger.error('Failed to update onboarding step:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      } satisfies UpdateStepResponse);
    }
  }

  /**
   * POST /onboarding/complete
   * Complete onboarding for the authenticated user
   */
  @POST('/complete')
  async completeOnboarding(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        } satisfies CompleteOnboardingResponse);
      }

      // Complete onboarding
      const result = await onboardingService.completeOnboarding(userId);

      logger.info('Onboarding completed', {
        userId,
        completionScore: result.completionScore,
      });

      return reply.status(StatusCode.OK).send({
        success: true,
        data: {
          completionScore: result.completionScore,
          missingFields: result.missingFields,
          recommendations: result.recommendations,
          nextSteps: result.nextSteps,
        },
      } satisfies CompleteOnboardingResponse);
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'Onboarding progress not found') {
        return reply.status(StatusCode.NOT_FOUND).send({
          success: false,
          error: {
            message: 'Onboarding progress not found',
            code: 'NOT_FOUND',
          },
        } satisfies CompleteOnboardingResponse);
      }

      logger.error('Failed to complete onboarding:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      } satisfies CompleteOnboardingResponse);
    }
  }

  /**
   * GET /onboarding/match-preview
   * Get match preview for the authenticated user
   */
  @GET('/match-preview')
  async getMatchPreview(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        } satisfies MatchPreviewResponse);
      }

      const matchCounts = await onboardingService.getMatchPreview(userId);

      return reply.status(StatusCode.OK).send({
        success: true,
        data: matchCounts,
      } satisfies MatchPreviewResponse);
    } catch (error: Error | unknown) {
      logger.error('Failed to get match preview:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      } satisfies MatchPreviewResponse);
    }
  }

  /**
   * POST /onboarding/skip
   * Skip onboarding for the authenticated user
   */
  @POST('/skip')
  async skipOnboarding(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const userId = request.auth?.id;

      if (!userId) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'User not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
      }

      await onboardingService.skipOnboarding(userId);

      logger.info('Onboarding skipped', { userId });

      return reply.status(StatusCode.OK).send({
        success: true,
        data: {
          message: 'Onboarding skipped successfully',
        },
      });
    } catch (error: Error | unknown) {
      logger.error('Failed to skip onboarding:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }
}
