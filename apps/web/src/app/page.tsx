import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>CommunityGaming</h1>
      <p className={styles.description}>Realtime, event-driven social platform for gamers</p>
    </main>
  );
}
