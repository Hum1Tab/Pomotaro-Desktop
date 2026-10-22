import { describe, expect, it, vi } from 'vitest';

import { handleBridgeAction, type BridgeDeps, type BridgeStatus } from '@/lib/bridge-actions';

const status: BridgeStatus = {
  isRunning: false,
  sessionType: 'pomodoro',
  timeLeft: 1500,
  sessionsCompleted: 2,
  settings: {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
  },
};

function createDeps(overrides: Partial<BridgeDeps> = {}): BridgeDeps {
  return {
    getStatus: vi.fn(() => status),
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    switchSession: vi.fn(),
    getStats: vi.fn(() => ({ today: { pomodoroCount: 3 } })),
    ...overrides,
  };
}

describe('handleBridgeAction', () => {
  it('returns the current status', () => {
    const deps = createDeps();
    const reply = handleBridgeAction(deps, 'status');

    expect(reply).toEqual({ ok: true, data: status });
    expect(deps.getStatus).toHaveBeenCalledOnce();
  });

  it('forwards control actions', () => {
    const deps = createDeps();

    expect(handleBridgeAction(deps, 'start')).toEqual({
      ok: true,
      data: { accepted: true, action: 'start' },
    });
    handleBridgeAction(deps, 'pause');
    handleBridgeAction(deps, 'reset');

    expect(deps.start).toHaveBeenCalledOnce();
    expect(deps.pause).toHaveBeenCalledOnce();
    expect(deps.reset).toHaveBeenCalledOnce();
  });

  it('switches session type and rejects invalid values', () => {
    const deps = createDeps();

    expect(handleBridgeAction(deps, 'switch', { sessionType: 'longBreak' })).toEqual({
      ok: true,
      data: { accepted: true, action: 'switch', sessionType: 'longBreak' },
    });
    expect(deps.switchSession).toHaveBeenCalledWith('longBreak');

    expect(handleBridgeAction(deps, 'switch', { sessionType: 'nap' })).toEqual({
      ok: false,
      error: 'sessionType must be one of pomodoro, shortBreak, longBreak',
    });
    expect(handleBridgeAction(deps, 'switch')).toMatchObject({ ok: false });
  });

  it('defaults stats to today and validates the range', () => {
    const deps = createDeps();

    expect(handleBridgeAction(deps, 'stats')).toEqual({
      ok: true,
      data: { today: { pomodoroCount: 3 } },
    });
    expect(deps.getStats).toHaveBeenCalledWith('day');

    handleBridgeAction(deps, 'stats', { range: 'week' });
    expect(deps.getStats).toHaveBeenLastCalledWith('week');

    expect(handleBridgeAction(deps, 'stats', { range: 'year' })).toMatchObject({ ok: false });
  });

  it('rejects unknown actions', () => {
    expect(handleBridgeAction(createDeps(), 'delete-everything')).toEqual({
      ok: false,
      error: 'Unknown action: delete-everything',
    });
  });
});
