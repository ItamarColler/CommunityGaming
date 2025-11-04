import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Login - CommunityGaming',
  description: 'Sign in to your CommunityGaming account',
};

/**
 * Login page - public route (no authentication required)
 * Users can sign in with email and password
 */
export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
