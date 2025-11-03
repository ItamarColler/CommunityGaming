import { describe, it, expect } from 'vitest';
import authReducer, {
  signIn,
  signOut,
  refreshSession,
  clearError,
  setUser,
  optimisticLogout,
} from '@/features/auth/slice/authSlice';
import type { AuthState, User } from '@/features/auth/types';

const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatar: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionExpiresAt: null,
  };

  describe('reducers', () => {
    it('should handle clearError', () => {
      const stateWithError: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const newState = authReducer(stateWithError, clearError());

      expect(newState.error).toBeNull();
    });

    it('should handle setUser', () => {
      const newState = authReducer(initialState, setUser(mockUser));

      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });

    it('should handle setUser with null', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const newState = authReducer(stateWithUser, setUser(null));

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });

    it('should handle optimisticLogout', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        sessionExpiresAt: new Date().toISOString(),
      };

      const newState = authReducer(stateWithUser, optimisticLogout());

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.sessionExpiresAt).toBeNull();
    });
  });

  describe('signIn async thunk', () => {
    it('should set loading state when pending', () => {
      const action = { type: signIn.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should set user when fulfilled', () => {
      const expiresAt = new Date().toISOString();
      const action = {
        type: signIn.fulfilled.type,
        payload: { user: mockUser, expiresAt },
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.sessionExpiresAt).toBe(expiresAt);
      expect(newState.error).toBeNull();
    });

    it('should set error when rejected', () => {
      const errorMessage = 'Login failed';
      const action = {
        type: signIn.rejected.type,
        payload: errorMessage,
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });
  });

  describe('refreshSession async thunk', () => {
    it('should set loading state when pending', () => {
      const action = { type: refreshSession.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('should set user when fulfilled', () => {
      const expiresAt = new Date().toISOString();
      const action = {
        type: refreshSession.fulfilled.type,
        payload: { user: mockUser, expiresAt },
      };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
      expect(newState.sessionExpiresAt).toBe(expiresAt);
    });

    it('should clear user when rejected', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const action = {
        type: refreshSession.rejected.type,
        payload: 'Session expired',
      };
      const newState = authReducer(stateWithUser, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });

  describe('signOut async thunk', () => {
    it('should set loading state when pending', () => {
      const action = { type: signOut.pending.type };
      const newState = authReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('should clear user when fulfilled', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
        sessionExpiresAt: new Date().toISOString(),
      };

      const action = { type: signOut.fulfilled.type };
      const newState = authReducer(stateWithUser, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
      expect(newState.sessionExpiresAt).toBeNull();
    });

    it('should clear user even when rejected', () => {
      const stateWithUser: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const action = { type: signOut.rejected.type };
      const newState = authReducer(stateWithUser, action);

      expect(newState.user).toBeNull();
      expect(newState.isAuthenticated).toBe(false);
    });
  });
});
