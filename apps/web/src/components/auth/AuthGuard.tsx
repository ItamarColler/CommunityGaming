'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectIsAuthenticated, selectIsLoading } from '@/features/auth/selectors';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component - protects routes that require authentication
 * Redirects to /login if user is not authenticated
 * Shows loading state while checking authentication
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);

  useEffect(() => {
    // Don't redirect if already on login or register page
    if (pathname === '/login' || pathname === '/register') {
      return;
    }

    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !isLoading) {
      // Store the intended destination to redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
