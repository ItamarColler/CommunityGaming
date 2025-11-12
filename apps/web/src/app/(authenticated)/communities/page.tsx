'use client';

import styles from './communities.module.css';

/**
 * Communities listing page
 * Automatically wrapped with Header via PageContainer in authenticated layout
 */
export default function CommunitiesPage() {
  return (
    <div className={styles.communities}>
      <div className={styles.header}>
        <h1>Communities</h1>
        <button className={styles.createButton}>Create Community</button>
      </div>

      <div className={styles.filters}>
        <input type="search" placeholder="Search communities..." className={styles.search} />
        <select className={styles.filter}>
          <option>All Games</option>
          <option>FPS</option>
          <option>RPG</option>
          <option>Strategy</option>
        </select>
      </div>

      <div className={styles.grid}>
        <p>No communities found. Be the first to create one!</p>
      </div>
    </div>
  );
}
