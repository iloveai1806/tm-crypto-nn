'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from './signal.module.css';
import LoadingState from '@/app/components/LoadingState';
import SignalDetailsPanel from '@/app/components/radar/SignalDetailsPanel';
import TraderGradesLeaderboard from '@/app/components/radar/TraderGradesLeaderboard';
import type { RadarSignal } from '@/types/api';

// Dynamically import RadarInterface to avoid SSR hydration issues
const RadarInterface = dynamic(
  () => import('@/app/components/radar/RadarInterface'),
  { 
    ssr: false,
    loading: () => <LoadingState />
  }
);

export default function SignalPage() {
  const [signals, setSignals] = useState<RadarSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<RadarSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Filter states
  const [marketCapFilter, setMarketCapFilter] = useState<string>('');
  const [volumeFilter, setVolumeFilter] = useState<string>('');
  
  // Filter for bullish signals only for radar display and remove duplicates
  const bullishSignals = useMemo(() => {
    const bullish = signals.filter(s => s.signal === 1);
    // Remove duplicates by symbol, keeping the one with highest trader grade
    const uniqueBullish = bullish.reduce((acc: RadarSignal[], currentSignal) => {
      const existing = acc.find((s) => s.symbol === currentSignal.symbol);
      if (!existing || currentSignal.traderGrade > existing.traderGrade) {
        if (existing) {
          const index = acc.indexOf(existing);
          acc.splice(index, 1);
        }
        acc.push(currentSignal);
      }
      return acc;
    }, [] as RadarSignal[]);
    return uniqueBullish;
  }, [signals]);
  
  const bullishCount = bullishSignals.length;

  const fetchRadarSignals = useCallback(async () => {
    try {
      // Build query params for filters
      const params = new URLSearchParams();
      if (marketCapFilter) params.append('marketcap', marketCapFilter);
      if (volumeFilter) params.append('volume', volumeFilter);
      
      const url = `/api/radar-signals${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        console.log('🔄 Received signals data:', {
          count: result.data.length,
          firstSignal: result.data[0] ? {
            symbol: result.data[0].symbol,
            aiReportLength: result.data[0].aiReport?.length,
            aiReportPreview: result.data[0].aiReport?.substring(0, 50) + '...'
          } : 'No signals'
        });
        setSignals(result.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError('Failed to load radar signals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [marketCapFilter, volumeFilter]);
  
  const handleFilterChange = useCallback(async () => {
    setLoading(true);
    // Clear cache first by calling POST endpoint
    await fetch('/api/radar-signals', { method: 'POST' });
    // Then fetch with new filters
    fetchRadarSignals();
  }, [fetchRadarSignals]);

  useEffect(() => {
    fetchRadarSignals();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchRadarSignals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRadarSignals]);

  const handleSignalSelect = (signal: RadarSignal) => {
    console.log('📡 Signal selected in parent:', signal.symbol);
    setSelectedSignal(signal);
  };

  const handleClosePanel = () => {
    setSelectedSignal(null);
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchRadarSignals}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg className={styles.logoIcon} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
          </svg>
          <span className={styles.logoText}>RADAR</span>
        </div>
        
        <div className={styles.headerRight}>
          {/* Filter Controls */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Market Cap</label>
              <select 
                value={marketCapFilter} 
                onChange={(e) => setMarketCapFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="1000000000">$1B+</option>
                <option value="100000000">$100M+</option>
                <option value="10000000">$10M+</option>
                <option value="1000000">$1M+</option>
                <option value="100000">$100K+</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>24h Volume</label>
              <select 
                value={volumeFilter} 
                onChange={(e) => setVolumeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="100000000">$100M+</option>
                <option value="10000000">$10M+</option>
                <option value="1000000">$1M+</option>
                <option value="100000">$100K+</option>
              </select>
            </div>
            <button 
              onClick={handleFilterChange}
              className={styles.filterButton}
              disabled={loading}
            >
              {loading ? '⟳' : '🔍'} Filter
            </button>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue} style={{ color: '#00ff00' }}>{bullishCount}</span>
              <span className={styles.statLabel}>Bullish Signals</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {lastUpdate.toLocaleTimeString()}
              </span>
              <span className={styles.statLabel}>Last Update</span>
            </div>
            <div className={styles.logos}>
              <Image src="/tokenmetrics-logo.png" alt="Token Metrics" className={styles.logoImg} width={100} height={40} />
              <span className={styles.logoSeparator}>×</span>
              <Image src="/coinbase-logo.jpg" alt="Coinbase" className={styles.logoImg} width={100} height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!selectedSignal && !loading && (
        <div className={styles.instructions}>
          {bullishCount > 0 ? (
            `🚀 Tracking ${bullishCount} bullish crypto signals • Click blips for AI analysis`
          ) : (
            '⚠️ No tokens match the selected filters. Try adjusting your criteria.'
          )}
        </div>
      )}

      {/* Radar Interface */}
      {!loading && (
        <>
          <RadarInterface 
            signals={bullishSignals} 
            onSignalSelect={handleSignalSelect}
          />
          <TraderGradesLeaderboard signals={signals} />
        </>
      )}

      {/* Signal Details Panel */}
      <SignalDetailsPanel 
        signal={selectedSignal}
        onClose={handleClosePanel}
      />

      {loading && <LoadingState />}
    </div>
  );
} 