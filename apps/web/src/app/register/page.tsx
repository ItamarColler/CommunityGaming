import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';
import './register.css';

export const metadata: Metadata = {
  title: 'Register - CommunityGaming',
  description: 'Create your CommunityGaming account',
};

/**
 * Registration page - public route (no authentication required)
 * Users can create a new account
 */
export default function RegisterPage() {
  return (
    <main className="register-page">
      <RegisterForm />
    </main>
  );
}
