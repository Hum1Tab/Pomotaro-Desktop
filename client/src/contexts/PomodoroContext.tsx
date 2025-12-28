import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react';

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
}

export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS: PomodoroSettings = {
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
};

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
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoroTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onSessionCompleteRef = useRef<
        ((type: SessionType, duration: number) => void) | null
    >(null);

    // Load settings
    useEffect(() => {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
        const savedSessions = localStorage.getItem('sessionsCompleted');
        if (savedSessions) {
            try {
                setSessionsCompleted(parseInt(savedSessions));
            } catch (error) {
                console.error('Failed to load sessions:', error);
            }
        }
    }, []);

    // Sync timeLeft when settings load (if not running)
    useEffect(() => {
        if (!isRunning) {
            // Only reset logic if we want to force time update on settings change
            // But usually we want to keep current timer if it matches.
            // Simplified: when settings change, we might not want to reset timer immediately unless type duration changed.
        }
    }, [settings]);

    // Save settings
    useEffect(() => {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }, [settings]);

    // Save sessions
    useEffect(() => {
        localStorage.setItem('sessionsCompleted', sessionsCompleted.toString());
    }, [sessionsCompleted]);

    // Timer tick
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSessionEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            // Reset taskbar progress when paused/stopped
            if (window.electronAPI) {
                window.electronAPI.setProgressBar(-1);
            }
        };
    }, [isRunning, timeLeft]);


    const getSessionDuration = useCallback((type: SessionType, currentSettings: PomodoroSettings): number => {
        switch (type) {
            case 'pomodoro':
                return currentSettings.pomodoroTime * 60;
            case 'shortBreak':
                return currentSettings.shortBreakTime * 60;
            case 'longBreak':
                return currentSettings.longBreakTime * 60;
        }
    }, []);

    const switchSession = useCallback(
        (type: SessionType) => {
            setIsRunning(false);
            setSessionType(type);
            setTimeLeft(getSessionDuration(type, settings));
        },
        [settings, getSessionDuration]
    );

    // Update taskbar progress
    useEffect(() => {
        if (isRunning && window.electronAPI) {
            const currentDuration = getSessionDuration(sessionType, settings);
            const progress = 1 - (timeLeft / currentDuration);
            window.electronAPI.setProgressBar(progress);
        }
    }, [timeLeft, isRunning, sessionType, settings, getSessionDuration]);

    const handleSessionEnd = useCallback(() => {
        setIsRunning(false);
        const sessionDuration = getSessionDuration(sessionType, settings);

        if (onSessionCompleteRef.current) {
            onSessionCompleteRef.current(sessionType, sessionDuration);
        }

        if (sessionType === 'pomodoro') {
            const newCount = sessionsCompleted + 1;
            setSessionsCompleted(newCount);
            const nextSessionType =
                newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';

            if (settings.autoStartBreaks) {
                switchSession(nextSessionType);
                setIsRunning(true);
            } else {
                switchSession(nextSessionType);
            }
        } else {
            if (settings.autoStartPomodoros) {
                switchSession('pomodoro');
                setIsRunning(true);
            } else {
                switchSession('pomodoro');
            }
        }


    }, [sessionType, sessionsCompleted, settings, getSessionDuration, switchSession]);


    const start = useCallback(() => setIsRunning(true), []);
    const pause = useCallback(() => setIsRunning(false), []);
    const reset = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(getSessionDuration(sessionType, settings));
    }, [sessionType, settings, getSessionDuration]);

    const updateSettings = useCallback((newSettings: PomodoroSettings) => {
        setSettings(newSettings);
        // If not running, assume we want to apply new time immediately?
        // Current behavior: yes.
        if (!isRunning) {
            setTimeLeft(getSessionDuration(sessionType, newSettings));
        }
    }, [sessionType, isRunning, getSessionDuration]);

    const registerSessionCompleteCallback = useCallback(
        (callback: (type: SessionType, duration: number) => void) => {
            onSessionCompleteRef.current = callback;
        },
        []
    );

    const contextValue = useMemo(() => ({
        settings,
        updateSettings,
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        start,
        pause,
        reset,
        switchSession,
        registerSessionCompleteCallback
    }), [
        settings,
        updateSettings,
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        start,
        pause,
        reset,
        switchSession,
        registerSessionCompleteCallback
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
