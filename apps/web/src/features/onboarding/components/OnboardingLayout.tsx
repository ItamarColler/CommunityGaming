'use client';

import { ReactNode } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  selectCurrentStep,
  selectCompletionScore,
  selectSelectedRole,
} from '../selectors/onboarding.selectors';
import type { OnboardingStep } from '@community-gaming/types';
import styles from './OnboardingLayout.module.css';

interface OnboardingLayoutProps {
  children: ReactNode;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  profile: 'Profile Setup',
  intent: 'Your Intent',
  goals: 'Growth Goals',
  preferences: 'Preferences',
  complete: 'Complete',
};

const STEP_ORDER: OnboardingStep[] = ['welcome', 'profile', 'intent', 'goals', 'preferences', 'complete'];

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const currentStep = useAppSelector(selectCurrentStep);
  const completionScore = useAppSelector(selectCompletionScore);
  const selectedRole = useAppSelector(selectSelectedRole);

  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className={styles.container}>
      {/* Header with progress */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>CommunityGaming</h1>
          {selectedRole && (
            <div className={styles.roleBadge}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Onboarding
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>Progress</span>
            <span className={styles.progressPercent}>{completionScore}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {STEP_ORDER.filter((step) => step !== 'welcome').map((step, index) => {
            const stepIndex = STEP_ORDER.indexOf(step);
            const isActive = stepIndex === currentStepIndex;
            const isCompleted = stepIndex < currentStepIndex;

            return (
              <div
                key={step}
                className={`${styles.step} ${isActive ? styles.stepActive : ''} ${
                  isCompleted ? styles.stepCompleted : ''
                }`}
              >
                <div className={styles.stepCircle}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className={styles.stepLabel}>{STEP_LABELS[step]}</div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>{children}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Need help? <a href="/support" className={styles.footerLink}>Contact Support</a>
        </p>
      </footer>
    </div>
  );
}
