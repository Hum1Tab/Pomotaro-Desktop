import { createContext, useContext, useEffect, useRef, ReactNode, useMemo } from 'react';
import { usePomodoroPersistence } from '@/hooks/pomodoro/usePomodoroPersistence';
import { usePomodoroTimer } from '@/hooks/pomodoro/usePomodoroTimer';
import { useDiscordRPC } from '@/hooks/pomodoro/useDiscordRPC';
import { SessionType } from '@/types/session';

export type { SessionType };

export interface PomodoroSettings {
    pomodoroTime: number; // minutes
    shortBreakTime: number; // minutes
    longBreakTime: number; // minutes
    longBreakInterval: number; // number of pomodoros before long break
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    alwaysAskCategory: boolean;
    showEstimatedFinishTime: boolean;
    showTaskInput: boolean;
    alwaysOnTop: boolean;
    preventSleep: boolean;
    enableDiscordRpc: boolean;
    showCategoryOnRpc: boolean;
    showPomodorosOnRpc: boolean;
    rpcTextWorking: string;
    rpcTextBreaking: string;
    rpcTextPaused: string;
    rpcTextCategoryWorkingSuffix: string;
    rpcTextCategoryBreakingSuffix: string;
}

interface PomodoroContextType {
    settings: PomodoroSettings;
    updateSettings: (newSettings: PomodoroSettings) => void;
    sessionType: SessionType;
    timeLeft: number;
    isRunning: boolean;
    sessionsCompleted: number;
    start: () => void;
    pause: () => void;
    reset: () => void;
    switchSession: (type: SessionType) => void;
    registerSessionCompleteCallback: (callback: (type: SessionType, duration: number) => void) => void;
    expectedEndTime: number | null;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
    // 1. Persistence Hook
    const {
        settings,
        setSettings,
        sessionsCompleted,
        setSessionsCompleted,
        restoredState,
        saveTimerState
    } = usePomodoroPersistence();

    const onSessionCompleteRef = useRef<((type: SessionType, duration: number) => void) | null>(null);

    // 2. Timer Hook
    const timer = usePomodoroTimer({
        settings,
        sessionsCompleted,
        setSessionsCompleted,
        onSessionComplete: (type, duration) => {
            if (onSessionCompleteRef.current) {
                onSessionCompleteRef.current(type, duration);
            }
        }
    });

    const {
        sessionType,
        setSessionType,
        timeLeft,
        setTimeLeft,
        isRunning,
        setIsRunning,
        expectedEndTime,
        setExpectedEndTime,
        getSessionDuration
    } = timer;

    // 3. Discord RPC Hook
    useDiscordRPC({
        settings,
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        getSessionDuration
    });

    // 4. Persistence Restoration & Sync Logic
    // Restore State once loaded
    useEffect(() => {
        if (restoredState) {
            const { isRunning: savedIsRunning, sessionType: savedType, expectedEndTime: savedEnd, timeLeft: savedLeft } = restoredState;

            setSessionType(savedType);

            if (savedIsRunning && savedEnd) {
                const now = Date.now();
                if (savedEnd > now) {
                    setExpectedEndTime(savedEnd);
                    setTimeLeft(Math.floor((savedEnd - now) / 1000));
                    setIsRunning(true);
                } else {
                    // Already finished
                    setExpectedEndTime(null);
                    setTimeLeft(0);
                    setIsRunning(false);
                }
            } else {
                setIsRunning(false);
                setTimeLeft(savedLeft);
                setExpectedEndTime(null);
            }
        }
    }, [restoredState, setSessionType, setExpectedEndTime, setTimeLeft, setIsRunning]);

    // Save State Periodicallly
    useEffect(() => {
        saveTimerState({
            isRunning,
            sessionType,
            expectedEndTime,
            timeLeft
        });
    }, [isRunning, sessionType, expectedEndTime, timeLeft, saveTimerState]);

    // Handle Settings Update (Time Sync)
    const updateSettings = (newSettings: PomodoroSettings) => {
        setSettings(newSettings);
        if (!isRunning) {
            setTimeLeft(getSessionDuration(sessionType, newSettings));
        }
    };

    // Handle Electron Windows Features
    useEffect(() => {
        if (window.electronAPI) {
            if (window.electronAPI.setAlwaysOnTop) {
                window.electronAPI.setAlwaysOnTop(settings.alwaysOnTop);
            }
            if (window.electronAPI.setPowerSaveBlocker) {
                window.electronAPI.setPowerSaveBlocker(isRunning && settings.preventSleep);
            }
        }
    }, [settings.alwaysOnTop, settings.preventSleep, isRunning]);

    // Context Value
    const contextValue = useMemo(() => ({
        settings,
        updateSettings,
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        start: timer.start,
        pause: timer.pause,
        reset: timer.reset,
        switchSession: timer.switchSession,
        registerSessionCompleteCallback: (callback: (type: SessionType, duration: number) => void) => {
            onSessionCompleteRef.current = callback;
        },
        expectedEndTime
    }), [
        settings,
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        timer.start,
        timer.pause,
        timer.reset,
        timer.switchSession,
        expectedEndTime
    ]);

    return (
        <PomodoroContext.Provider value={contextValue}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoroContext() {
    const context = useContext(PomodoroContext);
    if (context === undefined) {
        throw new Error('usePomodoroContext must be used within a PomodoroProvider');
    }
    return context;
}
