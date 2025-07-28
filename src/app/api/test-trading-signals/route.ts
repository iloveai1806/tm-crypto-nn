import { NextResponse } from 'next/server';
import { getTokensTradingSignal } from '@/lib/utils/token-metrics-methods';

export async function GET() {
  try {
    console.log('🧪 Testing getTokensTradingSignal function directly...');
    
    const result = await getTokensTradingSignal({
      signal: '1',
      limit: 10,
      paymentToken: 'usdc'
    });
    
    console.log('🧪 Test result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      test: 'getTokensTradingSignal',
      result
    });
  } catch (error) {
    console.error('🧪 Test error:', error);
    return NextResponse.json(
      { 
        test: 'getTokensTradingSignal',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}