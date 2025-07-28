'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './leaderboard.module.css';

interface StreamingTextProps {
  text: string;
  speed?: number; // Characters per millisecond
  onComplete?: () => void;
}

export default function StreamingText({ text, speed = 50, onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) return;

    setDisplayedText('');
    setIsStreaming(true);
    
    let currentIndex = 0;
    
    const streamText = () => {
      if (currentIndex < text.length) {
        // Add multiple characters at once for faster streaming
        const charsToAdd = Math.min(2, text.length - currentIndex);
        const newText = text.slice(0, currentIndex + charsToAdd);
        
        setDisplayedText(newText);
        currentIndex += charsToAdd;
        
        // Auto-scroll to bottom as text appears
        if (containerRef.current) {
          const container = containerRef.current.closest(`.${styles.aiReportContent}`);
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }
        
        intervalRef.current = setTimeout(streamText, speed);
      } else {
        setIsStreaming(false);
        onComplete?.();
      }
    };

    // Start streaming after a small delay
    intervalRef.current = setTimeout(streamText, 100);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <div ref={containerRef} className={styles.reportText}>
      {displayedText}
      {isStreaming && (
        <span className={styles.streamingCursor}>|</span>
      )}
    </div>
  );
}