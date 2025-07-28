'use client';

import { useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './leaderboard.module.css';
import type { RadarSignal } from '@/types/api';

interface TraderGradesLeaderboardProps {
  signals: RadarSignal[];
  onTokenSelect?: (token: RadarSignal) => void;
}

type SortField = 'rank' | 'symbol' | 'grade' | 'change';
type SortDirection = 'asc' | 'desc';

export default function TraderGradesLeaderboard({ signals, onTokenSelect }: TraderGradesLeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState<string | number | null>(null);
  const [loadingAIReport, setLoadingAIReport] = useState<string | number | null>(null);
  const [aiReports, setAiReports] = useState<Record<string | number, string>>({});
  const [sortField, setSortField] = useState<SortField>('grade');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isVisible, setIsVisible] = useState(true);
  
  // Sort and filter signals by trader grade (highest first) and handle duplicates + search
  const filteredAndSorted = useMemo(() => {
    // Remove duplicates by keeping the highest grade for each symbol
    const uniqueSignals = signals.reduce((acc: RadarSignal[], signal) => {
      const existing = acc.find((s) => s.symbol === signal.symbol);
      if (!existing || signal.traderGrade > existing.traderGrade) {
        // Remove existing if found and add current
        if (existing) {
          const index = acc.indexOf(existing);
          acc.splice(index, 1);
        }
        acc.push(signal);
      }
      return acc;
    }, [] as RadarSignal[]);
    
    // Filter by search term
    const filtered = uniqueSignals.filter((signal) => 
      signal.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort based on selected field and direction
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'rank':
          // For rank, we use the current index, so no sorting needed
          return 0;
        case 'symbol':
          aValue = a.symbol || '';
          bValue = b.symbol || '';
          break;
        case 'grade':
          aValue = a.traderGrade;
          bValue = b.traderGrade;
          break;
        case 'change':
          aValue = a.traderGradeChange;
          bValue = b.traderGradeChange;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [signals, searchTerm, sortField, sortDirection]);
  
  const formatChange = (change: number) => {
    const formatted = change.toFixed(2);
    if (change > 0) return `+${formatted}%`;
    return `${formatted}%`;
  };
  
  const getChangeColor = (change: number) => {
    if (change > 0) return styles.positive;
    if (change < 0) return styles.negative;
    return styles.neutral;
  };

  // Fetch AI report for a specific token
  const fetchAIReport = useCallback(async (tokenId: string | number, symbol: string) => {
    if (aiReports[tokenId] || loadingAIReport === tokenId) return;

    setLoadingAIReport(tokenId);
    try {
      const response = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_id: tokenId, symbol })
      });
      
      const result = await response.json();
      if (result.success && result.data) {
        setAiReports(prev => ({
          ...prev,
          [tokenId]: result.data.aiReport || 'No AI report available'
        }));
      } else {
        setAiReports(prev => ({
          ...prev,
          [tokenId]: 'Failed to load AI report'
        }));
      }
    } catch {
      setAiReports(prev => ({
        ...prev,
        [tokenId]: 'Error loading AI report'
      }));
    } finally {
      setLoadingAIReport(null);
    }
  }, [aiReports, loadingAIReport]);

  const handleTokenClick = useCallback((signal: RadarSignal) => {
    const tokenKey = signal.id;
    
    // Toggle selection
    if (selectedToken === tokenKey) {
      setSelectedToken(null);
    } else {
      setSelectedToken(tokenKey);
      // Only fetch AI report if not already loaded and not available
      if (!signal.aiReport && !aiReports[tokenKey]) {
        fetchAIReport(tokenKey, signal.symbol);
      }
    }
    
    // Also call parent callback if provided
    onTokenSelect?.(signal);
  }, [selectedToken, aiReports, fetchAIReport, onTokenSelect]);
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'symbol' ? 'asc' : 'desc');
    }
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  const handleAIReportClick = (e: React.MouseEvent, signal: RadarSignal) => {
    e.stopPropagation();
    setSelectedToken(signal.id);
    if (!signal.aiReport && !aiReports[signal.id]) {
      fetchAIReport(signal.id, signal.symbol);
    }
  };
  
  return (
    <div className={styles.leaderboard}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>Trader Grades</h3>
          <button 
            className={styles.toggleButton}
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? 'Hide leaderboard' : 'Show leaderboard'}
          >
            {isVisible ? '−' : '+'}
          </button>
        </div>
        <div className={styles.subtitle}>
          {filteredAndSorted.length} tokens • {signals.filter(s => s.aiReport).length} with AI reports
        </div>
        
        {/* Search Input */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.searchIcon}>🔍</div>
        </div>
      </div>
      
      {isVisible && (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={`${styles.rank} ${styles.sortable}`} onClick={() => handleSort('rank')}>
              # {getSortIcon('rank')}
            </span>
            <span className={`${styles.symbol} ${styles.sortable}`} onClick={() => handleSort('symbol')}>
              Token {getSortIcon('symbol')}
            </span>
            <span className={`${styles.grade} ${styles.sortable}`} onClick={() => handleSort('grade')}>
              Grade {getSortIcon('grade')}
            </span>
            <span className={`${styles.change} ${styles.sortable}`} onClick={() => handleSort('change')}>
              24h {getSortIcon('change')}
            </span>
            <span className={styles.report}>AI</span>
          </div>
        
        <div className={styles.tableBody}>
          {filteredAndSorted.length === 0 ? (
            <div className={styles.emptyState}>
              {searchTerm ? (
                <>
                  <div className={styles.emptyIcon}>🔍</div>
                  <div className={styles.emptyText}>No tokens found for {searchTerm}</div>
                  <div className={styles.emptySubtext}>Try adjusting your search</div>
                </>
              ) : (
                <>
                  <div className={styles.emptyIcon}>📊</div>
                  <div className={styles.emptyText}>No trading data available</div>
                  <div className={styles.emptySubtext}>Check back later for updates</div>
                </>
              )}
            </div>
          ) : (
            filteredAndSorted.map((signal, index) => (
              <div key={`${signal.symbol}-${index}`}>
                <div 
                  className={`${styles.row} ${selectedToken === signal.id ? styles.selectedRow : ''} ${styles.clickableRow}`}
                  onClick={() => handleTokenClick(signal)}
                >
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.symbol}>
                    {signal.symbol}
                  </span>
                  <span className={styles.grade}>{signal.traderGrade.toFixed(1)}</span>
                  <span className={`${styles.change} ${getChangeColor(signal.traderGradeChange)}`}>
                    {formatChange(signal.traderGradeChange)}
                  </span>
                  <span className={styles.report}>
                    {(signal.aiReport || aiReports[signal.id]) && (
                      <button 
                        className={styles.aiButton}
                        onClick={(e) => handleAIReportClick(e, signal)}
                        title="View AI Report"
                      >
                        {loadingAIReport === signal.id ? '⟳' : '🤖'}
                      </button>
                    )}
                  </span>
                </div>
                
                {/* AI Report Expandable Section */}
                {selectedToken === signal.id && (
                  <div className={styles.aiReportSection}>
                    <div className={styles.aiReportHeader}>
                      <span className={styles.aiReportTitle}>AI Report for {signal.symbol}</span>
                      <button 
                        className={styles.closeButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedToken(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className={styles.aiReportContent}>
                      {loadingAIReport === signal.id ? (
                        <div className={styles.loadingState}>
                          <div className={styles.loadingSpinner}>⟳</div>
                          <span>Loading AI report...</span>
                        </div>
                      ) : (
                        <div className={styles.reportText}>
                          <ReactMarkdown>{aiReports[signal.id] || signal.aiReport || 'No AI report available'}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}