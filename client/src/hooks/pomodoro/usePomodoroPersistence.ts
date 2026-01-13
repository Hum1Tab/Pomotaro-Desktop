import { useState, useEffect } from 'react';
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

interface TimerState {
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
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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
            return parseInt(saved, 10);
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
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load initial timer state:', error);
    }
    return null;
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
    const saveTimerState = (state: TimerState) => {
        localStorage.setItem('pomodoroTimerState', JSON.stringify(state));
    };

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
