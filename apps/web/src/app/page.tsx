'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectIsAuthenticated, selectUser } from '@/features/auth/selectors';
import styles from './page.module.css';

/**
 * Landing page - public route
 * Shows different content based on authentication state
 */
export default function HomePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to CommunityGaming</h1>
        <p className={styles.description}>
          Realtime, event-driven social platform for gamers
        </p>
      </div>

      {isAuthenticated && user ? (
        <div className={styles.card}>
          <h2>Hello, {user.displayName || user.username}!</h2>
          <p className={styles.email}>{user.email}</p>
          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.primaryButton}>
              Go to Dashboard
            </Link>
            <Link href="/communities" className={styles.secondaryButton}>
              Browse Communities
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <h2>Get Started</h2>
          <p className={styles.tagline}>
            Find your squad, join communities, and connect with gamers worldwide
          </p>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primaryButton}>
              Sign Up
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              Sign In
            </Link>
          </div>
        </div>
      )}

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>Find Your Squad</h3>
          <p>Match with players based on skill, timezone, and playstyle</p>
        </div>
        <div className={styles.feature}>
          <h3>Join Communities</h3>
          <p>Discover and participate in gaming communities for your favorite games</p>
        </div>
        <div className={styles.feature}>
          <h3>Real-time Chat</h3>
          <p>Connect instantly with voice, video, and text messaging</p>
        </div>
      </div>
    </main>
  );
}
