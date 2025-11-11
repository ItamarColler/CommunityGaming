'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { startOnboarding } from '@/features/onboarding/slice/onboardingSlice';
import type { OnboardingRole } from '@community-gaming/types';
import styles from './page.module.css';

interface RoleCardData {
  role: OnboardingRole;
  title: string;
  tagline: string;
  icon: string;
  benefits: string[];
  color: string;
}

const ROLE_CARDS: RoleCardData[] = [
  {
    role: 'gamer',
    title: 'Gamer',
    tagline: 'Find your perfect squad',
    icon: '🎮',
    benefits: [
      'Match with players by skill & playstyle',
      'Join communities around your favorite games',
      'Discover events and tournaments',
      'Track your gaming journey',
    ],
    color: '#667eea',
  },
  {
    role: 'leader',
    title: 'Community Leader',
    tagline: 'Build and grow your community',
    icon: '👑',
    benefits: [
      'Create and manage gaming communities',
      'Organize events and tournaments',
      'Access powerful moderation tools',
      'Monetize your community',
    ],
    color: '#f59e0b',
  },
  {
    role: 'sponsor',
    title: 'Brand/Sponsor',
    tagline: 'Connect with your audience',
    icon: '🚀',
    benefits: [
      'Reach engaged gaming communities',
      'Sponsor events and tournaments',
      'Track campaign performance',
      'Build authentic brand presence',
    ],
    color: '#10b981',
  },
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleRoleSelect = (role: OnboardingRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setIsStarting(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/onboarding/start', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role: selectedRole }),
      // });
      // const data = await response.json();

      // Temporary: Generate a mock progressId
      const mockProgressId = `progress_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Dispatch Redux action to update state
      dispatch(
        startOnboarding({
          role: selectedRole,
          progressId: mockProgressId,
        })
      );

      // Navigate to profile setup step
      router.push('/onboarding/profile');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Welcome to CommunityGaming</h1>
          <p className={styles.heroTagline}>
            The realtime social platform for gamers. Find your people, build communities, and level up together.
          </p>
        </div>

        {/* Role Selection */}
        <div className={styles.roleSection}>
          <h2 className={styles.sectionTitle}>Choose Your Path</h2>
          <p className={styles.sectionDescription}>
            Select the role that best describes you. You can always adjust this later.
          </p>

          <div className={styles.roleCards}>
            {ROLE_CARDS.map((card) => (
              <button
                key={card.role}
                className={`${styles.roleCard} ${selectedRole === card.role ? styles.roleCardSelected : ''}`}
                onClick={() => handleRoleSelect(card.role)}
                style={
                  {
                    '--role-color': card.color,
                  } as React.CSSProperties
                }
              >
                <div className={styles.roleIcon}>{card.icon}</div>
                <h3 className={styles.roleTitle}>{card.title}</h3>
                <p className={styles.roleTagline}>{card.tagline}</p>

                <ul className={styles.benefitsList}>
                  {card.benefits.map((benefit, index) => (
                    <li key={index} className={styles.benefitItem}>
                      <span className={styles.benefitCheck}>✓</span>
                      <span className={styles.benefitText}>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {selectedRole === card.role && (
                  <div className={styles.selectedBadge}>Selected</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className={styles.actions}>
          <button
            className={styles.continueButton}
            onClick={handleContinue}
            disabled={!selectedRole || isStarting}
          >
            {isStarting ? 'Starting...' : 'Continue'}
          </button>

          <p className={styles.skipText}>
            <a href="/dashboard" className={styles.skipLink}>
              Skip for now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
