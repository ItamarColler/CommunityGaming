import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services';
import { PublicUser, type LoginRequest } from '@community-gaming/types';

// Web-specific Auth state (extends shared types for Redux)
export interface AuthState {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: string | null;
}

// LocalStorage keys
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const AUTH_EXPIRES_KEY = 'auth_expires';

// LocalStorage helpers (client-side only)
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

    const user = JSON.parse(userStr);

    return {
      user,
      isAuthenticated: true,
      sessionExpiresAt: expiresAt,
    };
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
    clearAuthFromStorage();
    return {};
  }
};

const saveAuthToStorage = (user: PublicUser, expiresAt: string, token?: string) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
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
  user: storedAuth.user || null,
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
     * Set user from server-side preload
     * Used during SSR hydration
     */
    setUser: (state, action: PayloadAction<PublicUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    /**
     * Optimistic logout for immediate UI feedback
     * Actual logout happens via async thunk
     */
    optimisticLogout: (state) => {
      state.user = null;
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionExpiresAt = action.payload.expiresAt;

        // Save to localStorage
        saveAuthToStorage(action.payload.user, action.payload.expiresAt);
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
      state.user = null;
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
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
      state.error = null;

      // Clear localStorage
      clearAuthFromStorage();
    });

    // When sign out fails - still clear everything for safety
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;

      // Clear localStorage
      clearAuthFromStorage();
    });
  },
});

export const { clearError, setUser, optimisticLogout } = authSlice.actions;
export default authSlice.reducer;
