import { PublicUser } from '@community-gaming/types';
import { CurrentUserIdentity } from '../types/identity';

/**
 * Type-safe mapping from PublicUser to CurrentUserIdentity
 *
 * Extracts only the minimal fields needed for global state:
 * - Authentication & Authorization
 * - Routing Decisions
 * - Cross-Cutting UI (header, nav, chat)
 *
 * All other fields should be fetched via RTK Query on-demand
 *
 * @param user - Full PublicUser object from API
 * @returns CurrentUserIdentity - Minimal identity for global state
 *
 * @example
 * ```typescript
 * const publicUser: PublicUser = await fetchUser();
 * const identity: CurrentUserIdentity = mapUserToIdentity(publicUser);
 * dispatch(setCurrentUser(identity));
 * ```
 */
export function mapUserToIdentity(user: PublicUser): CurrentUserIdentity {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName ?? null, // Normalize undefined to null
    avatar: user.avatar ?? null, // Normalize undefined to null
    userType: user.userType,
    isVerified: user.isVerified,
    isActive: user.isActive,
    isBanned: user.isBanned,
    // Future fields (uncomment when backend supports):
    // onboardingCompleted: user.onboardingCompleted,
    // subscriptionTier: user.subscriptionTier,
    // trustLevel: user.trustLevel,
  };
}

/**
 * Create a partial identity update object from profile update data
 *
 * Used when updating identity fields (username, displayName, avatar) via profile mutations
 * to sync changes to global Redux state
 *
 * @param updatedUser - Updated PublicUser from mutation response
 * @param changedFields - Array of field names that were changed
 * @returns Partial<CurrentUserIdentity> with only changed identity fields
 *
 * @example
 * ```typescript
 * // In RTK Query mutation's onQueryStarted:
 * const { data: updatedUser } = await queryFulfilled;
 * const identityUpdate = createIdentityUpdate(updatedUser, ['displayName', 'avatar']);
 * dispatch(updateCurrentUserIdentity(identityUpdate));
 * ```
 */
export function createIdentityUpdate(
  updatedUser: PublicUser,
  changedFields: (keyof PublicUser)[]
): Partial<CurrentUserIdentity> {
  const update: Record<string, unknown> = {};

  // Only include changed fields that are part of CurrentUserIdentity
  const identityFields: (keyof CurrentUserIdentity)[] = [
    'id',
    'username',
    'displayName',
    'avatar',
    'userType',
    'isVerified',
    'isActive',
    'isBanned',
  ];

  for (const field of changedFields) {
    if (identityFields.includes(field as keyof CurrentUserIdentity)) {
      const identityField = field as keyof CurrentUserIdentity;
      update[identityField] = updatedUser[identityField];
    }
  }

  return update as Partial<CurrentUserIdentity>;
}
