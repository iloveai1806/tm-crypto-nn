'use client';

import styles from './loading.module.css';

export default function LoadingState() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.radarSweep}></div>
      </div>
      <div className={styles.loadingText}>
        <div className={styles.title}>SCANNING FOR SIGNALS</div>
        <div className={styles.subtitle}>Initializing radar interface...</div>
      </div>
    </div>
  );
}