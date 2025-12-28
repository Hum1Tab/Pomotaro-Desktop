import { useState, useCallback } from 'react';

export interface TimerExtension {
  id: string;
  duration: number; // seconds
  timestamp: number;
}

export function useTimerExtension() {
  const [extensions, setExtensions] = useState<TimerExtension[]>([]);

  const addExtension = useCallback((duration: number) => {
    const newExtension: TimerExtension = {
      id: Date.now().toString(),
      duration,
      timestamp: Date.now(),
    };
    setExtensions((prev) => [newExtension, ...prev]);
    return newExtension;
  }, []);

  const removeExtension = useCallback((id: string) => {
    setExtensions((prev) => prev.filter((ext) => ext.id !== id));
  }, []);

  const getTotalExtensionTime = useCallback(() => {
    return extensions.reduce((sum, ext) => sum + ext.duration, 0);
  }, [extensions]);

  const clearExtensions = useCallback(() => {
    setExtensions([]);
  }, []);

  return {
    extensions,
    addExtension,
    removeExtension,
    getTotalExtensionTime,
    clearExtensions,
  };
}
