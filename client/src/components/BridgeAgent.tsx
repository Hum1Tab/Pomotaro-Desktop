import { useEffect, useRef } from 'react';

import { useSessionHistory } from '@/contexts/SessionHistoryContext';
import { usePomodoro } from '@/hooks/usePomodoro';
import { handleBridgeAction, type BridgeDeps, type StatsRange } from '@/lib/bridge-actions';
import type { DailyStats } from '@/types/session';

function summarizeDay(stats: DailyStats) {
  return {
    date: stats.date,
    totalFocusTime: stats.totalFocusTime,
    totalBreakTime: stats.totalBreakTime,
    pomodoroCount: stats.pomodoroCount,
  };
}

/**
 * Answers HTTP requests that were forwarded from the Rust bridge.
 *
 * Mounted once under the providers so it can serve requests from any screen.
 * The timer and history contexts stay the source of truth; this component only
 * translates an action into a context call and returns JSON.
 */
export function BridgeAgent() {
  const pomodoro = usePomodoro();
  const history = useSessionHistory();

  const latest = useRef({ pomodoro, history });
  useEffect(() => {
    latest.current = { pomodoro, history };
  });

  const depsRef = useRef<BridgeDeps | null>(null);
  if (!depsRef.current) {
    depsRef.current = {
      getStatus: () => {
        const { pomodoro: timer } = latest.current;
        return {
          isRunning: timer.isRunning,
          sessionType: timer.sessionType,
          timeLeft: timer.timeLeft,
          sessionsCompleted: timer.sessionsCompleted,
          settings: {
            pomodoroTime: timer.settings.pomodoroTime,
            shortBreakTime: timer.settings.shortBreakTime,
            longBreakTime: timer.settings.longBreakTime,
            longBreakInterval: timer.settings.longBreakInterval,
          },
        };
      },
      start: () => latest.current.pomodoro.start(),
      pause: () => latest.current.pomodoro.pause(),
      reset: () => latest.current.pomodoro.reset(),
      switchSession: (type) => latest.current.pomodoro.switchSession(type),
      getStats: (range: StatsRange) => {
        const { history: sessions } = latest.current;
        if (range === 'day') {
          return summarizeDay(sessions.getDailyStats());
        }
        if (range === 'week') {
          return Object.values(sessions.getWeeklyStats()).map(summarizeDay);
        }
        const now = new Date();
        return Object.values(sessions.getMonthlyStats(now.getFullYear(), now.getMonth())).map(
          summarizeDay,
        );
      },
    };
  }

  useEffect(() => {
    const api = window.desktopAPI;
    if (!api?.onBridgeRequest) return;

    return api.onBridgeRequest((request) => {
      const reply = handleBridgeAction(depsRef.current!, request.action, request.payload);
      void api
        .respondToBridge(request.id, reply)
        .catch((error) => console.error('Failed to answer bridge request', error));
    });
  }, []);

  return null;
}
