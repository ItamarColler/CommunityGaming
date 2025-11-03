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

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpiresAt: null,
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
    });

    // When sign out fails - still clear everything for safety
    builder.addCase(signOut.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
    });
  },
});

export const { clearError, setUser, optimisticLogout } = authSlice.actions;
export default authSlice.reducer;
