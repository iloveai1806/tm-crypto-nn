import { NextResponse } from 'next/server';
import { 
  getTokensTradingSignal, 
  getTokensTraderGrade,
  getTokensAiReport,
  getSupportedTokens
} from '@/lib/utils/token-metrics-methods';
import type { TradingSignal, TraderGrade, AIReport, TokenInfo, RadarSignal, CacheData } from '@/types/api';

// In-memory cache
let cache: CacheData | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketcap = searchParams.get('marketcap');
    const volume = searchParams.get('volume');
    
    // Create a cache key that includes filter parameters
    const cacheKey = `${marketcap || ''}-${volume || ''}`;
    
    // Check cache first (now with filter-specific caching)
    if (cache && cache.cacheKey === cacheKey && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log('📦 Returning cached data for filters:', { marketcap, volume });
      return NextResponse.json(cache.data);
    }

    console.log('🎯 Fetching bullish trading signals with filters:', { marketcap, volume });
    
    // 1. Get trading signals filtered by signal=1 (bullish) - PAID $0.017
    const signalsParams: {
      signal: string;
      limit: number;
      marketcap?: string;
      volume?: string;
    } = {
      signal: '1', // Filter for bullish signals only
      limit: 50   // Get 50 latest bullish signals
    };
    
    // Add filter parameters if provided
    if (marketcap) signalsParams.marketcap = marketcap;
    if (volume) signalsParams.volume = volume;
    
    console.log('📋 Request params:', signalsParams);
    const signalsResponse = await getTokensTradingSignal(signalsParams);
    console.log('📋 Response success:', signalsResponse.success);
    console.log('📋 Response data length:', signalsResponse.data?.length || 0);
    
    if (!signalsResponse.success) {
      console.error('❌ Trading signals API error:', signalsResponse.error);
      console.error('❌ Request params:', signalsParams);
      
      // Return empty result instead of throwing error to prevent app crash
      const emptyResponse = {
        success: true,
        data: [],
        timestamp: Date.now(),
        count: 0,
        message: signalsResponse.error?.includes('404') 
          ? 'The requested filters are not supported by the API. Try different criteria.'
          : `Failed to fetch signals: ${signalsResponse.error}`
      };
      
      cache = {
        data: emptyResponse,
        timestamp: Date.now(),
        cacheKey: cacheKey
      };
      
      return NextResponse.json(emptyResponse);
    }
    
    // 2. Get all bullish signals
    const allSignals: TradingSignal[] = signalsResponse.data || [];
    
    console.log(`📊 Found ${allSignals.length} bullish signals`);
    
    if (!allSignals.length) {
      console.log('⚠️ No bullish signals found, returning empty result');
      const emptyResponse = {
        success: true,
        data: [],
        timestamp: Date.now(),
        count: 0
      };
      
      // Cache empty result too
      cache = {
        data: emptyResponse,
        timestamp: Date.now(),
        cacheKey: cacheKey
      };
      
      return NextResponse.json(emptyResponse);
    }
    
    // 3. Get token IDs for additional data fetching
    const signalTokenIds = allSignals.map((t) => t.TOKEN_ID).join(',');
    
    // 4. Fetch trader grades, AI reports, and token info
    const [gradesResponse, aiReportsResponse, tokensInfoResponse] = await Promise.all([
      getTokensTraderGrade({ token_id: signalTokenIds, limit: 50 }), // PAID $0.017
      getTokensAiReport({ token_id: signalTokenIds, limit: 50 }),    // PAID $0.068
      getSupportedTokens({ token_id: signalTokenIds, limit: 50 })    // FREE
    ]);
    
    console.log(`🤖 Fetched ${aiReportsResponse.data?.length || 0} AI reports`);
    
    // Log the token info to see market caps
    const tokenInfoArray = tokensInfoResponse?.data as TokenInfo[];
    if (tokenInfoArray && marketcap) {
      console.log('📊 Market caps of returned tokens:');
      tokenInfoArray.forEach(token => {
        if (token.MARKET_CAP) {
          console.log(`  ${token.TOKEN_SYMBOL}: $${(token.MARKET_CAP / 1e9).toFixed(2)}B`);
        }
      });
    }
    
    // 5. Merge all data for each token
    const radarData: RadarSignal[] = allSignals.map((signal) => {
      const gradeData = (gradesResponse?.data as TraderGrade[])?.find((g) => g.TOKEN_ID === signal.TOKEN_ID);
      const aiReportData = (aiReportsResponse?.data as AIReport[])?.find((a) => a.TOKEN_ID === signal.TOKEN_ID);
      const tokenInfo = (tokensInfoResponse?.data as TokenInfo[])?.find((t) => t.TOKEN_ID === signal.TOKEN_ID);
      
      // Calculate radar position based on rules:
      // X-axis (right): Higher trader grade = further right
      // Y-axis (up): Higher trading returns = further up
      const traderGrade = signal.TM_TRADER_GRADE || gradeData?.TM_TRADER_GRADE || 70;
      const tradingReturns = signal.TRADING_SIGNALS_RETURNS || 0;
      const holdingReturns = signal.HOLDING_RETURNS || 0;
      
      // Normalize trader grade (0-100) to radar X position (-0.8 to 0.8)
      const normalizedGrade = Math.max(0, Math.min(100, traderGrade)) / 100; // 0-1
      const radarX = (normalizedGrade * 1.6) - 0.8; // -0.8 to 0.8
      
      // Normalize trading returns (assume range -50% to +150%) to radar Y position (-0.8 to 0.8)
      const clampedReturns = Math.max(-50, Math.min(150, tradingReturns)); // Clamp to reasonable range
      const normalizedReturns = (clampedReturns + 50) / 200; // 0-1
      const radarY = (normalizedReturns * 1.6) - 0.8; // -0.8 to 0.8
      
      // Calculate angle and distance from radar center for radar interface
      const angle = Math.atan2(radarY, radarX);
      const distance = Math.sqrt(radarX * radarX + radarY * radarY);
      
      // Calculate returns delta for coloring
      const returnsDelta = tradingReturns - holdingReturns;
      
      return {
        id: signal.TOKEN_ID,
        symbol: signal.TOKEN_SYMBOL || tokenInfo?.TOKEN_SYMBOL || 'UNKNOWN',
        name: signal.TOKEN_NAME || tokenInfo?.TOKEN_NAME || 'Unknown Token',
        signal: signal.TRADING_SIGNAL, // Already a number
        signalDate: signal.DATE,
        traderGrade: traderGrade,
        traderGradeChange: gradeData?.TM_TRADER_GRADE_24H_PCT_CHANGE || 0,
        // Returns data for visualization
        tradingReturns: tradingReturns,
        holdingReturns: holdingReturns,
        returnsDelta: returnsDelta,
        // AI report from bulk fetch - combine all analysis fields
        aiReport: aiReportData ? 
          [
            aiReportData.INVESTMENT_ANALYSIS_POINTER,
            aiReportData.INVESTMENT_ANALYSIS, 
            aiReportData.DEEP_DIVE,
            aiReportData.CODE_REVIEW
          ].filter(Boolean).join('\n\n') || null 
          : null,
        // Token Metrics link
        tmLink: signal.TM_LINK,
        // Radar positioning
        angle: angle,
        distance: distance,
        // Additional metadata
        category: tokenInfo?.CATEGORY || 'Unknown',
        marketcap: tokenInfo?.MARKET_CAP,
        volume: tokenInfo?.VOLUME_24H
      };
    });
    
    // Sort by trader grade (highest first)
    radarData.sort((a, b) => b.traderGrade - a.traderGrade);
    
    // 6. Cache the response
    const response = {
      success: true,
      data: radarData, // Show all available tokens
      timestamp: Date.now(),
      count: radarData.length
    };
    
    cache = {
      data: response,
      timestamp: Date.now(),
      cacheKey: cacheKey
    };
    
    console.log(`✅ Radar ready: ${response.data.length} signals cached`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Radar signals API error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      stringified: JSON.stringify(error)
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch radar signals',
        errorDetails: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

// Force refresh endpoint
export async function POST(request: Request) {
  cache = null;
  console.log('🔄 Cache cleared, forcing refresh');
  return GET(request);
}