import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, POST } from 'fastify-decorators';
import { createLogger } from '@community-gaming/utils';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  StatusCode,
  type RegisterResponse,
  LoginResponse,
} from '@community-gaming/types';
import { userService } from '../services/user.service';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

const logger = createLogger('auth-controller');

@Controller('/auth')
export default class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  @POST('/register')
  async register(request: FastifyRequest, reply: FastifyReply) {
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
      const newUser = await userService.createUser(
        email,
        username,
        password,
        displayName || undefined
      );

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

  /**
   * POST /auth/login
   * Login a user
   */
  @POST('/login')
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Validate request body
      const validation = LoginRequestSchema.safeParse(request.body);

      if (!validation.success) {
        return reply.status(StatusCode.BAD_REQUEST).send({
          success: false,
          error: {
            message: validation.error.errors[0].message,
            code: 'VALIDATION_ERROR',
          },
        } satisfies LoginResponse);
      }

      const { email, password } = validation.data;

      // Find user by email
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        } satisfies LoginResponse);
      }

      // Verify password
      const isPasswordValid = await userService.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return reply.status(StatusCode.UNAUTHORIZED).send({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        } satisfies LoginResponse);
      }

      // Check if user is active and not banned
      if (!user.isActive || user.isBanned) {
        return reply.status(StatusCode.FORBIDDEN).send({
          success: false,
          error: {
            message: 'Account is inactive or banned',
            code: 'ACCOUNT_INACTIVE',
          },
        } satisfies LoginResponse);
      }

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiresIn } as jwt.SignOptions
      );

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      logger.info('User login successful', {
        userId: user.id,
        email: user.email,
      });

      // Return success with user data and tokens
      const response: LoginResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            userType: user.userType,
            isVerified: user.isVerified,
            isActive: user.isActive,
            isBanned: user.isBanned,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt,
            token: accessToken,
            refreshToken: refreshToken,
          },
          expiresAt,
        },
      };

      return reply.status(StatusCode.OK).send(response);
    } catch (error: Error | unknown) {
      logger.error('Failed to login user:', error);
      return reply.status(StatusCode.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: {
          message: 'An unexpected error occurred during login',
          code: 'INTERNAL_ERROR',
        },
      } satisfies LoginResponse);
    }
  }
}
