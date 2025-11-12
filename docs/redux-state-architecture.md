# Redux State Architecture: Global State vs RTK Query vs Local UI State

## Executive Summary

This document defines what user data belongs in **global Redux state** vs **RTK Query feature caches** vs **local UI state** for the CommunityGaming platform. The goal is to minimize global state bloat while ensuring cross-feature data is readily accessible.

---

## 1. Global State Purpose

### What Belongs in Global Redux State

Global Redux state should contain **only** the minimal data required for:

1. **Authentication & Authorization** - Determining WHO the user is and WHAT they can do
2. **Routing Decisions** - Redirecting based on account state (suspended, onboarding incomplete, etc.)
3. **Cross-Cutting UI Concerns** - Data needed in multiple unrelated features (nav bar, header, permission checks)
4. **Session Management** - Token expiry, authentication status

### What Does NOT Belong in Global State

- **Feature-specific data** - User's communities, match history, creator analytics
- **Detailed profile information** - Bio, social links, badges, statistics
- **Settings & preferences** - Privacy settings, notification preferences, detailed gaming preferences
- **Frequently changing data** - Presence status, realtime matchmaking state
- **Large datasets** - Achievement history, payment records, moderation logs
- **Other users' data** - Always fetched on-demand via RTK Query

### Anti-Patterns to Avoid

❌ **Storing entire User object** - Current implementation stores all `PublicUser` fields globally
❌ **Duplicating RTK Query cache** - Don't replicate data that RTK Query already caches
❌ **Premature optimization** - Don't cache data "just in case" it might be needed
❌ **Mixing concerns** - Keep auth state separate from user profile state

---

## 2. Current State Analysis

### Current Implementation (Problematic)

```typescript
// apps/web/src/features/auth/slice/authSlice.ts
export interface AuthState {
  user: PublicUser | null; // ❌ ENTIRE PublicUser object (30+ fields)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: string | null;
}
```

### Problems with Current Approach

1. **Bloated State** - Stores 30+ fields when only ~10 are needed globally
2. **Stale Data Risk** - If user updates profile in settings, must remember to update Redux
3. **Synchronization Burden** - RTK Query cache and Redux state can drift out of sync
4. **Unnecessary Re-renders** - Changes to favoriteGames trigger re-renders in unrelated components
5. **Poor Scalability** - As User model grows (trust scores, badges, stats), global state grows too

---

## 3. Field Categorization: User Model

### Fields to INCLUDE in Global State

| Field                   | Type                             | Reasoning                                                                                                                        | Frequency                                                                                                    | Scope                |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- | -------- |
| `id`                    | `string (uuid)`                  | **CRITICAL**: Required for all API calls, authorization checks, and identifying the current user across the entire app           | Read-only                                                                                                    | App-wide             |
| `username`              | `string`                         | **HIGH**: Displayed in header, nav bar, chat messages, and used for @mentions throughout the app                                 | Rarely changes                                                                                               | App-wide             |
| `displayName`           | `string                          | null`                                                                                                                            | **HIGH**: Primary display name shown in UI components across features (fallback to username if null)         | Occasionally changes | App-wide |
| `avatar`                | `string (url)                    | null`                                                                                                                            | **HIGH**: Shown in header, nav, quick profile popups, chat messages, and everywhere user identity is visible | Occasionally changes | App-wide |
| `userType`              | `enum (PLAYER, LEADER, SPONSOR)` | **CRITICAL**: Determines feature access (creator tools, sponsor dashboard), routing, and permission gating                       | Rarely changes                                                                                               | App-wide             |
| `isVerified`            | `boolean`                        | **MEDIUM**: May gate certain features (posting, matchmaking), shown with verification badge in nav                               | Changes once                                                                                                 | App-wide             |
| `isActive`              | `boolean`                        | **CRITICAL**: Routing decision - inactive accounts should be redirected to reactivation flow                                     | Admin-controlled                                                                                             | App-wide             |
| `isBanned`              | `boolean`                        | **CRITICAL**: Routing decision - banned users must be immediately blocked from all features                                      | Admin-controlled                                                                                             | App-wide             |
| `onboardingCompleted`\* | `boolean`                        | **CRITICAL**: Routing decision - incomplete onboarding redirects to onboarding flow (not in current User model, should be added) | Changes once                                                                                                 | App-wide             |
| `subscriptionTier`\*    | `enum                            | null`                                                                                                                            | **MEDIUM**: Feature gating for premium features, shown in nav/profile (not in current model, may be added)   | Monthly changes      | App-wide |

