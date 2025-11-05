import { prisma } from '../db/prisma.client';

/**
 * Check if an email is already registered
 * @param email - Email address to check
 * @returns true if email exists, false otherwise
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    return user !== null;
  } catch (error) {
    throw new Error('Failed to check email availability');
  }
}

/**
 * Check if a display name is already taken
 * @param displayName - Display name to check
 * @returns true if display name exists, false otherwise
 */
export async function isDisplayNameTaken(displayName: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: { displayName },
      select: { id: true },
    });
    return user !== null;
  } catch (error) {
    throw new Error('Failed to check display name availability');
  }
}

/**
 * Check if a username is already taken
 * @param username - Username to check
 * @returns true if username exists, false otherwise
 */
export async function isUsernameTaken(username: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    return user !== null;
  } catch (error) {
    throw new Error('Failed to check username availability');
  }
}

/**
 * Validate user registration data
 * @param email - Email address
 * @param username - Username
 * @param displayName - Display name (optional)
 * @returns Object with validation result and error message if validation fails
 */
export async function validateRegistration(
  email: string,
  username: string,
  displayName?: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    // Check if email is already taken
    const emailTaken = await isEmailTaken(email);
    if (emailTaken) {
      return {
        isValid: false,
        error: 'Email is already registered',
      };
    }

    // Check if username is already taken
    const usernameTaken = await isUsernameTaken(username);
    if (usernameTaken) {
      return {
        isValid: false,
        error: 'Username is already taken',
      };
    }

    // Check if display name is already taken (if provided)
    if (displayName) {
      const displayNameTaken = await isDisplayNameTaken(displayName);
      if (displayNameTaken) {
        return {
          isValid: false,
          error: 'Display name is already taken',
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    throw error;
  }
}
