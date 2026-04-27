'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  /** Base drift — constant, never damped */
  vx: number;
  vy: number;
  /** Extra velocity from mouse repulsion — decays each frame */
  evx: number;
  evy: number;
  radius: number;
  opacity: number;
  color: string;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles — keep count low for GPU/CPU budget
    const particleCount = Math.min(40, Math.floor(window.innerWidth / 28));
    const colors = ['#C5A059', '#00E676', '#FFFFFF'];
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.35 + 0.15; // guaranteed non-zero drift
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        evx: 0,
        evy: 0,
        radius: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.55 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion — every 3rd frame only
        if (frame % 3 === 0) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 0.015;
            p.evx -= (dx / dist) * force;
            p.evy -= (dy / dist) * force;
          }
        }

        // Decay extra velocity — base drift (vx/vy) is never touched
        p.evx *= 0.97;
        p.evy *= 0.97;

        // Update position: base drift + repulsion extra
        p.x += p.vx + p.evx;
        p.y += p.vy + p.evy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Draw connections — only every other particle, tighter radius
        if (i % 2 === 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 6400) { // 80px radius (sq avoids sqrt until needed)
              const dist = Math.sqrt(distSq);
              const alpha = (1 - dist / 80) * 0.15;
              if (alpha > 0.02) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}
