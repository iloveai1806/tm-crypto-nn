/**
 * Token Metrics API Methods - Reusing existing x402 payment infrastructure
 * 
 * These methods wrap the existing x402-payment utility to provide a clean interface
 * for accessing Token Metrics endpoints with Web3 payments.
 */

// Import from coinbase-agentkit package
import { 
  callTokenMetricsPaidEndpoint
} from '../../../lib/coinbase-agentkit/app/utils/x402-payment';

import { 
  callTokenMetricsFreeEndpoint
} from '../../../lib/coinbase-agentkit/app/utils/free-client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TokenMetricsResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  paymentInfo?: string;
}

/**
 * Makes a free request to Token Metrics API (for free endpoints)
 */
async function callFreeEndpoint(
  endpoint: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {}
): Promise<TokenMetricsResponse> {
  try {
    const response = await callTokenMetricsFreeEndpoint(endpoint, params);
    
    return {
      success: response.success,
      data: response.data?.data || response.data || [],
      error: response.error
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Makes a paid request to Token Metrics API (for paid endpoints)
 */
async function callPaidEndpoint(
  endpoint: string, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
  paymentToken: 'usdc' | 'tmai' = 'usdc'
): Promise<TokenMetricsResponse> {
  try {
    const response = await callTokenMetricsPaidEndpoint(endpoint, params, paymentToken);
    return {
      success: response.success,
      data: response.data?.data || response.data || [],
      error: response.error,
      paymentInfo: response.paymentInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// =============================================================================
// FREE ENDPOINTS (from schema.ts)
// =============================================================================

/**
 * Get supported tokens - FREE
 */
export async function getSupportedTokens(params: {
  token_id?: string;
  token_name?: string;
  symbol?: string;
  category?: string;
  exchange?: string;
  blockchain_address?: string;
  limit?: number;
  page?: number;
}): Promise<TokenMetricsResponse> {
  return callFreeEndpoint('tokens', params);
}

/**
 * Get token prices - FREE
 */
export async function getTokensPrice(params: {
  token_id: string;
}): Promise<TokenMetricsResponse> {
  return callFreeEndpoint('price', params);
}

/**
 * Get top tokens by market cap - FREE
 */
export async function getTopMarketCapTokens(params: {
  top_k: number;
  page?: number;
}): Promise<TokenMetricsResponse> {
  return callFreeEndpoint('top-market-cap-tokens', params);
}

// =============================================================================
// PAID ENDPOINTS - $0.017 USDC / $0.0153 TMAI
// =============================================================================

/**
 * Get investor grades (long-term analysis) - PAID $0.017
 */
export async function getTokensInvestorGrade(params: {
  token_id?: string;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  exchange?: string;
  marketcap?: string;
  fdv?: string;
  volume?: string;
  investorGrade?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('investor-grades', apiParams, paymentToken);
}

/**
 * Get sentiment analysis from social media and news - PAID $0.017
 */
export async function getSentiment(params: {
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('sentiments', apiParams, paymentToken);
}

/**
 * Get tokens with trader grades (short-term trading metrics) - PAID $0.017
 */
export async function getTokensTraderGrade(params: {
  token_id?: string;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  exchange?: string;
  marketcap?: string;
  fdv?: string;
  volume?: string;
  traderGrade?: number;
  traderGradePercentChange?: number;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('trader-grades', apiParams, paymentToken);
}

/**
 * Get AI-generated trading signals for tokens - PAID $0.017
 */
export async function getTokensTradingSignal(params: {
  token_id?: string;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  exchange?: string;
  marketcap?: string;
  fdv?: string;
  volume?: string;
  signal?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('trading-signals', apiParams, paymentToken);
}

/**
 * Get hourly OHLCV data - PAID $0.017
 */
export async function getHourlyOHLCV(params: {
  token_id?: string;
  symbol?: string;
  token_name?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('hourly-ohlcv', apiParams, paymentToken);
}

/**
 * Get daily OHLCV data - PAID $0.017
 */
export async function getDailyOHLCV(params: {
  token_id?: string;
  symbol?: string;
  token_name?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('daily-ohlcv', apiParams, paymentToken);
}

// =============================================================================
// PAID ENDPOINTS - $0.034 USDC / $0.0306 TMAI
// =============================================================================

/**
 * Get hourly trading signals for tokens - PAID $0.034
 */
export async function getHourlyTradingSignals(params: {
  token_id: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('hourly-trading-signals', apiParams, paymentToken);
}

/**
 * Get resistance and support levels - PAID $0.034
 */
export async function getResistanceSupport(params: {
  token_id?: string;
  symbol?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('resistance-support', apiParams, paymentToken);
}

/**
 * Get market analytics including Bullish/Bearish indicators - PAID $0.034
 */
export async function getMarketMetrics(params: {
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('market-metrics', apiParams, paymentToken);
}

/**
 * Get crypto indices data - PAID $0.034
 */
export async function getIndices(params: {
  indicesType?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('indices', apiParams, paymentToken);
}

/**
 * Get index holdings - PAID $0.034
 */
export async function getIndicesHoldings(params: {
  id: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('indices-holdings', apiParams, paymentToken);
}

/**
 * Get index performance - PAID $0.034
 */
export async function getIndicesPerformance(params: {
  id: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('indices-performance', apiParams, paymentToken);
}

// =============================================================================
// PAID ENDPOINTS - $0.068 USDC / $0.0612 TMAI
// =============================================================================

/**
 * Get token correlations with top 100 market cap tokens - PAID $0.068
 */
export async function getTokensCorrelation(params: {
  token_id?: string;
  symbol?: string;
  token_name?: string;
  category?: string;
  exchange?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('correlation', apiParams, paymentToken);
}

/**
 * Get scenario analysis for price predictions - PAID $0.068
 */
export async function getScenarioAnalysis(params: {
  token_id?: string;
  symbol?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('scenario-analysis', apiParams, paymentToken);
}

/**
 * Get AI-generated reports for tokens - PAID $0.068
 */
export async function getTokensAiReport(params: {
  token_id?: string;
  symbol?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('ai-reports', apiParams, paymentToken);
}

/**
 * Get quantitative metrics for tokens - PAID $0.068
 */
export async function getQuantmetrics(params: {
  token_id?: string;
  symbol?: string;
  category?: string;
  exchange?: string;
  marketcap?: string;
  volume?: string;
  fdv?: string;
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('quantmetrics', apiParams, paymentToken);
}

/**
 * Get crypto investors data - PAID $0.068
 */
export async function getCryptoInvestors(params: {
  limit?: number;
  page?: number;
  paymentToken?: 'usdc' | 'tmai';
}): Promise<TokenMetricsResponse> {
  const { paymentToken = 'usdc', ...apiParams } = params;
  return callPaidEndpoint('crypto-investors', apiParams, paymentToken);
}