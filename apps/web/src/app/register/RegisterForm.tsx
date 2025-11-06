'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRegisterMutation } from '@/lib/redux';
import { selectIsLoading, selectIsAuthenticated } from '@/features/auth/selectors';
import { RegisterRequestSchema, type RegisterRequest } from '@community-gaming/types';
import EyeOpen from '@assets/icons/eyeOpen.svg';
import EyeClose from '@assets/icons/eyeClose.svg';
import styles from './register.module.css';

export function RegisterForm() {
  const router = useRouter();
  const isLoading = useAppSelector(selectIsLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [register] = useRegisterMutation();

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
  const [successMessage, setSuccessMessage] = useState<string>('');
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

    // Call registration API using RTK Query mutation
    try {
      const result = await register(formData).unwrap();

      if (result.success) {
        // Show success message
        setSuccessMessage('Account created successfully! Redirecting to login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setServerError(result.error?.message || 'Registration failed');
      }
    } catch (error) {
      const err = error as { data?: { error?: { message: string; code: string } } };
      setServerError(err.data?.error?.message || 'An unexpected error occurred. Please try again.');
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
          {/* Success message */}
          {successMessage && (
            <div className={styles.successBanner}>
              <span className={styles.successIcon}>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

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
                {showPassword ? (
                  <EyeClose width={20} height={20} />
                ) : (
                  <EyeOpen width={20} height={20} />
                )}
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
                {showConfirmPassword ? (
                  <EyeClose width={20} height={20} />
                ) : (
                  <EyeOpen width={20} height={20} />
                )}
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
