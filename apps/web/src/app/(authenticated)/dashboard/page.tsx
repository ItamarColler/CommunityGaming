'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { selectUser } from '@/features/auth/selectors';
import styles from './dashboard.module.css';

/**
 * Dashboard page - protected route
 * Automatically wrapped with PageContainer and AuthGuard via layout
 */
export default function DashboardPage() {
  const user = useAppSelector(selectUser);

  return (
    <div className={styles.dashboard}>
      <h1>Welcome to CommunityGaming</h1>
      {user && (
        <div className={styles.userInfo}>
          <p>
            Hello, <strong>{user.displayName || user.username}</strong>!
          </p>
          <p>Email: {user.email}</p>
        </div>
      )}

      <section className={styles.section}>
        <h2>Your Communities</h2>
        <p>You haven't joined any communities yet.</p>
      </section>

      <section className={styles.section}>
        <h2>Quick Actions</h2>
        <div className={styles.actions}>
          <button>Find Squad</button>
          <button>Browse Communities</button>
          <button>Create Community</button>
        </div>
      </section>
    </div>
  );
}
