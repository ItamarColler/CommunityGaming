import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '@/features/auth/slice/authSlice';

/**
 * Base API configuration
 * All API services should inject their endpoints into this base API
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
    prepareHeaders: (headers) => {
      // Add auth token to requests if available
      const token = getAuthToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Add default headers
      headers.set('Content-Type', 'application/json');

      return headers;
    },
    credentials: 'include', // Include cookies for httpOnly session tokens
  }),
  tagTypes: ['Auth', 'User', 'Community', 'Match'], // Define cache tags for invalidation
  endpoints: () => ({}), // Endpoints will be injected by individual API slices
});

/**
 * Export hooks for usage in components
 * Individual API slices will extend this
 */
