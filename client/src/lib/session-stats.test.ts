import { describe, expect, it } from 'vitest';

import {
  buildStatsCache,
  createDailyStats,
  lastNDateKeys,
  mergeSessionRecords,
  summarizeSessions,
  toDateKey,
} from '@/lib/session-stats';
import type { SessionRecord } from '@/types/session';

function session(overrides: Partial<SessionRecord>): SessionRecord {
  return {
    id: 'session-1',
    duration: 1500,
    timestamp: new Date(2024, 0, 5, 10, 0).toISOString(),
    sessionType: 'pomodoro',
    ...overrides,
  };
}

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toDateKey(new Date(2024, 0, 5, 23, 59))).toBe('2024-01-05');
    expect(toDateKey(new Date(2024, 11, 31, 0, 0))).toBe('2024-12-31');
  });

  it('returns an empty string for invalid input', () => {
    expect(toDateKey('not-a-date')).toBe('');
  });
});

describe('buildStatsCache', () => {
  it('groups sessions by local day and splits focus from breaks', () => {
    const history: SessionRecord[] = [
      session({ id: 'a', duration: 1500 }),
      session({ id: 'b', duration: 300, sessionType: 'shortBreak' }),
      session({ id: 'c', timestamp: new Date(2024, 0, 5, 18, 0).toISOString(), duration: 1200 }),
      session({ id: 'd', timestamp: new Date(2024, 0, 6, 9, 0).toISOString(), duration: 900 }),
    ];

    const cache = buildStatsCache(history);

    expect(Object.keys(cache).sort()).toEqual(['2024-01-05', '2024-01-06']);
    expect(cache['2024-01-05']).toMatchObject({
      totalFocusTime: 2700,
      pomodoroCount: 2,
      totalBreakTime: 300,
    });
    expect(cache['2024-01-05'].sessions).toHaveLength(3);
    expect(cache['2024-01-06'].pomodoroCount).toBe(1);
  });

  it('skips records with an unparseable timestamp', () => {
    const cache = buildStatsCache([
      session({ id: 'a', timestamp: 'broken' }),
      session({ id: 'b' }),
    ]);

    expect(Object.keys(cache)).toEqual(['2024-01-05']);
    expect(cache['2024-01-05'].sessions).toHaveLength(1);
  });
});

describe('mergeSessionRecords', () => {
  it('drops duplicate ids and sorts newest first', () => {
    const existing = [
      session({ id: 'a', timestamp: new Date(2024, 0, 5).toISOString() }),
      session({ id: 'b', timestamp: new Date(2024, 0, 3).toISOString() }),
    ];
    const imported = [
      session({ id: 'a', timestamp: new Date(2024, 0, 5).toISOString() }),
      session({ id: 'c', timestamp: new Date(2024, 0, 9).toISOString() }),
    ];

    const merged = mergeSessionRecords(existing, imported);

    expect(merged.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('summarizeSessions', () => {
  it('totals focus, breaks and sessions', () => {
    const summary = summarizeSessions([
      session({ id: 'a', duration: 1500 }),
      session({ id: 'b', duration: 900 }),
      session({ id: 'c', duration: 300, sessionType: 'longBreak' }),
    ]);

    expect(summary).toEqual({
      totalFocusTime: 2400,
      totalBreakTime: 300,
      pomodoroCount: 2,
      totalSessions: 3,
    });
  });

  it('returns zeros for an empty history', () => {
    expect(summarizeSessions([])).toEqual({
      totalFocusTime: 0,
      totalBreakTime: 0,
      pomodoroCount: 0,
      totalSessions: 0,
    });
  });
});

describe('lastNDateKeys', () => {
  it('returns the requested number of days, oldest first', () => {
    const keys = lastNDateKeys(new Date(2024, 0, 10, 12, 0), 7);

    expect(keys).toHaveLength(7);
    expect(keys[0]).toBe('2024-01-04');
    expect(keys[6]).toBe('2024-01-10');
  });

  it('creates zeroed stats for empty days', () => {
    expect(createDailyStats('2024-01-01')).toEqual({
      date: '2024-01-01',
      totalFocusTime: 0,
      pomodoroCount: 0,
      totalBreakTime: 0,
      sessions: [],
    });
  });
});
