import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
import './login.css';

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
    <main className="login-page">
      <LoginForm />
    </main>
  );
}
