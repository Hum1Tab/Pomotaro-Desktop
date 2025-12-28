import { usePomodoroContext, PomodoroSettings, SessionType } from '@/contexts/PomodoroContext';

export type { PomodoroSettings, SessionType };

export function usePomodoro() {
  return usePomodoroContext();
}
