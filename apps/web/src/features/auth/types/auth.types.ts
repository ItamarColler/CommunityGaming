import { User } from '@community-gaming/types';
// Web-specific Auth state (extends shared AuthState for Redux)
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: string | null;
}

// Legacy API Response types for backward compatibility
export type AuthResponse = import('@community-gaming/types').LoginResponse;
