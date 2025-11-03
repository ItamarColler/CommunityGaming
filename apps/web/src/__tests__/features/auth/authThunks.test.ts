import { describe, it, expect } from 'vitest';
import { makeStore } from '@/lib/redux/store';
import { signIn, signOut, refreshSession } from '@/features/auth/slice/authSlice';

describe('auth thunks integration', () => {
  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const store = makeStore();

      const result = await store.dispatch(
        signIn({
          email: 'test@example.com',
          password: 'Test123!@#',
        })
      );

      expect(result.type).toBe(signIn.fulfilled.type);
      expect(result.payload).toHaveProperty('user');
      expect(result.payload).toHaveProperty('expiresAt');

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).not.toBeNull();
      expect(state.auth.user?.email).toBe('test@example.com');
      expect(state.auth.error).toBeNull();
    });

    it('should reject sign in with invalid password format', async () => {
      const store = makeStore();

      const result = await store.dispatch(
        signIn({
          email: 'test@example.com',
          password: 'weak',
        })
      );

      expect(result.type).toBe(signIn.rejected.type);

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
      expect(state.auth.error).toBeTruthy();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session', async () => {
      const store = makeStore();

      const result = await store.dispatch(refreshSession());

      expect(result.type).toBe(refreshSession.fulfilled.type);
      expect(result.payload).toHaveProperty('user');
      expect(result.payload).toHaveProperty('expiresAt');

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).not.toBeNull();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      // First sign in
      const store = makeStore();
      await store.dispatch(
        signIn({
          email: 'test@example.com',
          password: 'Test123!@#',
        })
      );

      // Verify signed in
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Sign out
      const result = await store.dispatch(signOut());

      expect(result.type).toBe(signOut.fulfilled.type);

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBeNull();
      expect(state.auth.sessionExpiresAt).toBeNull();
    });
  });
});
