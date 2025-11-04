'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { signIn } from '@/features/auth/slice/authSlice';
import { selectIsLoading, selectIsAuthenticated } from '@/features/auth/selectors';
import { RegisterRequestSchema, type RegisterRequest } from '@community-gaming/types';
import styles from './register.module.css';

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors({});
    setServerError('');

    // Validate form data with Zod
    const validation = RegisterRequestSchema.safeParse(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Call registration API
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setServerError(data.error.message);
        return;
      }

      // After successful registration, sign in automatically (session already set by API)
      // Just dispatch the signIn action to update Redux state
      await dispatch(
        signIn({
          email: formData.email,
          password: formData.password,
        })
      );

      // Redirect to home
      router.push('/');
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (serverError) {
      setServerError('');
    }
  };

  return (
    <div className={styles.registerFormContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>Create Account</h1>
          <p>Join CommunityGaming today</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          {/* Global error message */}
          {serverError && (
            <div className={styles.errorBanner}>
              <span className={styles.errorIcon}>⚠️</span>
              <span>{serverError}</span>
            </div>
          )}

          {/* Username field */}
          <div className={styles.formField}>
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="johndoe"
              disabled={isLoading}
              className={validationErrors.username ? 'error' : ''}
              autoComplete="username"
            />
            {validationErrors.username && (
              <span className={styles.fieldError}>{validationErrors.username}</span>
            )}
            <p className={styles.fieldHint}>
              3-30 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>

          {/* Display Name field */}
          <div className={styles.formField}>
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="John Doe (optional)"
              disabled={isLoading}
              className={validationErrors.displayName ? 'error' : ''}
              autoComplete="name"
            />
            {validationErrors.displayName && (
              <span className={styles.fieldError}>{validationErrors.displayName}</span>
            )}
          </div>

          {/* Email field */}
          <div className={styles.formField}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className={validationErrors.email ? 'error' : ''}
              autoComplete="email"
            />
            {validationErrors.email && (
              <span className={styles.fieldError}>{validationErrors.email}</span>
            )}
          </div>

          {/* Password field */}
          <div className={styles.formField}>
            <label htmlFor="password">Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className={validationErrors.password ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {validationErrors.password && (
              <span className={styles.fieldError}>{validationErrors.password}</span>
            )}
            <p className={styles.fieldHint}>
              Minimum 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password field */}
          <div className={styles.formField}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
                className={validationErrors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.togglePassword}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className={styles.fieldError}>{validationErrors.confirmPassword}</span>
            )}
          </div>

          {/* Submit button */}
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.registerFooter}>
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
