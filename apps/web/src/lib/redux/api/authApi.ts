import { baseApi } from './baseApi';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshSessionResponse,
  PublicUser,
} from '@community-gaming/types';

/**
 * Auth API endpoints
 * Handles authentication operations (login, register, logout, refresh)
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Register a new user
     */
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Login with credentials
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Logout current user
     */
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Refresh session token
     */
    refreshSession: builder.mutation<RefreshSessionResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Get current authenticated user
     */
    getCurrentUser: builder.query<{ success: boolean; data?: PublicUser }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth', 'User'],
    }),
  }),
  overrideExisting: false,
});

/**
 * Export hooks for usage in components
 */
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
} = authApi;
