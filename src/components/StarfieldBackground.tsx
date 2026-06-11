import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface StarfieldBackgroundProps {
  starCount?: number;
  speed?: number;
}

export default function StarfieldBackground({
  starCount = 150,
  speed = 0.5,
}: StarfieldBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!ctx) return;
      timeRef.current += 0.016 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => {
        const x = (star.x / 100) * canvas.width;
        const y = (star.y / 100) * canvas.height;
        const twinkle = Math.sin(
          timeRef.current * star.twinkleSpeed + star.twinkleOffset
        );
        const opacity = star.opacity + twinkle * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, opacity))})`;
        ctx.fill();

        if (star.size > 1.5) {
          const gradient = ctx.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            star.size * 3
          );
          gradient.addColorStop(0, `rgba(200, 180, 255, ${opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(200, 180, 255, 0)');
          ctx.beginPath();
          ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [starCount, speed]);

  return <div ref={containerRef} className="starfield" />;
}
