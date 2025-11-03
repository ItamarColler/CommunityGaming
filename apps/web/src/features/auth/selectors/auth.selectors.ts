import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/redux/store';

/**
 * Base selector - get auth state
 */
const selectAuthState = (state: RootState) => state.auth;

/**
 * Select current user
 */
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

/**
 * Select authentication status
 */
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

/**
 * Select loading state
 */
export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

/**
 * Select error state
 */
export const selectError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

/**
 * Select session expiration timestamp
 */
export const selectSessionExpiresAt = createSelector(
  [selectAuthState],
  (auth) => auth.sessionExpiresAt
);

/**
 * Check if session is expired
 */
export const selectIsSessionExpired = createSelector(
  [selectSessionExpiresAt],
  (expiresAt) => {
    if (!expiresAt) return true;
    return new Date(expiresAt) < new Date();
  }
);

/**
 * Select user ID (common use case)
 */
export const selectUserId = createSelector(
  [selectUser],
  (user) => user?.id ?? null
);

/**
 * Select user display information
 */
export const selectUserDisplayInfo = createSelector([selectUser], (user) => {
  if (!user) return null;
  return {
    displayName: user.displayName || user.username,
    username: user.username,
    avatar: user.avatar,
  };
});

/**
 * Combined selector for auth UI state
 * Useful for components that need multiple auth values
 */
export const selectAuthUIState = createSelector(
  [selectIsAuthenticated, selectIsLoading, selectError, selectUserDisplayInfo],
  (isAuthenticated, isLoading, error, userDisplay) => ({
    isAuthenticated,
    isLoading,
    error,
    userDisplay,
  })
);
