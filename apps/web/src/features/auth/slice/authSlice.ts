import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services';
import { PublicUser, type LoginRequest } from '@community-gaming/types';
import { CurrentUserIdentity, isCurrentUserIdentity } from '../types/identity';
import { mapUserToIdentity } from '../utils/mapUserToIdentity';

/**
 * Auth state for global Redux store
 *
 * Separated concerns:
 * - Authentication status & session metadata
 * - Minimal user identity (9-10 fields only)
 *
 * Full user profile data should be fetched via RTK Query on-demand
 */
export interface AuthState {
  /** Minimal user identity - Only fields needed for auth, routing, and cross-cutting UI */
  currentUser: CurrentUserIdentity | null;

  /** Authentication status */
  isAuthenticated: boolean;

  /** Loading state for async operations */
  isLoading: boolean;

  /** Error message */
  error: string | null;

  /** Session expiration timestamp */
  sessionExpiresAt: string | null;
}

// LocalStorage keys
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const AUTH_EXPIRES_KEY = 'auth_expires';

// LocalStorage helpers (client-side only)
/**
 * Load auth state from localStorage
 * Only stores CurrentUserIdentity (9-10 fields), not full PublicUser
 */
const loadAuthFromStorage = (): Partial<AuthState> => {
  // Only run in browser
  if (typeof window === 'undefined') return {};

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    const expiresAt = localStorage.getItem(AUTH_EXPIRES_KEY);

    if (!token || !userStr || !expiresAt) {
      return {};
    }

    // Check if session has expired
    if (new Date(expiresAt) < new Date()) {
      clearAuthFromStorage();
      return {};
    }

    const parsedUser = JSON.parse(userStr);

    // Validate that it's a CurrentUserIdentity
    // Handle migration from old PublicUser format
    let currentUser: CurrentUserIdentity;

    if (isCurrentUserIdentity(parsedUser)) {
      currentUser = parsedUser;
    } else if (parsedUser && typeof parsedUser === 'object' && 'id' in parsedUser) {
      // Migrate from old PublicUser format to CurrentUserIdentity
      console.warn('Migrating localStorage from PublicUser to CurrentUserIdentity');
      currentUser = mapUserToIdentity(parsedUser as PublicUser);
      // Save migrated format
      saveAuthToStorage(currentUser, expiresAt);
    } else {
      // Invalid data, clear storage
      clearAuthFromStorage();
      return {};
    }

    return {
      currentUser,
      isAuthenticated: true,
      sessionExpiresAt: expiresAt,
    };
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
    clearAuthFromStorage();
    return {};
  }
};

/**
 * Save auth state to localStorage
 * Only stores CurrentUserIdentity (9-10 fields), not full PublicUser
 */
const saveAuthToStorage = (currentUser: CurrentUserIdentity, expiresAt: string, token?: string) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt);
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
};

const clearAuthFromStorage = () => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_EXPIRES_KEY);
  } catch (error) {
    console.error('Failed to clear auth from storage:', error);
  }
};

// Get auth token for API requests
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Initial state - load from localStorage if available
const storedAuth = loadAuthFromStorage();
const initialState: AuthState = {
  currentUser: storedAuth.currentUser || null,
  isAuthenticated: storedAuth.isAuthenticated || false,
  isLoading: false,
  error: null,
  sessionExpiresAt: storedAuth.sessionExpiresAt || null,
};

/**
 * Async thunk: Sign in with credentials
 * Makes API call and stores user in Redux state
 * Session token stored in httpOnly cookie by API route
 */
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.signIn(credentials);

      if (!response.success) {
        return rejectWithValue(response.error?.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign in failed');
    }
  }
);

/**
 * Async thunk: Refresh session
 * Validates current session and refreshes if valid
 * Used for session continuity across page loads
 */
export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshSession();

      if (!response.success || !response.data) {
        return rejectWithValue(response.error?.message || 'Session refresh failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Session refresh failed');
    }
  }
);

/**
 * Async thunk: Sign out
 * Clears Redux state and httpOnly cookie via API
 */
