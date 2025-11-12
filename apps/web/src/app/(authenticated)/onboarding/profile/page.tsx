'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import {
  selectSelectedRole,
  selectProfileData,
  selectCurrentStep,
} from '@/features/onboarding/selectors/onboarding.selectors';
import {
  completeProfileStep,
  updateProfileData,
  setCurrentStep,
  updateCompletionScore,
} from '@/features/onboarding/slice/onboardingSlice';
import { OnboardingLayout } from '@/features/onboarding/components/OnboardingLayout';
import type { ProfileSetup } from '@community-gaming/types';
import styles from './page.module.css';

const TIMEZONES = [
  'UTC-12:00',
  'UTC-11:00',
  'UTC-10:00',
  'UTC-09:00',
  'UTC-08:00',
  'UTC-07:00',
  'UTC-06:00',
  'UTC-05:00',
  'UTC-04:00',
  'UTC-03:00',
  'UTC-02:00',
  'UTC-01:00',
  'UTC+00:00',
  'UTC+01:00',
  'UTC+02:00',
  'UTC+03:00',
  'UTC+04:00',
  'UTC+05:00',
  'UTC+06:00',
  'UTC+07:00',
  'UTC+08:00',
  'UTC+09:00',
  'UTC+10:00',
  'UTC+11:00',
  'UTC+12:00',
];

const PLAY_STYLES = [
  { value: 'casual', label: 'Casual', description: 'Play for fun and relaxation' },
  { value: 'competitive', label: 'Competitive', description: 'Play to win and improve' },
  { value: 'social', label: 'Social', description: 'Play to connect with others' },
  { value: 'achievement', label: 'Achievement', description: 'Complete goals and challenges' },
];

