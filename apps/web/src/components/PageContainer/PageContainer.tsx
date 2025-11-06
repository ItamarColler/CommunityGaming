'use client';

import { ReactNode } from 'react';
import Header from '../Header/Header';
import styles from './PageContainer.module.css';

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className={styles.pageWrapper}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
