import { useState, useEffect, useCallback } from 'react';
import { PomodoroSettings, SessionType } from '@/contexts/PomodoroContext';

export const DEFAULT_SETTINGS: PomodoroSettings = {
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    alwaysAskCategory: false,
    showEstimatedFinishTime: false,
    showTaskInput: true,
    alwaysOnTop: false,
    preventSleep: true,
    enableDiscordRpc: true,
    showCategoryOnRpc: true,
    showPomodorosOnRpc: true,
    rpcTextWorking: 'Pomotaro で作業中',
    rpcTextBreaking: '休憩中',
    rpcTextPaused: '一時停止中',
    rpcTextCategoryWorkingSuffix: ' を学習中',
    rpcTextCategoryBreakingSuffix: ' の合間に休憩中',
};

export interface TimerState {
    isRunning: boolean;
    sessionType: SessionType;
    expectedEndTime: number | null;
    timeLeft: number;
}

// 同期的にlocalStorageから初期値を読み込むヘルパー関数
function loadInitialSettings(): PomodoroSettings {
    try {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            return normalizeSettings(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Failed to load initial settings:', error);
    }
    return DEFAULT_SETTINGS;
}

function loadInitialSessions(): number {
    try {
        const saved = localStorage.getItem('sessionsCompleted');
        if (saved) {
            const count = Number.parseInt(saved, 10);
            return Number.isSafeInteger(count) && count >= 0 ? count : 0;
        }
    } catch (error) {
        console.error('Failed to load initial sessions:', error);
    }
    return 0;
}

function loadInitialTimerState(): TimerState | null {
    try {
        const saved = localStorage.getItem('pomodoroTimerState');
        if (saved) {
            return normalizeTimerState(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Failed to load initial timer state:', error);
    }
    return null;
}

export function normalizeSettings(value: unknown): PomodoroSettings {
    const saved = value && typeof value === 'object' ? value as Partial<PomodoroSettings> : {};
    return {
        ...DEFAULT_SETTINGS,
        ...saved,
        pomodoroTime: validInteger(saved.pomodoroTime, DEFAULT_SETTINGS.pomodoroTime, 1, 720),
        shortBreakTime: validInteger(saved.shortBreakTime, DEFAULT_SETTINGS.shortBreakTime, 1, 720),
        longBreakTime: validInteger(saved.longBreakTime, DEFAULT_SETTINGS.longBreakTime, 1, 720),
        longBreakInterval: validInteger(saved.longBreakInterval, DEFAULT_SETTINGS.longBreakInterval, 1, 100),
    };
}

export function normalizeTimerState(value: unknown): TimerState | null {
    if (!value || typeof value !== 'object') return null;
    const state = value as Partial<TimerState>;
    const sessionType = state.sessionType;
    if (!isSessionType(sessionType)) return null;
    const timeLeft = state.timeLeft;
    const expectedEndTime = state.expectedEndTime;
    if (typeof timeLeft !== 'number' || !Number.isInteger(timeLeft) || timeLeft < 0 || timeLeft > 43_200) return null;
    if (typeof state.isRunning !== 'boolean') return null;
    if (expectedEndTime !== null && expectedEndTime !== undefined && (!Number.isFinite(expectedEndTime) || expectedEndTime <= 0)) return null;
    return { isRunning: state.isRunning, sessionType, timeLeft, expectedEndTime: expectedEndTime ?? null };
}

function isSessionType(value: unknown): value is SessionType {
    return value === 'pomodoro' || value === 'shortBreak' || value === 'longBreak';
}

function validInteger(value: unknown, fallback: number, minimum: number, maximum: number): number {
    return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}

export function usePomodoroPersistence() {
    // 同期的な初期化でlocalStorageから値を読み込む
    const [settings, setSettings] = useState<PomodoroSettings>(loadInitialSettings);
    const [sessionsCompleted, setSessionsCompleted] = useState(loadInitialSessions);
    const [restoredState] = useState<TimerState | null>(loadInitialTimerState);

    // Save Settings
    useEffect(() => {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }, [settings]);

    // Save Sessions
    useEffect(() => {
        localStorage.setItem('sessionsCompleted', sessionsCompleted.toString());
    }, [sessionsCompleted]);

    // Save Timer State
    // useCallback keeps the identity stable so the persistence effect does not
    // re-run on every provider render.
    const saveTimerState = useCallback((state: TimerState) => {
        try {
            localStorage.setItem('pomodoroTimerState', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to persist timer state:', error);
        }
    }, []);

    return {
        settings,
        setSettings,
        sessionsCompleted,
        setSessionsCompleted,
        restoredState,
        saveTimerState,
        DEFAULT_SETTINGS
    };
}
