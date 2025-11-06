import type { FastifyReply, FastifyRequest } from 'fastify';
import { createLogger } from '@community-gaming/utils';
import { prisma } from '../db/prisma.client';
import { RegisterRequestSchema, StatusCode, type RegisterResponse } from '@community-gaming/types';
import { userService } from '../services/user.service';
import type { AuthenticatedRequest } from '../types/request';

const logger = createLogger('user-controller');

export async function getUserByIdController(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const { auth } = request.body;
    const userId = auth.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    console.error('Failed to fetch user:', error);
    return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}

export async function getUserCountController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const count = await prisma.user.count();
    return reply.send({ count });
  } catch (error: Error | unknown) {
    console.error('Failed to count users:', error);
    return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
      error: 'Internal server error',
      message: 'Failed to retrieve user count',
    });
  }
}

export async function registerController(request: FastifyRequest, reply: FastifyReply ) {
  try {
    // Validate request body
    const validation = RegisterRequestSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(StatusCode.BAD_REQUEST).send({
        success: false,
        error: {
          message: validation.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      } satisfies RegisterResponse);
    }

    const { email, username, password, displayName } = validation.data;

    // Validate registration (check email and username availability)
    const registrationValidation = await userService.validateRegistration(
      email,
      username,
      displayName || undefined
    );

    if (!registrationValidation.isValid) {
      return reply.status(StatusCode.CONFLICT).send({
        success: false,
        error: {
          message: registrationValidation.error,
          code: 'CONFLICT',
        },
      } satisfies RegisterResponse);
    }

    // Create the user
    const newUser = await userService.createUser(email, username, password, displayName || undefined);

    logger.info('User registration successful', {
      userId: newUser.id,
      email,
      username,
    });

    // Return success with user data
    return reply.status(StatusCode.CREATED).send({
      success: true,
      data: {
        user: newUser,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
    } satisfies RegisterResponse);
  } catch (error: Error | unknown) {
    logger.error('Failed to register user:', error);
    return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        message: 'An unexpected error occurred during registration',
        code: 'INTERNAL_ERROR',
      },
    } satisfies RegisterResponse);
  }
}
