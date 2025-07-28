'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import PricingTable from './components/PricingTable';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Neural network nodes
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      connections: number[];
    }> = [];

    const nodeCount = 50;
    const connectionDistance = 150;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        color: i % 2 === 0 ? '#578bfa' : '#FFCF30',
        connections: []
      });
    }

    // Animation variables
    let mouseX = 0;
    let mouseY = 0;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Mouse interaction
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          node.x -= dx * 0.01;
          node.y -= dy * 0.01;
        }

        // Draw connections
        node.connections = [];
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              node.connections.push(j);
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              const opacity = 1 - distance / connectionDistance;
              ctx.strokeStyle = (i + j) % 2 === 0
                ? `rgba(87, 139, 250, ${opacity})` 
                : `rgba(255, 207, 48, ${opacity * 0.5})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4);
        gradient.addColorStop(0, node.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Title animation
    if (titleRef.current) {
      const title = titleRef.current;
      const text = title.textContent || '';
      title.textContent = '';
      
      let charIndex = 0;
      const typeText = () => {
        if (charIndex < text.length) {
          title.textContent += text[charIndex];
          charIndex++;
          setTimeout(typeText, 100);
        }
      };
      
      setTimeout(typeText, 500);
    }

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.backgroundCanvas} />
      
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 ref={titleRef} className={styles.title}>
            Radar
          </h1>
          <div className={styles.logoIntegration}>
            <Image src="/tokenmetrics-logo.png" alt="Token Metrics" className={styles.integrationLogo} width={150} height={60} />
            <span className={styles.plus}>+</span>
            <Image src="/coinbase-logo.jpg" alt="Coinbase" className={styles.integrationLogo} width={150} height={60} />
          </div>
          <p className={styles.subtitle}>
            Token Metrics API with Coinbase x402 Payments
          </p>
          <p className={styles.description}>
            Access Token Metrics data from FREE to $0.068 per call.
            Choose from 20+ endpoints with flexible pricing tiers and TMAI token discounts.
          </p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🆓</div>
            <h3>7 Free Endpoints</h3>
            <p>Price data, trader grades, trading signals, and OHLCV - no wallet needed.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>💎</div>
            <h3>Premium AI Insights</h3>
            <p>AI reports, sentiment analysis, and advanced metrics from $0.017 to $0.068 per call.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>TMAI Discounts</h3>
            <p>Get 10% off all paid endpoints when paying with TMAI token vs USDC.</p>
          </div>
        </div>

        <div className={styles.ctas}>
          <Link href="/signal" className={styles.primaryCta}>
            <span className={styles.ctaText}>Launch Radar</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>
          <a 
            href="https://developers.tokenmetrics.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.secondaryCta}
          >
            <span>API Documentation</span>
          </a>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>7</span>
            <span className={styles.statLabel}>Free Endpoints</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>10%</span>
            <span className={styles.statLabel}>TMAI Discount</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>20+</span>
            <span className={styles.statLabel}>Total Endpoints</span>
          </div>
        </div>
        
        <PricingTable />
        
        <div className={styles.howItWorks}>
          <h2>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h4>Start Free</h4>
              <p>Use 3 free endpoints including price data, token info, top tokens by market cap</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h4>Choose Payment Token</h4>
              <p>Connect wallet and select USDC or TMAI (10% discount)</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h4>Access Premium</h4>
              <p>Pay per call: $0.017, $0.034, or $0.068 for advanced features</p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Built with 💙 by developers, for developers</p>
          <p className={styles.footerHighlight}>
            20+ Token Metrics API endpoints with tiered pricing - From free basics to premium AI insights
          </p>
        </div>
      </footer>
    </div>
  );
}
