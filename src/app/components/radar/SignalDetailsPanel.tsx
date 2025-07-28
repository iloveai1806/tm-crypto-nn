'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './signalDetails.module.css';
import type { RadarSignal } from '@/types/api';

interface SignalDetailsProps {
  signal: RadarSignal | null;
  onClose: () => void;
}

export default function SignalDetailsPanel({ signal, onClose }: SignalDetailsProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (signal) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [signal]);
  
  if (!signal) return null;
  
  const getGradeColor = (grade: number) => {
    if (grade >= 80) return '#00ff00';
    if (grade >= 60) return '#FFCF30';
    if (grade >= 40) return '#ff9900';
    return '#ff0000';
  };
  
  return (
    <div className={`${styles.panel} ${isVisible ? styles.visible : ''}`}>
      <button className={styles.closeButton} onClick={onClose}>×</button>
      
      <div className={styles.header}>
        <h2 className={styles.symbol}>{signal.symbol}</h2>
        <p className={styles.name}>{signal.name}</p>
      </div>
      
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Trader Grade</span>
          <span 
            className={styles.metricValue}
            style={{ color: getGradeColor(signal.traderGrade) }}
          >
            {signal.traderGrade}
          </span>
          <span className={styles.metricChange}>
            {signal.traderGradeChange > 0 ? '+' : ''}{signal.traderGradeChange}% (24h)
          </span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Trading Signal Returns</span>
          <span 
            className={styles.metricValue}
            style={{ color: signal.tradingReturns >= 0 ? '#00ff00' : '#ff4444' }}
          >
            {signal.tradingReturns >= 0 ? '+' : ''}{signal.tradingReturns.toFixed(2)}%
          </span>
        </div>
      </div>
      
      {signal.aiReport && (
        <div className={styles.aiReport}>
          <h3 className={styles.aiReportTitle}>AI Analysis</h3>
          <div className={styles.aiReportContent}>
            <div className={styles.reportText}>
              <ReactMarkdown>{signal.aiReport}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
      
      {signal.tmLink && (
        <div className={styles.footer}>
          <a 
            href={signal.tmLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.tmLink}
          >
            View on Token Metrics →
          </a>
        </div>
      )}
    </div>
  );
}