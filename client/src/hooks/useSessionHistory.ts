import { useState, useEffect, useCallback, useMemo } from 'react';

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

    // Optimization: Create a cache map indexed by date "YYYY-MM-DD"
    // Complexity: O(N) - iterates history once when it changes.
    const statsCache = useMemo(() => {
        const cache: Record<string, DailyStats> = {};

        history.forEach(session => {
            // Determine date string (local time)
            const dateStr = new Date(session.timestamp).toLocaleDateString('en-CA');

            if (!cache[dateStr]) {
                cache[dateStr] = {
                    date: dateStr,
                    totalFocusTime: 0,
                    pomodoroCount: 0,
                    totalBreakTime: 0,
                    sessions: []
                };
            }

            const dayStats = cache[dateStr];
            dayStats.sessions.push(session);

            if (session.sessionType === 'pomodoro') {
                dayStats.totalFocusTime += session.duration;
                dayStats.pomodoroCount += 1;
            } else {
                dayStats.totalBreakTime += session.duration;
            }
        });

        return cache;
    }, [history]);

    const getDailyStats = useCallback((dateStr?: string): DailyStats => {
        // Current local date YYYY-MM-DD if not provided
        const targetDate = dateStr || new Date().toLocaleDateString('en-CA');

        // O(1) Lookup
        return statsCache[targetDate] || {
            date: targetDate,
            totalFocusTime: 0,
            pomodoroCount: 0,
            totalBreakTime: 0,
            sessions: []
        };
    }, [statsCache]);

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
            const d = new Date(year, month, day);
            const dateStr = d.toLocaleDateString('en-CA');
            stats[dateStr] = getDailyStats(dateStr);
        }

        return stats;
    }, [getDailyStats]);

    const getYearlyStats = useCallback((year: number): StatsMap => {
        const stats: StatsMap = {};
        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            let totalFocus = 0;
            let totalPomodoro = 0;
            let totalBreak = 0;
            let allSessions: SessionRecord[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const d = new Date(year, month, day);
                const dayStr = d.toLocaleDateString('en-CA');

                // O(1) Lookup via getDailyStats -> statsCache
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
