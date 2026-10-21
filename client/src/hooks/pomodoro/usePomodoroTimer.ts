import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroSettings, SessionType } from '@/contexts/PomodoroContext';

interface UsePomodoroTimerProps {
    settings: PomodoroSettings;
    sessionsCompleted: number;
    setSessionsCompleted: (count: number) => void;
    onSessionComplete?: (type: SessionType, duration: number) => void;
}

export function usePomodoroTimer({
    settings,
    sessionsCompleted,
    setSessionsCompleted,
    onSessionComplete
}: UsePomodoroTimerProps) {
    const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
    const [timeLeft, setTimeLeft] = useState(settings.pomodoroTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [expectedEndTime, setExpectedEndTime] = useState<number | null>(null);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const handleSessionEnd = useCallback(() => {
        setIsRunning(false);
        setExpectedEndTime(null);
        const sessionDuration = getSessionDuration(sessionType, settings);

        if (onSessionComplete) {
            onSessionComplete(sessionType, sessionDuration);
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
    }, [sessionType, sessionsCompleted, settings, getSessionDuration, onSessionComplete, setSessionsCompleted]);

    // Recalculate from the target timestamp rather than decrementing state. This
    // stays correct after sleep and schedules only at the next visible-second boundary.
    useEffect(() => {
        if (!isRunning || !expectedEndTime) return;

        const tick = () => {
            const remainingMs = expectedEndTime - Date.now();
            const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                handleSessionEnd();
                return;
            }

            const untilNextSecond = remainingMs % 1000 || 1000;
            timeoutRef.current = setTimeout(tick, Math.max(20, untilNextSecond));
        };

        tick();
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isRunning, expectedEndTime, handleSessionEnd]);

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

    const switchSession = useCallback(
        (type: SessionType) => {
            setIsRunning(false);
            setSessionType(type);
            setTimeLeft(getSessionDuration(type, settings));
        },
        [settings, getSessionDuration]
    );

    const syncTimeWithSettings = useCallback(() => {
        if (!isRunning) {
            setTimeLeft(getSessionDuration(sessionType, settings));
        }
    }, [settings, isRunning, sessionType, getSessionDuration]);


    // Return State setters for persistence restoration
    return {
        sessionType,
        setSessionType,
        timeLeft,
        setTimeLeft,
        isRunning,
        setIsRunning,
        expectedEndTime,
        setExpectedEndTime,
        start,
        pause,
        reset,
        switchSession,
        syncTimeWithSettings,
        getSessionDuration
    };
}
