import { useState, useEffect, useCallback } from 'react';

export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface SessionRecord {
    id: string;
    duration: number; // in seconds
    timestamp: string; // ISO string
    sessionType: SessionType;
    taskName?: string;
    categoryId?: string;
    categoryName?: string;
}

export interface DailyStats {
    date: string;
    totalFocusTime: number; // in seconds
    pomodoroCount: number;
    totalBreakTime: number;
    sessions: SessionRecord[];
}

export interface StatsMap {
    [key: string]: DailyStats;
}

export function useSessionHistory() {
    const [history, setHistory] = useState<SessionRecord[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pomotaro-sessions');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse session history', e);
            }
        }
    }, []);

    const addSession = useCallback((
        duration: number,
        sessionType: SessionType,
        date?: string,
        taskName?: string,
        categoryId?: string,
        categoryName?: string
    ) => {
        const newSession: SessionRecord = {
            id: crypto.randomUUID(),
            duration,
            timestamp: date || new Date().toISOString(),
            sessionType,
            taskName,
            categoryId,
            categoryName
        };

        setHistory(prev => {
            const updated = [newSession, ...prev];
            localStorage.setItem('pomotaro-sessions', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const getDailyStats = useCallback((dateStr?: string): DailyStats => {
        // Current local date YYYY-MM-DD if not provided
        const targetDate = dateStr || new Date().toLocaleDateString('en-CA');

        // Filter sessions for this day
        const daySessions = history.filter(session => {
            const sessionDate = new Date(session.timestamp).toLocaleDateString('en-CA');
            return sessionDate === targetDate;
        });

        const totalFocusTime = daySessions
            .filter(s => s.sessionType === 'pomodoro')
            .reduce((sum, s) => sum + s.duration, 0);

        const totalBreakTime = daySessions
            .filter(s => s.sessionType === 'shortBreak' || s.sessionType === 'longBreak')
            .reduce((sum, s) => sum + s.duration, 0);

        const pomodoroCount = daySessions.filter(s => s.sessionType === 'pomodoro').length;

        return {
            date: targetDate,
            totalFocusTime,
            pomodoroCount,
            totalBreakTime,
            sessions: daySessions
        };
    }, [history]);

    const getWeeklyStats = useCallback((): StatsMap => {
        const today = new Date();
        const stats: StatsMap = {};

        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA');
            stats[dateStr] = getDailyStats(dateStr);
        }
        return stats;
    }, [getDailyStats]);

    const getMonthlyStats = useCallback((year: number, month: number): StatsMap => {
        const stats: StatsMap = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            // Note: Javascript months are 0-indexed, but date strings usually expect human months.
            // However, toLocaleDateString('en-CA') handles Date objects correctly.
            // We create date object for specific year/month/day
            const d = new Date(year, month, day);
            const dateStr = d.toLocaleDateString('en-CA');
            stats[dateStr] = getDailyStats(dateStr);
        }

        return stats;
    }, [getDailyStats]);

    const getYearlyStats = useCallback((year: number): StatsMap => {
        const stats: StatsMap = {};
        for (let month = 0; month < 12; month++) {
            // Aggregate for each month
            // Key logic: 0..11
            // We might want to return { '0': stats, '1': stats... } or mapped by something else
            // StatsDashboard expects Object.entries(yearlyStats) -> [monthIndex, stats]

            // Let's manually aggregate for the month
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let totalFocus = 0;
            let totalPomodoro = 0;
            let totalBreak = 0;
            let allSessions: SessionRecord[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const d = new Date(year, month, day);
                const dayStr = d.toLocaleDateString('en-CA');
                // We can allow getDailyStats to handle filtering, but it might be slow for year loop.
                // Optimization: Filter history once by year/month might be faster, but reuse is safer.
                const dStats = getDailyStats(dayStr);
                totalFocus += dStats.totalFocusTime;
                totalPomodoro += dStats.pomodoroCount;
                totalBreak += dStats.totalBreakTime;
                allSessions = [...allSessions, ...dStats.sessions];
            }

            stats[month.toString()] = {
                date: `${year}-${month + 1}`,
                totalFocusTime: totalFocus,
                pomodoroCount: totalPomodoro,
                totalBreakTime: totalBreak,
                sessions: allSessions
            };
        }
        return stats;
    }, [getDailyStats]);

    const getTotalStats = useCallback(() => {
        const focusSessions = history.filter(s => s.sessionType === 'pomodoro');
        const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.duration, 0);
        const breakSessions = history.filter(s => s.sessionType === 'shortBreak' || s.sessionType === 'longBreak');
        const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.duration, 0);

        const pomodoroCount = focusSessions.length;

        return {
            totalFocusTime,
            totalBreakTime,
            pomodoroCount,
            totalSessions: history.length
        };
    }, [history]);

    return {
        history,
        sessions: history, // Expose sessions directly as StatsDashboard likely uses it
        addSession,
        getDailyStats,
        getWeeklyStats,
        getMonthlyStats,
        getYearlyStats,
        getTotalStats
    };
}
