import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  normalizeTimerState,
} from '@/hooks/pomodoro/usePomodoroPersistence';

describe('normalizeSettings', () => {
  it('falls back to defaults for non-object input', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('nonsense')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values', () => {
    const settings = normalizeSettings({ pomodoroTime: 50, shortBreakTime: 10, longBreakInterval: 2 });

    expect(settings.pomodoroTime).toBe(50);
    expect(settings.shortBreakTime).toBe(10);
    expect(settings.longBreakInterval).toBe(2);
    expect(settings.longBreakTime).toBe(DEFAULT_SETTINGS.longBreakTime);
  });

  it('rejects out-of-range and non-integer durations', () => {
    const settings = normalizeSettings({
      pomodoroTime: 0,
      shortBreakTime: 100_000,
      longBreakTime: 12.5,
      longBreakInterval: '4',
    });

    expect(settings.pomodoroTime).toBe(DEFAULT_SETTINGS.pomodoroTime);
    expect(settings.shortBreakTime).toBe(DEFAULT_SETTINGS.shortBreakTime);
    expect(settings.longBreakTime).toBe(DEFAULT_SETTINGS.longBreakTime);
    expect(settings.longBreakInterval).toBe(DEFAULT_SETTINGS.longBreakInterval);
  });
});

describe('normalizeTimerState', () => {
  it('accepts a valid snapshot', () => {
    expect(
      normalizeTimerState({
        isRunning: true,
        sessionType: 'pomodoro',
        expectedEndTime: 1_700_000_000_000,
        timeLeft: 1200,
      }),
    ).toEqual({
      isRunning: true,
      sessionType: 'pomodoro',
      expectedEndTime: 1_700_000_000_000,
      timeLeft: 1200,
    });
  });

  it('treats a missing expectedEndTime as null', () => {
    expect(
      normalizeTimerState({ isRunning: false, sessionType: 'shortBreak', timeLeft: 300 }),
    ).toEqual({
      isRunning: false,
      sessionType: 'shortBreak',
      expectedEndTime: null,
      timeLeft: 300,
    });
  });

  it('rejects malformed snapshots', () => {
    expect(normalizeTimerState(null)).toBeNull();
    expect(normalizeTimerState({ sessionType: 'pomodoro', isRunning: true, timeLeft: -1 })).toBeNull();
    expect(normalizeTimerState({ sessionType: 'pomodoro', isRunning: true, timeLeft: 1.5 })).toBeNull();
    expect(normalizeTimerState({ sessionType: 'unknown', isRunning: true, timeLeft: 10 })).toBeNull();
    expect(normalizeTimerState({ sessionType: 'pomodoro', timeLeft: 10 })).toBeNull();
    expect(
      normalizeTimerState({ sessionType: 'pomodoro', isRunning: true, timeLeft: 10, expectedEndTime: Number.NaN }),
    ).toBeNull();
  });
});
