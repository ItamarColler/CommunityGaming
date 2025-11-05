import type { FastifyReply, FastifyRequest } from 'fastify';
import { createLogger } from '@community-gaming/utils';
import { prisma } from '../db/prisma.client';
import { RegisterRequestSchema, StatusCode } from '@community-gaming/types';
import { validateRegistration } from '../services/user.service';

const logger = createLogger('user-controller');

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
      });
    }

    const { email, username, displayName } = validation.data;

    // Validate registration (check email and display name availability)
    const registrationValidation = await validateRegistration(
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
      });
    }

    // Log user creation (actual creation pending implementation)
    logger.info('User registration validation successful', {
      email,
      username,
      displayName: displayName || null,
    });

    // If validation passes, return success
    // Note: Actual user creation will be implemented in a future step
    return reply.status(StatusCode.OK).send({
      success: true,
      message: 'Validation passed - user creation pending implementation',
      data: {
        email,
        username,
        displayName: displayName || null,
      },
    });
  } catch (error: Error | unknown) {
    console.error('Failed to register user:', error);
    return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: {
        message: 'An unexpected error occurred during registration',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
