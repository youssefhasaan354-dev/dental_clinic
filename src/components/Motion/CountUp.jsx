import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export const CountUp = ({
  value,
  duration = 1.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [displayValue, setDisplayValue] = useState(0);

  // Parse numeric target
  const target = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    let animId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isInView, target, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.floor(displayValue).toLocaleString();

  return (
    <span ref={ref} className={`motion-countup ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default CountUp;
