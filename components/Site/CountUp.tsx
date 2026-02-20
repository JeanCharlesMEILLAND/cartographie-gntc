'use client';

import { useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  separator?: string;
}

export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 1800,
  className = '',
  separator = '\u00a0',
}: CountUpProps) {
  const { ref, inView } = useInView({ threshold: 0.3 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);

      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  const formatted = display.toLocaleString('fr-FR');

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
