import { useState, useEffect, useCallback, useRef } from 'react';

export interface StopwatchState {
  timeElapsed: number; // seconds
  isRunning: boolean;
  maxTime: number; // max 12 hours = 43200 seconds
}

export function useStopwatch() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const maxTime = 12 * 60 * 60; // 12 hours

  // Load initial state from localStorage
  useEffect(() => {
    const storedIsRunning = localStorage.getItem('stopwatch_isRunning') === 'true';
    const storedStartTime = parseInt(localStorage.getItem('stopwatch_startTime') || '0', 10);
    const storedAccumulated = parseFloat(localStorage.getItem('stopwatch_accumulated') || '0');

    setIsRunning(storedIsRunning);

    if (storedIsRunning && storedStartTime > 0) {
      const now = Date.now();
      const currentSegment = (now - storedStartTime) / 1000;
      setTimeElapsed(Math.min(storedAccumulated + currentSegment, maxTime));
    } else {
      setTimeElapsed(Math.min(storedAccumulated, maxTime));
    }
  }, []);

  // Update timer every second if running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        const storedStartTime = parseInt(localStorage.getItem('stopwatch_startTime') || '0', 10);
        const storedAccumulated = parseFloat(localStorage.getItem('stopwatch_accumulated') || '0');

        if (storedStartTime > 0) {
          const now = Date.now();
          const currentSegment = (now - storedStartTime) / 1000;
          const total = storedAccumulated + currentSegment;

          if (total >= maxTime) {
            setTimeElapsed(maxTime);
            pause(); // Auto-pause at max time
          } else {
            setTimeElapsed(total);
          }
        }
      }, 100); // Update frequently for smooth UI, though formatted time is seconds
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    const now = Date.now();
    localStorage.setItem('stopwatch_isRunning', 'true');
    localStorage.setItem('stopwatch_startTime', now.toString());
    // Accumulated time remains whatever it was (initially 0 or previously paused value)
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    const now = Date.now();
    const storedStartTime = parseInt(localStorage.getItem('stopwatch_startTime') || '0', 10);
    const storedAccumulated = parseFloat(localStorage.getItem('stopwatch_accumulated') || '0');

    if (storedStartTime > 0) {
      const currentSegment = (now - storedStartTime) / 1000;
      const newAccumulated = storedAccumulated + currentSegment;
      localStorage.setItem('stopwatch_accumulated', newAccumulated.toString());
    }

    localStorage.setItem('stopwatch_isRunning', 'false');
    localStorage.removeItem('stopwatch_startTime'); // Clear start time as we aren't running

    setIsRunning(false);
    // Update local state to match exact calculation
    const currentAccumulated = parseFloat(localStorage.getItem('stopwatch_accumulated') || '0');
    setTimeElapsed(Math.min(currentAccumulated, maxTime));
  }, []);

  const reset = useCallback(() => {
    localStorage.setItem('stopwatch_isRunning', 'false');
    localStorage.setItem('stopwatch_accumulated', '0');
    localStorage.removeItem('stopwatch_startTime');

    setIsRunning(false);
    setTimeElapsed(0);
  }, []);

  const addTime = useCallback((seconds: number) => {
    const storedAccumulated = parseFloat(localStorage.getItem('stopwatch_accumulated') || '0');
    const newAccumulated = Math.min(storedAccumulated + seconds, maxTime);
    localStorage.setItem('stopwatch_accumulated', newAccumulated.toString());

    // If not running, update UI immediately. If running, the interval will pick it up (base accumulated increased)
    if (!localStorage.getItem('stopwatch_isRunning') || localStorage.getItem('stopwatch_isRunning') === 'false') {
      setTimeElapsed(newAccumulated);
    } else {
      // If running, we technically need to effectively 'shift' the start time or just let the accumulation logic handle it.
      // Our logic: total = accumulated + (now - start). If we increase accumulated, total increases. Correct.
      // Force a quick UI update
      const storedStartTime = parseInt(localStorage.getItem('stopwatch_startTime') || '0', 10);
      const now = Date.now();
      const currentSegment = (now - storedStartTime) / 1000;
      setTimeElapsed(Math.min(newAccumulated + currentSegment, maxTime));
    }
  }, []);

  const setTime = useCallback((seconds: number) => {
    const newTime = Math.min(Math.max(0, seconds), maxTime);
    localStorage.setItem('stopwatch_accumulated', newTime.toString());

    if (localStorage.getItem('stopwatch_isRunning') === 'true') {
      // If setting absolute time while running, effectively reset the 'current segment' approach
      // Easier: Just update accumulated to target, and reset start time to NOW.
      // So: total = newTime + (now - now) = newTime.
      localStorage.setItem('stopwatch_startTime', Date.now().toString());
    }
    setTimeElapsed(newTime);
  }, []);

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    timeElapsed,
    isRunning,
    maxTime,
    start,
    pause,
    reset,
    addTime,
    setTime,
    formatTime,
  };
}
