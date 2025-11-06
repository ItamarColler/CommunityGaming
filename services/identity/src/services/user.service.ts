import { prisma } from '../db/prisma.client';
import bcrypt from 'bcrypt';
import { UserType, type PublicUser } from '@community-gaming/types';

/**
 * User Service
 * Handles all user-related business logic
 */
class UserService {
  /**
   * Check if an email is already registered
   * @param email - Email address to check
   * @returns true if email exists, false otherwise
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Check if a display name is already taken
   * @param displayName - Display name to check
   * @returns true if display name exists, false otherwise
   */
  async isDisplayNameTaken(displayName: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: { displayName },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Check if a username is already taken
   * @param username - Username to check
   * @returns true if username exists, false otherwise
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    return user !== null;
  }

  /**
   * Validate user registration data
   * @param email - Email address
   * @param username - Username
   * @param displayName - Display name (optional)
   * @returns Object with validation result and error message if validation fails
   */
  async validateRegistration(
    email: string,
    username: string,
    displayName?: string
  ): Promise<{ isValid: boolean; error: string }> {
    // Check if email is already taken
    const emailTaken = await this.isEmailTaken(email);
    if (emailTaken) {
      return {
        isValid: false,
        error: 'Email is already registered',
      };
    }

    // Check if username is already taken
    const usernameTaken = await this.isUsernameTaken(username);
    if (usernameTaken) {
      return {
        isValid: false,
        error: 'Username is already taken',
      };
    }

    // Check if display name is already taken (if provided)
    if (displayName) {
      const displayNameTaken = await this.isDisplayNameTaken(displayName);
      if (displayNameTaken) {
        return {
          isValid: false,
          error: 'Display name is already taken',
        };
      }
    }

    return { isValid: true, error: '' };
  }

  /**
   * Create a new user in the database
   * @param email - Email address
   * @param username - Username
   * @param password - Plain text password (will be hashed)
   * @param displayName - Display name (optional)
   * @returns The created user as PublicUser (without password)
   */
  async createUser(
    email: string,
    username: string,
    password: string,
    displayName?: string
  ): Promise<PublicUser> {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user: PublicUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        displayName: displayName || username,
        userType: UserType.PLAYER,
        isVerified: false,
        isActive: true,
        isBanned: false,
        lastLoginAt: new Date(),
      },
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

    return user;
  }
}

// Export singleton instance
export const userService = new UserService();
