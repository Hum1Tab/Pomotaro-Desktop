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
    enableDiscordRpc: boolean;
    showCategoryOnRpc: boolean;
    showPomodorosOnRpc: boolean;
    rpcTextWorking: string;
    rpcTextBreaking: string;
    rpcTextPaused: string;
    rpcTextCategoryWorkingSuffix: string;
    rpcTextCategoryBreakingSuffix: string;
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
    enableDiscordRpc: true,
    showCategoryOnRpc: true,
    showPomodorosOnRpc: true,
    rpcTextWorking: 'Pomotaro で作業中',
    rpcTextBreaking: '休憩中',
    rpcTextPaused: '一時停止中',
    rpcTextCategoryWorkingSuffix: ' を共同学習中',
    rpcTextCategoryBreakingSuffix: ' の合間に休憩中',
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
    expectedEndTime: number | null;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.pomodoroTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [expectedEndTime, setExpectedEndTime] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onSessionCompleteRef = useRef<
        ((type: SessionType, duration: number) => void) | null
    >(null);

    // Load settings
    useEffect(() => {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        let currentSettings = DEFAULT_SETTINGS;
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
                setSettings(currentSettings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }

        // Initialize timeLeft based on loaded settings
        setTimeLeft(currentSettings.pomodoroTime * 60);

        const savedSessions = localStorage.getItem('sessionsCompleted');
        if (savedSessions) {
            try {
                setSessionsCompleted(parseInt(savedSessions));
            } catch (error) {
                console.error('Failed to load sessions:', error);
            }
        }

        // Restore Timer State
        const savedTimerState = localStorage.getItem('pomodoroTimerState');
        if (savedTimerState) {
            try {
                const { isRunning: savedIsRunning, sessionType: savedType, expectedEndTime: savedEnd, timeLeft: savedLeft } = JSON.parse(savedTimerState);

                setSessionType(savedType);

                if (savedIsRunning && savedEnd) {
                    const now = Date.now();
                    if (savedEnd > now) {
                        setExpectedEndTime(savedEnd);
                        setTimeLeft(Math.floor((savedEnd - now) / 1000));
                        setIsRunning(true);
                    } else {
                        // Was running but already finished
                        setExpectedEndTime(null);
                        setTimeLeft(0);
                        setIsRunning(false);
                        // handleSessionEnd will be called by useEffect if we set isRunning true briefly,
                        // or we can call it manually. Let's set it to 0 and let the loop handle it.
                    }
                } else {
                    setIsRunning(false);
                    setTimeLeft(savedLeft);
                    setExpectedEndTime(null);
                }
            } catch (e) {
                console.error('Failed to restore timer state', e);
            }
        }
    }, []);

    // Save timer state periodically or on change
    useEffect(() => {
        const state = {
            isRunning,
            sessionType,
            expectedEndTime,
            timeLeft
        };
        localStorage.setItem('pomodoroTimerState', JSON.stringify(state));
    }, [isRunning, sessionType, expectedEndTime, timeLeft]);

    // Save settings
    useEffect(() => {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }, [settings]);

    // Save sessions
    useEffect(() => {
        localStorage.setItem('sessionsCompleted', sessionsCompleted.toString());
    }, [sessionsCompleted]);

    // Timer tick - Enhanced Accuracy
    useEffect(() => {
        if (isRunning && expectedEndTime) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((expectedEndTime - now) / 1000));

                setTimeLeft(remaining);

                if (remaining <= 0) {
                    handleSessionEnd();
                }
            }, 500); // Check more frequently for higher accuracy
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
            if (window.electronAPI) {
                window.electronAPI.setProgressBar(-1);
            }
        };
    }, [isRunning, expectedEndTime]);


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

    // Update taskbar progress and Discord RPC
    useEffect(() => {
        if (window.electronAPI) {
            const currentDuration = getSessionDuration(sessionType, settings);

            if (isRunning) {
                const progress = 1 - (timeLeft / currentDuration);
                window.electronAPI.setProgressBar(progress);

                // Update Discord RPC if enabled
                if (settings.enableDiscordRpc) {
                    const endTimestamp = Date.now() + timeLeft * 1000;

                    // Get base text from settings
                    let baseState = sessionType === 'pomodoro'
                        ? (settings.rpcTextWorking || 'Pomotaro で作業中')
                        : (settings.rpcTextBreaking || '休憩中');

                    // Get current category name if enabled
                    if (settings.showCategoryOnRpc) {
                        const savedSelectedId = localStorage.getItem('selectedCategoryId');
                        const savedCategories = localStorage.getItem('studyCategories');
                        if (savedSelectedId && savedCategories) {
                            try {
                                const categories = JSON.parse(savedCategories);
                                const currentCat = categories.find((c: any) => c.id === savedSelectedId);
                                if (currentCat) {
                                    baseState = sessionType === 'pomodoro'
                                        ? `${currentCat.name}${settings.rpcTextCategoryWorkingSuffix || ' を共同学習中'}`
                                        : `${currentCat.name}${settings.rpcTextCategoryBreakingSuffix || ' の合間に休憩中'}`;
                                }
                            } catch (e) {
                                console.error('Failed to parse categories for RPC', e);
                            }
                        }
                    }

                    window.electronAPI.updateActivity({
                        details: sessionType === 'pomodoro' ? '集中中' : '休憩中',
                        state: baseState,
                        endTimestamp,
                        sessionType,
                        sessionsCompleted: settings.showPomodorosOnRpc ? sessionsCompleted : 0
                    });
                } else {
                    // If RPC is disabled but was previously enabled, we might want to clear it.
                    // However, we don't have a direct "clear" yet, so we send a minimal activity or do nothing.
                }
            } else {
                window.electronAPI.setProgressBar(-1);
                if (settings.enableDiscordRpc) {
                    window.electronAPI.updateActivity({
                        details: '一時停止中',
                        state: settings.rpcTextPaused || '一時停止中',
                        sessionType,
                        sessionsCompleted: settings.showPomodorosOnRpc ? sessionsCompleted : 0
                    });
                }
            }
        }
    }, [timeLeft, isRunning, sessionType, settings, getSessionDuration, sessionsCompleted]);

    const handleSessionEnd = useCallback(() => {
        setIsRunning(false);
        setExpectedEndTime(null); // Clear expected end time
        const sessionDuration = getSessionDuration(sessionType, settings);

        if (onSessionCompleteRef.current) {
            onSessionCompleteRef.current(sessionType, sessionDuration);
        }

        let nextSessionType: SessionType;
        let autoStart = false;

        if (sessionType === 'pomodoro') {
            const newCount = sessionsCompleted + 1;
            setSessionsCompleted(newCount);
            nextSessionType = newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
            autoStart = settings.autoStartBreaks;
        } else {
            nextSessionType = 'pomodoro';
            autoStart = settings.autoStartPomodoros;
        }

        setSessionType(nextSessionType);
        const nextDuration = getSessionDuration(nextSessionType, settings);
        setTimeLeft(nextDuration);

        if (autoStart) {
            setExpectedEndTime(Date.now() + nextDuration * 1000);
            setIsRunning(true);
        }
    }, [sessionType, sessionsCompleted, settings, getSessionDuration]);


    const start = useCallback(() => {
        if (!isRunning) {
            setExpectedEndTime(Date.now() + timeLeft * 1000);
            setIsRunning(true);
        }
    }, [isRunning, timeLeft]);

    const pause = useCallback(() => {
        setIsRunning(false);
        setExpectedEndTime(null);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setExpectedEndTime(null);
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
        registerSessionCompleteCallback,
        expectedEndTime
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
        registerSessionCompleteCallback,
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
