import React, { useEffect, useRef } from 'react';
import { GameStatus } from '../types';

interface GameCanvasProps {
  multiplier: number;
  status: GameStatus;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ multiplier, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planeImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = 'https://i.ibb.co/SD4SDF7n/1000033012.png'; 
    img.onload = () => {
      planeImgRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const padding = 60;
      const width = canvas.width;
      const height = canvas.height;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const xPos = (width / 10) * i;
        const yPos = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }

      if (status === 'WAITING') {
        ctx.font = '700 32px Orbitron';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.textAlign = 'center';
        ctx.fillText('PRERARING TAKEOFF...', width / 2, height / 2);
      } else {
        const t = Math.min((multiplier - 1) / 15, 1);
        const x = t * (width - padding * 3) + padding;
        const y = height - (Math.pow(t, 1.3) * (height - padding * 3) + padding);

        const gradient = ctx.createLinearGradient(padding, height - padding, x, y);
        gradient.addColorStop(0, 'rgba(112, 0, 255, 0)');
        gradient.addColorStop(1, status === 'CRASHED' ? 'rgba(255, 0, 77, 0.4)' : 'rgba(0, 242, 255, 0.3)');
        
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.quadraticCurveTo((x + padding) / 2, height - padding, x, y);
        ctx.lineTo(x, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.quadraticCurveTo((x + padding) / 2, height, x, y);
        ctx.strokeStyle = status === 'CRASHED' ? '#FF004D' : '#00F2FF';
        ctx.lineWidth = 8;
        ctx.stroke();

        if (planeImgRef.current) {
          const planeScale = 3.5;
          const planeW = 160 * planeScale;
          const planeH = 90 * planeScale;
          ctx.save();
          ctx.translate(x, y);
          const hover = Math.sin(Date.now() / 150) * 12;
          ctx.translate(0, status === 'FLYING' ? hover : 0);
          ctx.rotate(-0.1 - (t * 0.2));
          ctx.drawImage(planeImgRef.current, -planeW / 2, -planeH / 2, planeW, planeH);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-0.3);
          ctx.beginPath();
          ctx.moveTo(60, 0);
          ctx.lineTo(-30, 35);
          ctx.lineTo(-10, 0);
          ctx.lineTo(-30, -35);
          ctx.closePath();
          ctx.fillStyle = '#FF004D';
          ctx.fill();
          ctx.restore();
        }

        if (status === 'FLYING') {
          const glowSize = 100 + Math.sin(Date.now() / 100) * 20;
          const engineGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          engineGlow.addColorStop(0, 'rgba(0, 242, 255, 0.5)');
          engineGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = engineGlow;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [multiplier, status]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};
