import { UserType } from '@community-gaming/types';

/**
 * Minimal user identity for global Redux state
 *
 * Contains ONLY data needed for:
 * - Authentication & Authorization
 * - Routing Decisions
 * - Cross-Cutting UI Concerns (header, nav, chat)
 * - Session Management
 *
 * All other user data should be fetched via RTK Query on-demand
 */
export interface CurrentUserIdentity {
  /** User's unique identifier - Required for all API calls and authorization checks */
  id: string;

  /** Unique username - Displayed in header, nav bar, chat messages, @mentions */
  username: string;

  /** Display name (fallback to username if null) - Primary display name across app */
  displayName: string | null;

  /** Avatar URL - Shown in header, nav, quick profile popups, chat messages */
  avatar: string | null;

  /** User type - Determines feature access (creator tools, sponsor dashboard), routing, permission gating */
  userType: UserType;

  /** Email verified status - May gate certain features (posting, matchmaking), shown with verification badge */
  isVerified: boolean;

  /** Account active status - Routing decision: inactive accounts redirected to reactivation flow */
  isActive: boolean;

  /** Account banned status - Routing decision: banned users blocked from all features */
  isBanned: boolean;

  // Future additions (uncomment when backend supports):
  // /** Onboarding completed - Routing decision: incomplete onboarding redirects to onboarding flow */
  // onboardingCompleted: boolean;

  // /** Subscription tier - Feature gating for premium features, shown in nav/profile */
  // subscriptionTier: SubscriptionTier | null;

  // /** Trust level - If implementing trust/reputation system */
  // trustLevel: number;
}

/**
 * Type guard to check if a partial object has all required CurrentUserIdentity fields
 */
export function isCurrentUserIdentity(
  identity: Partial<CurrentUserIdentity>
): identity is CurrentUserIdentity {
  return (
    typeof identity.id === 'string' &&
    typeof identity.username === 'string' &&
    (identity.displayName === null || typeof identity.displayName === 'string') &&
    (identity.avatar === null || typeof identity.avatar === 'string') &&
    typeof identity.userType === 'string' &&
    typeof identity.isVerified === 'boolean' &&
    typeof identity.isActive === 'boolean' &&
    typeof identity.isBanned === 'boolean'
  );
}
