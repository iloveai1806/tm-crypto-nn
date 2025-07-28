'use client';

import ReactMarkdown from 'react-markdown';
import styles from './aiPopup.module.css';
import type { RadarSignal } from '@/types/api';

interface AIReportPopupProps {
  signal: RadarSignal;
  mousePos: { x: number; y: number };
  onClose: () => void;
}

export default function AIReportPopup({ signal, mousePos, onClose }: AIReportPopupProps) {
  if (!signal) return null;
  
  // Position the popup relative to mouse, but keep it on screen
  const popupStyle = {
    left: typeof window !== 'undefined' ? Math.min(mousePos.x + 15, window.innerWidth - 400) : mousePos.x + 15,
    top: Math.max(mousePos.y - 50, 10),
  };
  
  return (
    <div 
      className={styles.popup}
      style={popupStyle}
    >
      <div className={styles.header}>
        <div className={styles.tokenInfo}>
          <span className={styles.symbol}>{signal.symbol}</span>
          <span className={styles.grade}>Grade: {signal.traderGrade}%</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.aiTitle}>
          🤖 AI Report
        </div>
        <div className={styles.aiText}>
          <ReactMarkdown>{signal.aiReport || 'No AI report available'}</ReactMarkdown>
        </div>
      </div>
      
      <div className={styles.footer}>
        <span className={styles.clickHint}>Click blip for full details</span>
      </div>
    </div>
  );
}