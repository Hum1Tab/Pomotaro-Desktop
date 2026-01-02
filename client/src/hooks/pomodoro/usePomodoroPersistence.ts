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

export function usePomodoroPersistence() {
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [restoredState, setRestoredState] = useState<TimerState | null>(null);

    // Initial Load
    useEffect(() => {
        // Load Settings
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }

        // Load Sessions
        const savedSessions = localStorage.getItem('sessionsCompleted');
        if (savedSessions) {
            try {
                setSessionsCompleted(parseInt(savedSessions));
            } catch (error) {
                console.error('Failed to load sessions:', error);
            }
        }

        // Load Timer State
        const savedTimerState = localStorage.getItem('pomodoroTimerState');
        if (savedTimerState) {
            try {
                setRestoredState(JSON.parse(savedTimerState));
            } catch (e) {
                console.error('Failed to restore timer state', e);
            }
        }
    }, []);

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
