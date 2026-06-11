import { useState, useEffect, useRef, useCallback } from 'react';

interface UseNumberAnimationOptions {
  duration?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  decimals?: number;
  format?: (value: number) => string;
  delay?: number;
}

interface UseNumberAnimationReturn {
  value: number;
  formattedValue: string;
  isAnimating: boolean;
  start: (targetValue?: number) => void;
  reset: () => void;
}

const easings: Record<string, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

export function useNumberAnimation(
  targetValue: number,
  options: UseNumberAnimationOptions = {}
): UseNumberAnimationReturn {
  const {
    duration = 1000,
    easing = 'easeOut',
    decimals = 0,
    format,
    delay = 0,
  } = options;

  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startValueRef = useRef(0);
  const targetValueRef = useRef(targetValue);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);

  const formatValue = useCallback(
    (value: number): string => {
      const rounded = Number(value.toFixed(decimals));
      if (format) {
        return format(rounded);
      }
      return rounded.toLocaleString();
    },
    [decimals, format]
  );

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easings[easing](progress);

      const newValue =
        startValueRef.current +
        (targetValueRef.current - startValueRef.current) * easedProgress;

      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValueRef.current);
        setIsAnimating(false);
        animationRef.current = null;
        startTimeRef.current = null;
      }
    },
    [duration, easing]
  );

  const start = useCallback(
    (newTargetValue?: number) => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (newTargetValue !== undefined) {
        targetValueRef.current = newTargetValue;
      }

      startValueRef.current = currentValue;
      startTimeRef.current = null;
      setIsAnimating(true);

      const startAnimation = () => {
        animationRef.current = requestAnimationFrame(animate);
      };

      if (delay > 0) {
        delayTimeoutRef.current = window.setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    },
    [currentValue, delay, animate]
  );

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
    setCurrentValue(0);
    setIsAnimating(false);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    targetValueRef.current = targetValue;
  }, [targetValue]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);

  return {
    value: currentValue,
    formattedValue: formatValue(currentValue),
    isAnimating,
    start,
    reset,
  };
}