const POPULAR_GAMES = [
  'League of Legends',
  'Valorant',
  'CS:GO',
  'Fortnite',
  'Apex Legends',
  'Overwatch 2',
  'Rocket League',
  'Minecraft',
  'Call of Duty',
  'Dota 2',
  'Rainbow Six Siege',
  'Destiny 2',
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedRole = useAppSelector(selectSelectedRole);
  const profileData = useAppSelector(selectProfileData);
  const currentStep = useAppSelector(selectCurrentStep);

  const [formData, setFormData] = useState<Partial<ProfileSetup>>({
    displayName: profileData.displayName || '',
    country: profileData.country || '',
    timezone: profileData.timezone || 'UTC+00:00',
    favoriteGames: profileData.favoriteGames || [],
    playStyle: profileData.playStyle,
  });

  const [customGame, setCustomGame] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Redirect if no role selected
    if (!selectedRole) {
      router.push('/onboarding');
      return;
    }

    // Set current step
    if (currentStep !== 'profile') {
      dispatch(setCurrentStep('profile'));
    }
  }, [selectedRole, currentStep, router, dispatch]);

  const handleInputChange = (field: keyof ProfileSetup, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));

    // Auto-save to Redux
    dispatch(updateProfileData({ [field]: value }));
  };

  const handleGameToggle = (game: string) => {
    const currentGames = formData.favoriteGames || [];
    const newGames = currentGames.includes(game)
      ? currentGames.filter((g) => g !== game)
      : [...currentGames, game];

    setFormData((prev) => ({ ...prev, favoriteGames: newGames }));
    dispatch(updateProfileData({ favoriteGames: newGames }));
  };

  const handleAddCustomGame = () => {
    if (!customGame.trim()) return;

    const currentGames = formData.favoriteGames || [];
    if (currentGames.length >= 10) {
      setErrors((prev) => ({ ...prev, customGame: 'Maximum 10 games allowed' }));
      return;
    }

    if (currentGames.includes(customGame.trim())) {
      setErrors((prev) => ({ ...prev, customGame: 'Game already added' }));
      return;
    }

    const newGames = [...currentGames, customGame.trim()];
    setFormData((prev) => ({ ...prev, favoriteGames: newGames }));
    dispatch(updateProfileData({ favoriteGames: newGames }));
    setCustomGame('');
    setErrors((prev) => ({ ...prev, customGame: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName || formData.displayName.length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }

    if (!formData.country) {
      newErrors.country = 'Please select your country';
    }

    if (!formData.favoriteGames || formData.favoriteGames.length === 0) {
      newErrors.favoriteGames = 'Please select at least one game';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    // Complete this step
    dispatch(completeProfileStep(formData as ProfileSetup));

    // Update completion score (20% for completing profile)
    dispatch(updateCompletionScore(20));

    // Navigate to next step
    router.push('/onboarding/intent');
  };

  const handleBack = () => {
    router.push('/onboarding');
  };

  if (!selectedRole) {
    return null; // Will redirect in useEffect
  }

  return (
    <OnboardingLayout>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Set Up Your Profile</h2>
          <p className={styles.cardDescription}>
            Tell us a bit about yourself so we can personalize your experience.
          </p>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Display Name */}
          <div className={styles.formGroup}>
            <label htmlFor="displayName" className={styles.label}>
              Display Name <span className={styles.required}>*</span>
            </label>
            <input
              id="displayName"
              type="text"
              className={`${styles.input} ${errors.displayName ? styles.inputError : ''}`}
              placeholder="Enter your display name"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              maxLength={50}
            />
            {errors.displayName && <span className={styles.errorText}>{errors.displayName}</span>}
          </div>

          {/* Country */}
          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>
              Country <span className={styles.required}>*</span>
            </label>
            <input
              id="country"
              type="text"
              className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
              placeholder="e.g., US, UK, JP"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value.toUpperCase())}
              maxLength={2}
            />
            {errors.country && <span className={styles.errorText}>{errors.country}</span>}
            <span className={styles.helpText}>Enter your 2-letter country code</span>
          </div>

          {/* Timezone */}
          <div className={styles.formGroup}>
            <label htmlFor="timezone" className={styles.label}>
              Timezone
            </label>
            <select
              id="timezone"
              className={styles.select}
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Play Style */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Play Style</label>
            <div className={styles.radioGroup}>
              {PLAY_STYLES.map((style) => (
                <label key={style.value} className={styles.radioOption}>
                  <input
                    type="radio"
                    name="playStyle"
                    value={style.value}
                    checked={formData.playStyle === style.value}
                    onChange={(e) => handleInputChange('playStyle', e.target.value)}
                    className={styles.radioInput}
                  />
                  <div className={styles.radioLabel}>
                    <span className={styles.radioTitle}>{style.label}</span>
                    <span className={styles.radioDescription}>{style.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Favorite Games */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Favorite Games <span className={styles.required}>*</span>
            </label>
            <div className={styles.gameGrid}>
              {POPULAR_GAMES.map((game) => (
                <button
                  key={game}
                  type="button"
                  className={`${styles.gameChip} ${
                    formData.favoriteGames?.includes(game) ? styles.gameChipSelected : ''
                  }`}
                  onClick={() => handleGameToggle(game)}
                >
                  {game}
                </button>
              ))}
            </div>

            {/* Custom Game Input */}
            <div className={styles.customGameInput}>
              <input
                type="text"
                placeholder="Add custom game..."
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomGame()}
                className={styles.input}
              />
              <button type="button" onClick={handleAddCustomGame} className={styles.addButton}>
                Add
              </button>
            </div>
            {errors.customGame && <span className={styles.errorText}>{errors.customGame}</span>}
            {errors.favoriteGames && (
              <span className={styles.errorText}>{errors.favoriteGames}</span>
            )}

            {/* Selected Games */}
            {formData.favoriteGames && formData.favoriteGames.length > 0 && (
              <div className={styles.selectedGames}>
                <span className={styles.selectedLabel}>
                  Selected ({formData.favoriteGames.length}/10):
                </span>
                <div className={styles.selectedGamesList}>
                  {formData.favoriteGames.map((game) => (
                    <span key={game} className={styles.selectedGameTag}>
                      {game}
                      <button
                        type="button"
                        onClick={() => handleGameToggle(game)}
                        className={styles.removeGame}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" onClick={handleBack} className={styles.backButton}>
            Back
          </button>
          <button type="button" onClick={handleContinue} className={styles.continueButton}>
            Continue
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
