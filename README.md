# TM Crypto Neural Network

A radar interface for tracking bullish cryptocurrency signals using Token Metrics API integrated with Coinbase's x402 payment framework.

## What it does

Spots bullish crypto trading opportunities by visualizing:
- Trading signals with positive sentiment
- Trader grades (short-term analysis)
- AI-generated market reports
- Real-time positioning based on performance metrics

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set environment variables:
```bash
# Coinbase AgentKit with Token Metrics API - Environment Configuration
# Copy this file to .env and fill in your actual values

# Coinbase Developer Platform API Keys - Get from: https://portal.cdp.coinbase.com/
CDP_API_KEY_ID=your-cdp-api-key-id-here
CDP_API_KEY_SECRET=your-cdp-api-key-secret-here

# Network ID - Only base-mainnet is supported
NETWORK_ID=base-mainnet


# Optional: Your wallet private key
PRIVATE_KEY= 
```

3. Run development server:
```bash
pnpm dev
```

4. Build and run:
```bash
pnpm build
pnpm start
```

## Features

- **Radar visualization**: Tokens positioned by trader grade (x-axis) and trading returns (y-axis)
- **Market cap/volume filtering**: Filter signals by market size and trading activity
- **AI reports**: On-demand analysis for tokens with available data
- **Web3 payments**: Pay for premium endpoints using USDC/TMAI via x402 protocol
- **Real-time updates**: Auto-refresh every 5 minutes

## Tech Stack

- Next.js 15 with App Router
- Token Metrics API (free + paid endpoints)
- Coinbase CDP + x402 payment protocol
- Canvas-based radar interface

## Purpose

Integrate Token Metrics premium data with Coinbase's x402, Web3 payment infrastructure to create a unique crypto signals dashboard.