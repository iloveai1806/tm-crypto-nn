import { NextResponse } from 'next/server';
import { getTokensAiReport } from '@/lib/utils/token-metrics-methods';

export async function POST(request: Request) {
  try {
    const { token_id, symbol } = await request.json();
    
    if (!token_id) {
      return NextResponse.json(
        { success: false, error: 'Token ID is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 Fetching AI report for ${symbol} (ID: ${token_id})`);
    
    // Fetch AI report from Token Metrics API
    const aiReportResponse = await getTokensAiReport({
      token_id: token_id.toString(),
      limit: 1
    });
    
    if (!aiReportResponse.success) {
      console.error('❌ AI report API error:', aiReportResponse.error);
      return NextResponse.json({
        success: false,
        error: aiReportResponse.error || 'Failed to fetch AI report'
      }, { status: 500 });
    }

    const aiData = aiReportResponse.data?.[0];
    let aiReport = 'No AI report available for this token';
    
    if (aiData) {
      // Combine all AI report fields (same logic as radar-signals route)
      const reportParts = [
        aiData.INVESTMENT_ANALYSIS_POINTER,
        aiData.INVESTMENT_ANALYSIS,
        aiData.DEEP_DIVE,
        aiData.CODE_REVIEW
      ].filter(Boolean);
      
      aiReport = reportParts.length > 0 
        ? reportParts.join('\n\n')
        : 'AI analysis is being processed...';
    }
    
    console.log(`✅ AI report fetched for ${symbol}, length: ${aiReport.length} chars`);

    return NextResponse.json({
      success: true,
      data: {
        tokenId: token_id,
        symbol: symbol,
        aiReport: aiReport,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ AI report API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch AI report'
      },
      { status: 500 }
    );
  }
}