**Total: 9-10 fields** (vs current 30+ fields)

\* _Fields marked with asterisk don't exist in current User model but are recommended additions_

---

### Fields to EXCLUDE from Global State (Fetch via RTK Query)

| Field                   | Type       | Why Excluded                                                                                              | Where Needed                                                                              | How to Fetch                        |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| `email`                 | `string`   | **Privacy/Security**: Only needed in settings page, sensitive data shouldn't be in global state           | Settings page, account security                                                           | `identityApi.getUserProfile()`      |
| `oauthProvider`         | `string    | null`                                                                                                     | **Security**: Internal implementation detail, only needed for account linking in settings | Settings > Connected Accounts       | `identityApi.getUserProfile()`                         |
| `oauthId`               | `string    | null`                                                                                                     | **Security**: Internal implementation detail, never displayed to user                     | Settings > Connected Accounts       | `identityApi.getUserProfile()`                         |
| `country`               | `string    | null`                                                                                                     | **Feature-specific**: Only needed for profile editing and matchmaking preferences         | Profile edit, matchmaking settings  | `identityApi.getUserProfile()`                         |
| `timezone`              | `string    | null`                                                                                                     | **Feature-specific**: Only needed for event scheduling and profile display                | Profile page, event creation        | `identityApi.getUserProfile()` (or detect client-side) |
| `favoriteGames`         | `string[]` | **Feature-specific**: Only displayed on profile page, used in matchmaking preferences (not in nav/header) | Profile page, matchmaking setup                                                           | `identityApi.getUserProfile()`      |
| `playStyle`             | `enum      | null`                                                                                                     | **Feature-specific**: Only relevant for matchmaking and profile display                   | Profile page, matchmaking           | `identityApi.getUserProfile()`                         |
| `goalType`              | `enum      | null`                                                                                                     | **Feature-specific**: Onboarding data, only displayed on profile page                     | Profile page, onboarding flow       | `identityApi.getUserProfile()`                         |
| `weeklyCommitment`      | `number    | null`                                                                                                     | **Feature-specific**: Matchmaking preference, not needed app-wide                         | Matchmaking settings, profile       | `identityApi.getUserProfile()`                         |
| `achievementMotivation` | `enum      | null`                                                                                                     | **Feature-specific**: Onboarding data, only used for recommendations                      | Profile page, recommendation engine | `identityApi.getUserProfile()`                         |
| `contentTypes`          | `enum[]`   | **Feature-specific**: Discovery preferences, only needed in feed/discovery features                       | Discovery settings, feed preferences                                                      | `identityApi.getUserPreferences()`  |
| `communicationChannels` | `enum[]`   | **Feature-specific**: Communication preferences, only needed in settings                                  | Settings > Notifications                                                                  | `identityApi.getUserPreferences()`  |
| `createdAt`             | `Date`     | **Informational**: Only displayed on profile page ("Member since...")                                     | Profile page, admin tools                                                                 | `identityApi.getUserProfile()`      |
| `updatedAt`             | `Date`     | **Internal**: Timestamp for data consistency, not displayed to users                                      | Admin tools, debugging                                                                    | `identityApi.getUserProfile()`      |
| `lastLoginAt`           | `Date      | null`                                                                                                     | **Security**: Only shown in settings > security page                                      | Settings > Security & Sessions      | `identityApi.getUserProfile()`                         |

**Total: 15+ fields excluded**

---

### Role-Specific Profiles (ALWAYS Exclude from Global State)

| Profile Type     | Fields                                                                                                                        | Why Excluded                                                                          | How to Fetch                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| `GamerProfile`   | currentRank, preferredGameModes, shortTermGoal, longTermVision, willingToMentor, shareAchievements                            | **Feature-specific**: Heavy data only needed on profile page and matchmaking          | `identityApi.getGamerProfile(userId)`   |
| `LeaderProfile`  | communityName, genreFocus, memberSizeGoal, missionIntent, collaborationOpenness, incentiveSystem, desiredMetrics, platforms[] | **Feature-specific**: Creator-only data, only needed in creator dashboard and profile | `identityApi.getLeaderProfile(userId)`  |
| `SponsorProfile` | brandName, category, targetAudience[], objective, budgetRange, preferredPartnerTypes[], conversionMetrics[]                   | **Feature-specific**: Sponsor-only data, only needed in sponsor dashboard             | `identityApi.getSponsorProfile(userId)` |

