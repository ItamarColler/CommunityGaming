'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRegisterMutation } from '@/lib/redux';
import { selectIsLoading, selectIsAuthenticated } from '@/features/auth/selectors';
import { RegisterRequestSchema, type RegisterRequest } from '@community-gaming/types';
import { Input } from '@/components';
import { InputAdornment, IconButton } from '@mui/material';
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

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowPassword(!showPassword)}
        edge="end"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeClose width={20} height={20} /> : <EyeOpen width={20} height={20} />}
      </IconButton>
    </InputAdornment>
  );

  const confirmPasswordAdornment = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        edge="end"
        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
      >
        {showConfirmPassword ? <EyeClose width={20} height={20} /> : <EyeOpen width={20} height={20} />}
      </IconButton>
    </InputAdornment>
  );

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
            <Input
              id="username"
              inputType="text"
              label="Username"
              value={formData.username}
              setParentValue={(value) => handleInputChange('username', String(value))}
              placeholder="johndoe"
              disabled={isLoading}
              error={!!validationErrors.username}
              helperText={
                validationErrors.username ||
                '3-30 characters, letters, numbers, underscores, and hyphens only'
              }
              autoComplete="username"
              required
            />
          </div>

          {/* Display Name field */}
          <div className={styles.formField}>
            <Input
              id="displayName"
              inputType="text"
              label="Display Name"
              value={formData.displayName}
              setParentValue={(value) => handleInputChange('displayName', String(value))}
              placeholder="John Doe (optional)"
              disabled={isLoading}
              error={!!validationErrors.displayName}
              helperText={validationErrors.displayName}
              autoComplete="name"
              required={false}
            />
          </div>

          {/* Email field */}
          <div className={styles.formField}>
            <Input
              id="email"
              inputType="email"
              label="Email"
              value={formData.email}
              setParentValue={(value) => handleInputChange('email', String(value))}
              placeholder="you@example.com"
              disabled={isLoading}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              autoComplete="email"
              required
            />
          </div>

          {/* Password field */}
          <div className={styles.formField}>
            <Input
              id="password"
              inputType={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              setParentValue={(value) => handleInputChange('password', String(value))}
              placeholder="Enter your password"
              disabled={isLoading}
              error={!!validationErrors.password}
              helperText={
                validationErrors.password ||
                'Minimum 8 characters with uppercase, lowercase, number, and special character'
              }
              autoComplete="new-password"
              required
              slotProps={{
                input: {
                  endAdornment: passwordAdornment,
                },
              }}
            />
          </div>

          {/* Confirm Password field */}
          <div className={styles.formField}>
            <Input
              id="confirmPassword"
              inputType={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={formData.confirmPassword}
              setParentValue={(value) => handleInputChange('confirmPassword', String(value))}
              placeholder="Confirm your password"
              disabled={isLoading}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              autoComplete="new-password"
              required
              slotProps={{
                input: {
                  endAdornment: confirmPasswordAdornment,
                },
              }}
            />
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
