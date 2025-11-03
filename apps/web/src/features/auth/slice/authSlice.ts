import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, User } from '../types';
import { authService } from '../services';

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
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.signIn(credentials);

      if (!response.success) {
        return rejectWithValue(response.error.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Sign in failed'
      );
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
        return rejectWithValue(
          response.error?.message || 'Session refresh failed'
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Session refresh failed'
      );
    }
  }
);

/**
 * Async thunk: Sign out
 * Clears Redux state and httpOnly cookie via API
 */
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
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
  }
);

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
    setUser: (state, action: { payload: User | null }) => {
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
    // Sign in
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionExpiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh session
    builder
      .addCase(refreshSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.sessionExpiresAt = action.payload.expiresAt;
        state.error = null;
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiresAt = null;
        state.error = action.payload as string;
      });

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiresAt = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state) => {
        // Clear state even on error
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpiresAt = null;
      });
  },
});

export const { clearError, setUser, optimisticLogout } = authSlice.actions;
export default authSlice.reducer;