export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.signOut();

    if (!response.success) {
      return rejectWithValue('Sign out failed');
    }

    return;
  } catch (error) {
    // Even if API call fails, clear local state
    return;
  }
});

/**
 * Auth slice
 * Manages authentication state and handles async thunk lifecycle
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set current user identity
     * Accepts either CurrentUserIdentity or PublicUser (backward compatibility)
     * Used during SSR hydration
     */
    setCurrentUser: (state, action: PayloadAction<CurrentUserIdentity | PublicUser | null>) => {
      if (!action.payload) {
        state.currentUser = null;
        state.isAuthenticated = false;
      } else {
        // Check if it's already CurrentUserIdentity or needs mapping from PublicUser
        if (isCurrentUserIdentity(action.payload)) {
          state.currentUser = action.payload;
        } else {
          // Map from PublicUser to CurrentUserIdentity
          state.currentUser = mapUserToIdentity(action.payload as PublicUser);
        }
        state.isAuthenticated = true;
      }
    },

    /**
     * Update specific identity fields
     * Used when profile mutations change identity fields (displayName, avatar, etc.)
     * Allows partial updates without replacing entire identity
     */
    updateCurrentUserIdentity: (state, action: PayloadAction<Partial<CurrentUserIdentity>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
        };

        // Update localStorage with new identity
        if (state.sessionExpiresAt) {
          saveAuthToStorage(state.currentUser, state.sessionExpiresAt);
        }
      }
    },

    /**
     * @deprecated Use setCurrentUser instead
     * Kept for backward compatibility during migration
     */
    setUser: (state, action: PayloadAction<PublicUser | null>) => {
      console.warn('setUser is deprecated. Use setCurrentUser instead.');
      if (!action.payload) {
        state.currentUser = null;
        state.isAuthenticated = false;
      } else {
        state.currentUser = mapUserToIdentity(action.payload);
        state.isAuthenticated = true;
      }
    },

    /**
     * Optimistic logout for immediate UI feedback
     * Actual logout happens via async thunk
     */
    optimisticLogout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;

      // Clear localStorage
      clearAuthFromStorage();
    },
  },
  extraReducers: (builder) => {
    // ==================== SIGN IN ====================
    // When sign in starts
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    // When sign in succeeds - payload contains { user, expiresAt }
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload) {
        // Map PublicUser from API to CurrentUserIdentity for global state
        const currentUser = mapUserToIdentity(action.payload.user);

        state.currentUser = currentUser;
        state.isAuthenticated = true;
        state.sessionExpiresAt = action.payload.expiresAt;

        // Save to localStorage (only minimal identity, not full PublicUser)
        saveAuthToStorage(currentUser, action.payload.expiresAt);
      }

      state.error = null;
    });

    // When sign in fails
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Sign in failed';
    });

    // ==================== REFRESH SESSION ====================
    // When refresh starts
    builder.addCase(refreshSession.pending, (state) => {
      state.isLoading = true;
    });

    // When refresh succeeds - payload only contains { expiresAt }
    // User data stays the same, we just extend the session
    builder.addCase(refreshSession.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload) {
        state.sessionExpiresAt = action.payload.expiresAt;
      }

      state.error = null;
    });

    // When refresh fails - clear everything
    builder.addCase(refreshSession.rejected, (state, action) => {
      state.isLoading = false;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
      state.error = (action.payload as string) || 'Session expired';

      // Clear localStorage
      clearAuthFromStorage();
    });

    // ==================== SIGN OUT ====================
    // When sign out starts
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
    });

    // When sign out succeeds - clear all user data
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
      state.error = null;

      // Clear localStorage
      clearAuthFromStorage();
    });

    // When sign out fails - still clear everything for safety
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;

      // Clear localStorage
      clearAuthFromStorage();
    });
  },
});

// Export actions
export const {
  clearError,
  setCurrentUser,
  updateCurrentUserIdentity,
  setUser, // @deprecated - kept for backward compatibility
  optimisticLogout,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Re-export types for convenience
export type { CurrentUserIdentity } from '../types/identity';
