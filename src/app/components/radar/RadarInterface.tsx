'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './radar.module.css';
import type { RadarSignal } from '@/types/api';

interface RadarInterfaceProps {
  signals: RadarSignal[];
  onSignalSelect: (signal: RadarSignal) => void;
}

export default function RadarInterface({ signals, onSignalSelect }: RadarInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef<number>(0); // Keep rotation in a ref to persist across renders
  const [hoveredSignal, setHoveredSignal] = useState<RadarSignal | null>(null);
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);
    const radius = Math.min(centerX, centerY) * 0.9;
    
    // Animation loop - use ref for rotation to maintain state
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      
      // Draw radar background
      drawRadarBackground(ctx, centerX, centerY, radius);
      
      // Draw rotating sweep line
      drawSweepLine(ctx, centerX, centerY, radius, rotationRef.current);
      
      // Draw signals as blips
      drawSignals(ctx, centerX, centerY, radius, signals, rotationRef.current);
      
      // Update rotation independently of mouse or state changes
      rotationRef.current += 0.01;
      if (rotationRef.current > Math.PI * 2) rotationRef.current = 0;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Mouse interaction - cursor changes and tooltip position
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update mouse position for tooltip (use absolute screen coordinates)
      setCanvasMousePos({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over a signal for cursor change and tooltip
      const hovered = signals.find(signal => {
        const signalX = centerX + Math.cos(signal.angle) * signal.distance * radius;
        const signalY = centerY - Math.sin(signal.angle) * signal.distance * radius;
        const dist = Math.sqrt((x - signalX) ** 2 + (y - signalY) ** 2);
        return dist < 15;
      });
      
      setHoveredSignal(hovered || null);
      
      // Change cursor
      canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
    };
    
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Find the clicked signal
      const clickedSignal = signals.find(signal => {
        const signalX = centerX + Math.cos(signal.angle) * signal.distance * radius;
        const signalY = centerY - Math.sin(signal.angle) * signal.distance * radius;
        const dist = Math.sqrt((x - signalX) ** 2 + (y - signalY) ** 2);
        return dist < 15;
      });
      
      if (clickedSignal) {
        console.log('🎯 Clicked signal:', clickedSignal.symbol);
        onSignalSelect(clickedSignal);
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals, onSignalSelect]);
  
  const drawRadarBackground = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) => {
    // Draw concentric circles
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius * i) / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(87, 139, 250, 0.2)'; // Coinbase blue
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw cross lines
    ctx.strokeStyle = 'rgba(87, 139, 250, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    
    // Draw diagonal lines
    const diag = radius * 0.707;
    ctx.beginPath();
    ctx.moveTo(cx - diag, cy - diag);
    ctx.lineTo(cx + diag, cy + diag);
    ctx.moveTo(cx - diag, cy + diag);
    ctx.lineTo(cx + diag, cy - diag);
    ctx.stroke();
  }, []);
  
  const drawSweepLine = useCallback((ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rotation: number) => {
    // Create gradient for sweep effect
    const gradient = ctx.createLinearGradient(
      cx,
      cy,
      cx + Math.cos(rotation) * radius,
      cy + Math.sin(rotation) * radius
    );
    gradient.addColorStop(0, 'rgba(255, 207, 48, 0)'); // Token Metrics yellow
    gradient.addColorStop(0.5, 'rgba(255, 207, 48, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 207, 48, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rotation) * radius, cy + Math.sin(rotation) * radius);
    ctx.stroke();
    
    // Draw trailing fade
    for (let i = 1; i <= 5; i++) {
      const fadeRotation = rotation - (i * 0.1);
      const opacity = 0.2 - (i * 0.04);
      ctx.strokeStyle = `rgba(255, 207, 48, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(fadeRotation) * radius, cy + Math.sin(fadeRotation) * radius);
      ctx.stroke();
    }
  }, []);
  
  const drawSignals = useCallback((
    ctx: CanvasRenderingContext2D, 
    cx: number, 
    cy: number, 
    radius: number, 
    signals: RadarSignal[],
    sweepRotation: number
  ) => {
    signals.forEach(signal => {
      const x = cx + Math.cos(signal.angle) * signal.distance * radius;
      const y = cy - Math.sin(signal.angle) * signal.distance * radius;
      
      // Calculate if signal was recently "pinged" by sweep
      const angleDiff = Math.abs(sweepRotation - signal.angle);
      const isPinged = angleDiff < 0.3 || angleDiff > (Math.PI * 2 - 0.3);
      
      // Treasure map sizing: larger dots for higher trading returns
      const minSize = 6; // Minimum size for negative returns
      const maxSize = 20; // Maximum size for big winners
      // Scale size based on trading returns (already in percentage), with minimum for negative
      const returnScale = signal.tradingReturns < 0 ? 0 : Math.min(signal.tradingReturns / 100, 1);
      const baseSize = minSize + (returnScale * (maxSize - minSize));
      const size = isPinged ? baseSize * 1.5 : baseSize;
      const opacity = isPinged ? 1 : 0.7;
      
      // Color based on delta: golden for positive delta, pale for negative
      const isPositiveDelta = signal.returnsDelta > 0;
      const signalColor = isPositiveDelta ? '255, 207, 48' : '200, 200, 200'; // Golden or Pale gray
      
      // Glow effect
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      glowGradient.addColorStop(0, `rgba(${signalColor}, ${opacity})`);
      glowGradient.addColorStop(0.5, `rgba(${signalColor}, ${opacity * 0.3})`);
      glowGradient.addColorStop(1, `rgba(${signalColor}, 0)`);
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Core blip
      ctx.fillStyle = `rgba(${signalColor}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw hover ring for better click targeting
      if (hoveredSignal?.id === signal.id) {
        ctx.strokeStyle = '#FFCF30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [hoveredSignal]);
  
  return (
    <div className={styles.radarContainer}>
      <canvas ref={canvasRef} className={styles.radarCanvas} />
      
      {/* Simple hover tooltip showing just the symbol */}
      {hoveredSignal && (
        <div 
          className={styles.tooltip}
          style={{ 
            position: 'fixed',
            left: canvasMousePos.x + 10, 
            top: canvasMousePos.y - 30,
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <div className={styles.tooltipSymbol}>{hoveredSignal.symbol}</div>
        </div>
      )}
    </div>
  );
}