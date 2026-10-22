import type { SessionType } from '@/types/session';

export interface BridgeStatus {
  isRunning: boolean;
  sessionType: SessionType;
  timeLeft: number;
  sessionsCompleted: number;
  settings: {
    pomodoroTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    longBreakInterval: number;
  };
}

export type StatsRange = 'day' | 'week' | 'month';

/**
 * Everything the bridge can touch. Kept as an interface so the dispatcher can be
 * unit-tested without React or Tauri.
 */
export interface BridgeDeps {
  getStatus(): BridgeStatus;
  start(): void;
  pause(): void;
  reset(): void;
  switchSession(type: SessionType): void;
  getStats(range: StatsRange): unknown;
}

export interface BridgeReply {
  ok: boolean;
  data?: unknown;
  error?: string;
}

const SESSION_TYPES: readonly SessionType[] = ['pomodoro', 'shortBreak', 'longBreak'];
const RANGES: readonly StatsRange[] = ['day', 'week', 'month'];

function isSessionType(value: unknown): value is SessionType {
  return typeof value === 'string' && (SESSION_TYPES as readonly string[]).includes(value);
}

function isRange(value: unknown): value is StatsRange {
  return typeof value === 'string' && (RANGES as readonly string[]).includes(value);
}

/**
 * Execute one agent action.
 *
 * Control actions answer with `{accepted: true}` instead of a fresh snapshot:
 * React state settles on the next render, so returning the pre-action snapshot
 * would be misleading. Agents poll `GET /status` when they need the new values.
 */
export function handleBridgeAction(
  deps: BridgeDeps,
  action: string,
  payload?: unknown,
): BridgeReply {
  switch (action) {
    case 'status':
      return { ok: true, data: deps.getStatus() };

    case 'start':
      deps.start();
      return { ok: true, data: { accepted: true, action } };

    case 'pause':
      deps.pause();
      return { ok: true, data: { accepted: true, action } };

    case 'reset':
      deps.reset();
      return { ok: true, data: { accepted: true, action } };

    case 'switch': {
      const requested = (payload as { sessionType?: unknown } | undefined)?.sessionType;
      if (!isSessionType(requested)) {
        return {
          ok: false,
          error: 'sessionType must be one of pomodoro, shortBreak, longBreak',
        };
      }
      deps.switchSession(requested);
      return { ok: true, data: { accepted: true, action, sessionType: requested } };
    }

    case 'stats': {
      const requested = (payload as { range?: unknown } | undefined)?.range ?? 'day';
      if (!isRange(requested)) {
        return { ok: false, error: 'range must be one of day, week, month' };
      }
      return { ok: true, data: deps.getStats(requested) };
    }

    default:
      return { ok: false, error: `Unknown action: ${action}` };
  }
}