**Reasoning**: These are 20-30 additional fields per role that are:

- Only accessed in specific feature pages
- Not needed for auth/routing decisions
- User-type specific (most users won't have all three profiles)
- Change more frequently than core identity data

---

## 4. Proposed Global State Structure

### Minimal Auth Slice

```typescript
// Proposed: apps/web/src/features/auth/slice/authSlice.ts

/**
 * Minimal user identity for global state
 * Contains ONLY data needed for auth, routing, and cross-cutting UI
 */
export interface CurrentUserIdentity {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  userType: UserType; // PLAYER | LEADER | SPONSOR
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  // Future additions:
  // onboardingCompleted: boolean;
  // subscriptionTier: SubscriptionTier | null;
  // trustLevel: number; (if implementing trust system)
}

/**
 * Auth state - separated concerns
 */
export interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Session metadata
  sessionExpiresAt: string | null;

  // Minimal user identity (9-10 fields only)
  currentUser: CurrentUserIdentity | null;
}
```

### Global Selectors

```typescript
// apps/web/src/features/auth/slice/authSelectors.ts

import { RootState } from '@/lib/redux/store';
import { CurrentUserIdentity } from './authSlice';

// ============================================
// AUTHENTICATION SELECTORS
// ============================================

export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;

export const selectAuthLoading = (state: RootState): boolean => state.auth.isLoading;

export const selectAuthError = (state: RootState): string | null => state.auth.error;

// ============================================
// CURRENT USER IDENTITY SELECTORS
// ============================================

export const selectCurrentUser = (state: RootState): CurrentUserIdentity | null =>
  state.auth.currentUser;

export const selectCurrentUserId = (state: RootState): string | null =>
  state.auth.currentUser?.id ?? null;

export const selectCurrentUsername = (state: RootState): string | null =>
  state.auth.currentUser?.username ?? null;

export const selectCurrentUserDisplayName = (state: RootState): string | null =>
  state.auth.currentUser?.displayName ?? state.auth.currentUser?.username ?? null;

export const selectCurrentUserAvatar = (state: RootState): string | null =>
  state.auth.currentUser?.avatar ?? null;

// ============================================
// AUTHORIZATION SELECTORS
// ============================================

export const selectUserType = (state: RootState): UserType | null =>
  state.auth.currentUser?.userType ?? null;

export const selectIsPlayer = (state: RootState): boolean =>
  state.auth.currentUser?.userType === UserType.PLAYER;

export const selectIsLeader = (state: RootState): boolean =>
  state.auth.currentUser?.userType === UserType.LEADER;

export const selectIsSponsor = (state: RootState): boolean =>
  state.auth.currentUser?.userType === UserType.SPONSOR;

export const selectIsVerified = (state: RootState): boolean =>
  state.auth.currentUser?.isVerified ?? false;

// ============================================
// ACCOUNT STATUS SELECTORS (for routing)
// ============================================

export const selectIsAccountActive = (state: RootState): boolean =>
  state.auth.currentUser?.isActive ?? false;

export const selectIsAccountBanned = (state: RootState): boolean =>
  state.auth.currentUser?.isBanned ?? false;

export const selectShouldRedirectToOnboarding = (state: RootState): boolean => {
  const user = state.auth.currentUser;
  if (!user) return false;
  // Future: return !user.onboardingCompleted;
  return false; // Placeholder
};

// ============================================
// SESSION SELECTORS
// ============================================

export const selectSessionExpiresAt = (state: RootState): string | null =>
  state.auth.sessionExpiresAt;

export const selectIsSessionExpired = (state: RootState): boolean => {
  const expiresAt = state.auth.sessionExpiresAt;
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
};
```

---

## 5. RTK Query Feature Caches

### Identity API Endpoints

```typescript
// apps/web/src/lib/redux/api/identityApi.ts

import { baseApi } from './baseApi';
import {
  PublicUser,
  UpdateUserProfile,
  GamerProfile,
  LeaderProfile,
  SponsorProfile,
  CreateGamerProfile,
  UpdateGamerProfile,
  // ... other types
} from '@community-gaming/types';

/**
 * Identity API - User profile and preferences
 * Injects endpoints into baseApi for automatic caching
 */
export const identityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // USER PROFILE ENDPOINTS
    // ============================================

    /**
     * Get full user profile (all fields)
     * Cache time: 5 minutes
     * Used in: Profile page, settings page
     */
    getUserProfile: builder.query<PublicUser, string>({
      query: (userId) => `/identity/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Get current user's profile (uses 'me' endpoint)
     * Cache time: 5 minutes
     * Used in: Profile edit, settings
     */
    getMyProfile: builder.query<PublicUser, void>({
      query: () => '/identity/users/me',
      providesTags: ['User', 'Auth'],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Update current user's profile
     * Invalidates: User cache, triggers re-fetch
     * Also updates global Redux state for changed identity fields
     */
    updateUserProfile: builder.mutation<PublicUser, UpdateUserProfile>({
      query: (data) => ({
        url: '/identity/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
      // Optimistically update global state if identity fields changed
      async onQueryStarted(updateData, { dispatch, queryFulfilled }) {
        try {
          const { data: updatedUser } = await queryFulfilled;

          // If identity fields changed (username, displayName, avatar, etc.),
          // update global Redux state
          if (updateData.displayName || updateData.avatar) {
            // Dispatch action to update auth.currentUser
            // dispatch(updateCurrentUserIdentity(updatedUser));
          }
        } catch {
          // Handle error
        }
      },
    }),

    // ============================================
    // ROLE-SPECIFIC PROFILE ENDPOINTS
    // ============================================

    /**
     * Get gamer profile
     * Cache time: 10 minutes (changes infrequently)
     */
    getGamerProfile: builder.query<GamerProfile, string>({
      query: (userId) => `/identity/users/${userId}/gamer-profile`,
      providesTags: (result, error, userId) => [{ type: 'User', id: `${userId}-gamer` }],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    /**
     * Update current user's gamer profile
     */
    updateGamerProfile: builder.mutation<GamerProfile, UpdateGamerProfile>({
      query: (data) => ({
        url: '/identity/users/me/gamer-profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    /**
     * Get leader profile
     * Cache time: 10 minutes
     */
    getLeaderProfile: builder.query<LeaderProfile, string>({
      query: (userId) => `/identity/users/${userId}/leader-profile`,
      providesTags: (result, error, userId) => [{ type: 'User', id: `${userId}-leader` }],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    /**
     * Get sponsor profile
     * Cache time: 10 minutes
     */
    getSponsorProfile: builder.query<SponsorProfile, string>({
      query: (userId) => `/identity/users/${userId}/sponsor-profile`,
      providesTags: (result, error, userId) => [{ type: 'User', id: `${userId}-sponsor` }],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    // ============================================
    // USER PREFERENCES ENDPOINTS
    // ============================================

    /**
     * Get user preferences (contentTypes, communicationChannels, etc.)
     * Cache time: 5 minutes
     * Used in: Settings > Preferences, Discovery feed configuration
     */
    getUserPreferences: builder.query<
      Pick<PublicUser, 'contentTypes' | 'communicationChannels'>,
      void
    >({
      query: () => '/identity/users/me/preferences',
      providesTags: ['User'],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Update user preferences
     */
    updateUserPreferences: builder.mutation<
      void,
      { contentTypes?: string[]; communicationChannels?: string[] }
    >({
      query: (data) => ({
        url: '/identity/users/me/preferences',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUserProfileQuery,
  useGetMyProfileQuery,
  useUpdateUserProfileMutation,
  useGetGamerProfileQuery,
  useUpdateGamerProfileMutation,
  useGetLeaderProfileQuery,
  useGetSponsorProfileQuery,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = identityApi;
```

### Cache Invalidation Strategy

| Action                    | Invalidates        | Reasoning                                                                     |
| ------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| User updates profile      | `['User', 'Auth']` | Profile data changed, global state may need update if identity fields changed |
| User changes preferences  | `['User']`         | Preferences changed, re-fetch on next access                                  |
| User completes onboarding | `['User', 'Auth']` | Profile created, global state needs onboardingCompleted flag                  |
| Admin bans user           | `['User', 'Auth']` | Account status changed, global state must update immediately                  |
| User uploads avatar       | `['User', 'Auth']` | Identity field changed, update global state                                   |

---

## 6. Local UI State (React useState/useReducer)

### What Belongs in Local State

| State Type              | Examples                                          | Reasoning                                   |
| ----------------------- | ------------------------------------------------- | ------------------------------------------- |
| **Form inputs**         | Username field value, bio textarea                | Transient, only needed in current component |
| **Modal/dialog state**  | isProfileEditModalOpen, isDeleteAccountDialogOpen | Component-specific, not needed elsewhere    |
| **Tab/accordion state** | activeTab, expandedSection                        | UI-only, resets on unmount                  |
| **Temporary filters**   | searchQuery, sortBy, filterByGame                 | Feature-specific, doesn't persist           |
| **Draft content**       | Draft message, unsaved profile edits              | Temporary, discarded on cancel              |
| **Loading states**      | isUploadingAvatar (if not using RTK Query)        | Ephemeral, specific to one operation        |
| **Validation errors**   | formErrors, fieldErrors                           | Transient, cleared on success               |

### When to Use Local State

1. ✅ Data only needed in one component tree
2. ✅ Data doesn't need to persist across navigation
3. ✅ Data resets/clears when component unmounts
4. ✅ No other features need access to this data
5. ✅ Performance benefits from avoiding Redux re-renders

---

## 7. Migration Strategy

### Phase 1: Create Minimal Identity Type

1. Create `CurrentUserIdentity` interface with 9-10 fields
2. Add migration helper to map `PublicUser` → `CurrentUserIdentity`
3. Update `authSlice.ts` to use new interface

### Phase 2: Update Selectors

1. Create new selector file with granular selectors
2. Update all components to use new selectors
3. Deprecate old `selectUser` selector

### Phase 3: Implement RTK Query Endpoints

1. Create `identityApi.ts` with profile endpoints
2. Update profile page to use `useGetMyProfileQuery`
3. Update settings page to use `useUpdateUserProfileMutation`

### Phase 4: Synchronization

1. When identity fields update (username, avatar, displayName), dispatch action to update `auth.currentUser`
2. Use `onQueryStarted` in RTK Query mutations for optimistic updates
3. Add middleware to sync certain RTK Query cache updates to Redux

### Phase 5: Cleanup

1. Remove full `PublicUser` from auth state
2. Remove localStorage caching of full user object
3. Update tests to use new structure

---

## 8. Benefits of This Architecture

### Performance

- **Smaller Redux state** - 9-10 fields vs 30+ fields = ~70% reduction
- **Fewer re-renders** - Changes to favoriteGames don't trigger header re-render
- **Better code splitting** - Profile-heavy code only loads on profile page

### Maintainability

- **Clear boundaries** - Auth state vs profile data vs preferences
- **Easier debugging** - Smaller state tree, clearer data flow
- **Reduced coupling** - Components depend on specific selectors, not entire user object

### Data Consistency

- **Single source of truth** - RTK Query cache for profile data
- **Automatic re-fetching** - Stale data automatically refreshed
- **Cache invalidation** - Mutations automatically invalidate related queries

### Developer Experience

- **Explicit dependencies** - Component declares exactly what data it needs via hooks
- **Type safety** - TypeScript knows exactly what fields are available where
- **Discoverability** - Clear API: `useGetMyProfileQuery()` vs digging through Redux

---

## 9. Decision Matrix: Where Does Data Belong?

Use this flowchart to decide where data belongs:

```
┌─────────────────────────────────────┐
│ Is this data needed for auth/       │
│ routing/cross-cutting UI concerns?  │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
              ▼
  ┌───────────────────────────┐
  │ Store in GLOBAL REDUX     │
  │ (auth.currentUser)        │
  └───────────────────────────┘


         ┌────┴────┐
         │   NO    │
         └────┬────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Is this data used across multiple   │
│ features or persisted via API?      │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
              ▼
  ┌───────────────────────────┐
  │ Fetch via RTK QUERY       │
  │ (identityApi, etc.)       │
  └───────────────────────────┘


         ┌────┴────┐
         │   NO    │
         └────┬────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Is this data component-specific or  │
│ transient (forms, modals, drafts)?  │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
              ▼
  ┌───────────────────────────┐
  │ Use LOCAL STATE           │
  │ (useState/useReducer)     │
  └───────────────────────────┘
```

---

## 10. Examples in Practice

### Example 1: Rendering User in Header

**Component**: `apps/web/src/components/Header/UserMenu.tsx`

```typescript
import { useAppSelector } from '@/lib/redux/hooks';
import {
  selectCurrentUserDisplayName,
  selectCurrentUserAvatar,
  selectIsVerified,
} from '@/features/auth/slice/authSelectors';

export function UserMenu() {
  // Pull from global Redux - always available, no loading state
  const displayName = useAppSelector(selectCurrentUserDisplayName);
  const avatar = useAppSelector(selectCurrentUserAvatar);
  const isVerified = useAppSelector(selectIsVerified);

  return (
    <div>
      <Avatar src={avatar} />
      <span>{displayName}</span>
      {isVerified && <VerifiedBadge />}
    </div>
  );
}
```

**Why global state?** Header is cross-cutting UI, needs immediate access without loading states.

---

### Example 2: Editing Profile Page

**Component**: `apps/web/src/app/profile/edit/page.tsx`

```typescript
import { useGetMyProfileQuery, useUpdateUserProfileMutation } from '@/lib/redux/api/identityApi';

export function ProfileEditPage() {
  // Fetch full profile data (30+ fields) via RTK Query
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

  // Local form state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    favoriteGames: [],
    // ... other fields
  });

  // Populate form when data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        favoriteGames: profile.favoriteGames || [],
        // ... other fields
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    await updateProfile(formData);
    // RTK Query will:
    // 1. Invalidate cache
    // 2. Trigger re-fetch
    // 3. Update global Redux if displayName/avatar changed (via onQueryStarted)
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

**Why RTK Query?** Profile page needs full user data, but it's feature-specific. RTK Query provides caching, loading states, and automatic invalidation.

---

### Example 3: Authorization Check

**Component**: `apps/web/src/features/creator-dashboard/CreatorDashboard.tsx`

```typescript
import { useAppSelector } from '@/lib/redux/hooks';
import { selectIsLeader, selectIsVerified } from '@/features/auth/slice/authSelectors';
import { Navigate } from 'next/navigation';

export function CreatorDashboard() {
  const isLeader = useAppSelector(selectIsLeader);
  const isVerified = useAppSelector(selectIsVerified);

  // Auth check using global state
  if (!isLeader) {
    return <Navigate to="/upgrade-to-leader" />;
  }

  if (!isVerified) {
    return <VerifyEmailPrompt />;
  }

  // Fetch creator-specific data via RTK Query
  const { data: leaderProfile } = useGetLeaderProfileQuery();

  return <div>{/* Creator dashboard */}</div>;
}
```

**Why global state for auth check?** Immediate access, no loading state, consistent across app.

**Why RTK Query for leader profile?** Feature-specific data (20+ fields), only needed in creator features.

---

## 11. Summary Table

| Data Category     | Storage Location | Example Fields                                  | Access Pattern                      | Cache Duration |
| ----------------- | ---------------- | ----------------------------------------------- | ----------------------------------- | -------------- |
| **Identity**      | Global Redux     | id, username, displayName, avatar, userType     | `useAppSelector(selectCurrentUser)` | Until logout   |
| **Authorization** | Global Redux     | isVerified, isBanned, isActive, userType        | `useAppSelector(selectIsLeader)`    | Until logout   |
| **Full Profile**  | RTK Query Cache  | email, favoriteGames, playStyle, goalType, etc. | `useGetMyProfileQuery()`            | 5 minutes      |
| **Role Profiles** | RTK Query Cache  | GamerProfile, LeaderProfile, SponsorProfile     | `useGetGamerProfileQuery(userId)`   | 10 minutes     |
| **Preferences**   | RTK Query Cache  | contentTypes, communicationChannels             | `useGetUserPreferencesQuery()`      | 5 minutes      |
| **Form Inputs**   | Local State      | Draft bio, unsaved changes                      | `useState()`                        | Until unmount  |
| **UI State**      | Local State      | Modal open, active tab                          | `useState()`                        | Until unmount  |

---

## 12. Key Takeaways

1. **Global Redux**: Only 9-10 identity fields for auth, routing, and cross-cutting UI
2. **RTK Query**: All profile data, preferences, and role-specific information
3. **Local State**: Transient UI state, forms, modals
4. **Single Source of Truth**: RTK Query cache for profile data, not Redux
5. **Synchronization**: Update global Redux only when identity fields change (username, avatar, displayName)
6. **Performance**: 70% reduction in global state size, fewer re-renders
7. **Maintainability**: Clear boundaries, explicit dependencies, better DX

---

## 13. Next Steps

1. **Review**: Validate this architecture with team
2. **Prototype**: Implement `CurrentUserIdentity` interface
3. **Migrate**: Phase 1-5 migration strategy
4. **Document**: Update component patterns and best practices
5. **Monitor**: Track performance improvements and bundle size

---

**Document Version**: 1.0
**Last Updated**: 2025-11-12
**Author**: Architecture Team
**Status**: Proposed
