'use client';

import styles from './pricingTable.module.css';

export default function PricingTable() {
  const endpoints = [
    {
      price: 'FREE',
      description: 'No wallet needed',
      endpoints: [
        '/tokens - Token metadata and IDs',
        '/price - Live price streams',
        '/top-market-cap-tokens - Tokens ranked by market cap'
      ]
    },
    {
      price: '$0.017 USDC',
      description: '$0.0153 with TMAI (-10%)',
      endpoints: [
        '/investor-grades - Long-term investor ratings',
        '/sentiment - Social sentiment analysis',
        '/hourly-trading-signals - Frequent short-term signals',
        '/trader-grades - AI trader scores',
        '/trading-signals - Entry/exit signals',
        '/hourly-ohlcv - Hourly historical prices',
        '/daily-ohlcv - Daily historical prices'
      ]
    },
    {
      price: '$0.034 USDC',
      description: '$0.0306 with TMAI (-10%)',
      endpoints: [
        '/resistance-support - Price levels & volatility',
        '/market-metrics - Bullish/Bearish indicators',
        '/indices - AI-powered crypto indices',
        '/indices-holdings - Index components',
        '/indices-performance - Index returns'
      ]
    },
    {
      price: '$0.068 USDC',
      description: '$0.0612 with TMAI (-10%)',
      endpoints: [
        '/correlation - Token correlation analytics',
        '/scenario-analysis - Hypothetical investment simulations',
        '/ai-reports - Token/market research',
        '/quantmetrics - Investor activity & ranking',
        '/crypto-investors - On-chain investor tracking',
        '/moonshot-tokens - AI-curated high potential tokens'
      ]
    }
  ];

  return (
    <div className={styles.pricingSection}>
      <h2>API Pricing Tiers</h2>
      <div className={styles.pricingGrid}>
        {endpoints.map((tier, index) => (
          <div key={index} className={styles.pricingCard}>
            <h3 className={styles.price}>{tier.price}</h3>
            <div className={styles.description}>{tier.description}</div>
            <ul className={styles.endpointList}>
              {tier.endpoints.map((endpoint, i) => (
                <li key={i}>{endpoint}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}