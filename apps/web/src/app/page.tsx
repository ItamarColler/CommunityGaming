'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { selectIsAuthenticated, selectUser } from '@/features/auth/selectors';
import { signOut } from '@/features/auth/slice/authSlice';
import { AuthGuard } from '@/components/auth/AuthGuard';
import styles from './page.module.css';

function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSignOut = async () => {
    await dispatch(signOut());
    router.push('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to CommunityGaming</h1>
        <p className={styles.description}>Realtime, event-driven social platform for gamers</p>
      </div>

      <div className={styles.userInfo}>
        <h2>Hello, {user.displayName || user.username}!</h2>
        <p className={styles.email}>{user.email}</p>
        <p className={styles.userType}>Account Type: {user.userType}</p>
      </div>

      <button onClick={handleSignOut} className={styles.signOutButton}>
        Sign Out
      </button>
    </main>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
