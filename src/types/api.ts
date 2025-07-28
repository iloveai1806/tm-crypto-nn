// API Response Types

export interface TradingSignal {
  TOKEN_ID: number;
  TOKEN_NAME: string;
  TOKEN_SYMBOL: string;
  DATE: string;
  TRADING_SIGNAL: number;
  TOKEN_TREND: number;
  TRADING_SIGNALS_RETURNS: number;
  HOLDING_RETURNS: number;
  tm_link: string;
  TM_TRADER_GRADE: number;
  TM_INVESTOR_GRADE: number;
  TM_LINK: string;
}

export interface TraderGrade {
  TOKEN_ID: number;
  TM_TRADER_GRADE: number;
  TM_TRADER_GRADE_24H_PCT_CHANGE: number;
}

export interface AIReport {
  TOKEN_ID: number;
  TOKEN_SYMBOL: string;
  TOKEN_NAME: string;
  INVESTMENT_ANALYSIS_POINTER?: string;
  INVESTMENT_ANALYSIS?: string;
  DEEP_DIVE?: string;
  CODE_REVIEW?: string;
}

export interface TokenInfo {
  TOKEN_ID: number;
  TOKEN_SYMBOL: string;
  TOKEN_NAME: string;
  CATEGORY: string;
  MARKET_CAP?: number;
  VOLUME_24H?: number;
}

export interface RadarSignal {
  id: string | number;
  symbol: string;
  name: string;
  signal: number;
  signalDate: string;
  traderGrade: number;
  traderGradeChange: number;
  tradingReturns: number;
  holdingReturns: number;
  returnsDelta: number;
  aiReport: string | null;
  tmLink?: string;
  angle: number;
  distance: number;
  category: string;
  marketcap?: number;
  volume?: number;
}

export interface CacheData {
  data: {
    success: boolean;
    data: RadarSignal[];
    timestamp: number;
    count: number;
  };
  timestamp: number;
  cacheKey: string;
}