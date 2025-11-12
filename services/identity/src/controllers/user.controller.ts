import type { FastifyReply } from 'fastify';
import { Controller, POST, PATCH, GET } from 'fastify-decorators';
import { createLogger } from '@community-gaming/utils';
import { prisma } from '../db/prisma.client';
import { StatusCode, UpdateUserProfileSchema } from '@community-gaming/types';
import type { AuthenticatedRequest } from '../types/request';

const logger = createLogger('user-controller');

@Controller('/user')
export default class UserController {
  /**
   * POST /user/count
   * Get total user count
   */
  @POST('/count')
  async getUserCount(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const count = await prisma.user.count();
      return reply.send({ count });
    } catch (error: Error | unknown) {
      logger.error('Failed to count users:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        error: 'Internal server error',
        message: 'Failed to retrieve user count',
      });
    }
  }

  /**
   * GET /user/profile
   * Get current user profile from auth context
   */
  @GET('/profile')
  async getCurrentUser(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.auth;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          userType: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
          country: true,
          timezone: true,
          favoriteGames: true,
          playStyle: true,
          goalType: true,
          weeklyCommitment: true,
          achievementMotivation: true,
          contentTypes: true,
          communicationChannels: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        return reply.status(StatusCode.NOT_FOUND).send({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        });
      }

      return reply.status(StatusCode.OK).send({
        success: true,
        data: user,
      });
    } catch (error: Error | unknown) {
      logger.error('Failed to fetch user:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * PATCH /user/profile
   * Update current user profile
   */
  @PATCH('/profile')
  async updateUserProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.auth;

      // Validate request body
      const validationResult = UpdateUserProfileSchema.safeParse(request.body);
      if (!validationResult.success) {
        return reply.status(StatusCode.BAD_REQUEST).send({
          success: false,
          error: {
            message: 'Invalid request data',
            code: 'VALIDATION_ERROR',
            details: validationResult.error.errors,
          },
        });
      }

      const updates = validationResult.data;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          userType: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
          country: true,
          timezone: true,
          favoriteGames: true,
          playStyle: true,
          goalType: true,
          weeklyCommitment: true,
          achievementMotivation: true,
          contentTypes: true,
          communicationChannels: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      logger.info(`User profile updated: ${id}`);

      return reply.status(StatusCode.OK).send({
        success: true,
        data: updatedUser,
      });
    } catch (error: Error | unknown) {
      logger.error('Failed to update user profile:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  }

  /**
   * POST /user/:id
   * Get user by ID from auth context
   */
  @POST('/:id')
  async getUserById(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.auth;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          userType: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
          country: true,
          timezone: true,
          favoriteGames: true,
          playStyle: true,
          goalType: true,
          weeklyCommitment: true,
          achievementMotivation: true,
          contentTypes: true,
          communicationChannels: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      });

      if (!user) {
        return reply.status(StatusCode.NOT_FOUND).send({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        });
      }

      return reply.status(StatusCode.OK).send({
        success: true,
        data: user,
      });
    } catch (error: Error | unknown) {
      logger.error('Failed to fetch user:', error);
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
