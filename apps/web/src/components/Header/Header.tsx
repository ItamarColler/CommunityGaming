'use client';

import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement logout logic (clear auth state)
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <h1>CommunityGaming</h1>
        </div>

        <nav className={styles.nav}>
          <button onClick={() => router.push('/home')} className={styles.navLink}>
            Home
          </button>
          <button onClick={() => router.push('/profile')} className={styles.navLink}>
            Profile
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
