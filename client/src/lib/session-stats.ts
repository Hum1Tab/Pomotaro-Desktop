import type { DailyStats, SessionRecord, StatsMap } from '@/types/session';

/**
 * Local-time `YYYY-MM-DD` key.
 *
 * `toLocaleDateString('en-CA')` produced the same shape but it is locale
 * dependent (and noticeably slower when called once per session on every
 * history change). Formatting the parts manually keeps the behaviour stable
 * across platforms and is what the calendar and stats screens expect.
 */
export function toDateKey(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDailyStats(date: string): DailyStats {
  return {
    date,
    totalFocusTime: 0,
    pomodoroCount: 0,
    totalBreakTime: 0,
    sessions: [],
  };
}

/** One pass over the history, grouped by local date. */
export function buildStatsCache(history: SessionRecord[]): StatsMap {
  const cache: StatsMap = {};

  for (const session of history) {
    const dateKey = toDateKey(session.timestamp);
    if (!dateKey) continue;

    const dayStats = cache[dateKey] ?? (cache[dateKey] = createDailyStats(dateKey));
    dayStats.sessions.push(session);

    if (session.sessionType === 'pomodoro') {
      dayStats.totalFocusTime += session.duration;
      dayStats.pomodoroCount += 1;
    } else {
      dayStats.totalBreakTime += session.duration;
    }
  }

  return cache;
}

/** Merge an import into the existing history, newest first, without duplicates. */
export function mergeSessionRecords(
  existing: SessionRecord[],
  imported: SessionRecord[],
): SessionRecord[] {
  const existingIds = new Set(existing.map((session) => session.id));
  const next = imported.filter((session) => session && !existingIds.has(session.id));
  const merged = [...next, ...existing];

  merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return merged;
}

export interface TotalStats {
  totalFocusTime: number;
  totalBreakTime: number;
  pomodoroCount: number;
  totalSessions: number;
}

export function summarizeSessions(history: SessionRecord[]): TotalStats {
  let totalFocusTime = 0;
  let totalBreakTime = 0;
  let pomodoroCount = 0;

  for (const session of history) {
    if (session.sessionType === 'pomodoro') {
      totalFocusTime += session.duration;
      pomodoroCount += 1;
    } else {
      totalBreakTime += session.duration;
    }
  }

  return { totalFocusTime, totalBreakTime, pomodoroCount, totalSessions: history.length };
}

/** Date keys for the last `days` days, oldest first, including `today`. */
export function lastNDateKeys(today: Date, days: number): string[] {
  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    keys.push(toDateKey(date));
  }
  return keys;
}
