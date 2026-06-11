import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCountdownOptions {
  autoStart?: boolean;
  interval?: number;
  onComplete?: () => void;
  onTick?: (timeLeft: number) => void;
}

interface UseCountdownReturn {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  formattedTime: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useCountdown(
  initialTime: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const {
    autoStart = true,
    interval = 1000,
    onComplete,
    onTick,
  } = options;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      const newTime = prev - 1;
      
      if (newTime <= 0) {
        clearTimer();
        setIsRunning(false);
        setIsCompleted(true);
        onCompleteRef.current?.();
        return 0;
      }
      
      onTickRef.current?.(newTime);
      return newTime;
    });
  }, [clearTimer]);

  const start = useCallback(() => {
    if (isRunning || intervalRef.current) return;
    
    setIsRunning(true);
    setIsPaused(false);
    setIsCompleted(false);
    
    intervalRef.current = window.setInterval(tick, interval);
  }, [isRunning, interval, tick]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    
    clearTimer();
    setIsRunning(false);
    setIsPaused(true);
  }, [isRunning, isPaused, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning || timeLeft <= 0) return;
    
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = window.setInterval(tick, interval);
  }, [isRunning, timeLeft, interval, tick]);

  const reset = useCallback((newTime?: number) => {
    clearTimer();
    setTimeLeft(newTime ?? initialTime);
    setIsRunning(false);
    setIsPaused(false);
    setIsCompleted(false);
  }, [initialTime, clearTimer]);

  useEffect(() => {
    if (autoStart && timeLeft > 0) {
      start();
    }

    return () => {
      clearTimer();
    };
  }, [autoStart, timeLeft, start, clearTimer]);

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = timeLeft % 60;

  const formattedTime = [
    days > 0 ? `${days}天` : null,
    hours > 0 || days > 0 ? `${hours.toString().padStart(2, '0')}:` : null,
    `${minutes.toString().padStart(2, '0')}:`,
    `${seconds.toString().padStart(2, '0')}`,
  ]
    .filter(Boolean)
    .join('');

  return {
    timeLeft,
    isRunning,
    isPaused,
    isCompleted,
    start,
    pause,
    resume,
    reset,
    formattedTime,
    days,
    hours,
    minutes,
    seconds,
  };
}
