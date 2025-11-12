'use client';

import { ReactNode } from 'react';
import PageContainer from '@/components/PageContainer/PageContainer';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Layout for all authenticated routes
 * Wraps content with AuthGuard and PageContainer (Header + Main wrapper)
 */
export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AuthGuard>
      <PageContainer>{children}</PageContainer>
    </AuthGuard>
  );
}
