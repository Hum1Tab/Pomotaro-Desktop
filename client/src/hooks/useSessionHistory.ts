import { useState, useEffect, useCallback, useMemo } from 'react';
import { SessionType, SessionRecord, DailyStats, StatsMap } from '@/types/session';

export type { SessionType, SessionRecord, DailyStats, StatsMap };

// 記録ツール設定: 履歴データは無期限保持
// 注意: localStorageの容量制限（約5-10MB）に注意
const STORAGE_KEY = 'pomotaro-sessions';

export function useSessionHistory() {
    const [history, setHistory] = useState<SessionRecord[]>([]);

    // Load history from localStorage on mount (無期限保持)
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as SessionRecord[];
                setHistory(parsed);
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
            const jsonData = JSON.stringify(updated);
            localStorage.setItem(STORAGE_KEY, jsonData);

            // 記録ツール: セッション終了ごとにファイルへ自動バックアップ
            if (window.electronAPI?.saveSessionBackup) {
                window.electronAPI.saveSessionBackup(jsonData).catch(err => {
                    console.error('Failed to save session backup:', err);
                });
            }

            return updated;
        });
    }, []);

    // #15: セッション履歴をJSONでエクスポート（記録ツール機能）
    const exportSessions = useCallback((): string => {
        return JSON.stringify(history, null, 2);
    }, [history]);

    // 記録ツール: セッション履歴をインポート（マージ）
    const importSessions = useCallback((jsonData: string): boolean => {
        try {
            const imported = JSON.parse(jsonData) as SessionRecord[];
            if (!Array.isArray(imported)) return false;

            setHistory(prev => {
                // 既存のIDを持つセッションは除外してマージ
                const existingIds = new Set(prev.map(s => s.id));
                const newSessions = imported.filter(s => !existingIds.has(s.id));
                const merged = [...newSessions, ...prev];
                // 日付順にソート（新しい順）
                merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                return merged;
            });
            return true;
        } catch (e) {
            console.error('Failed to import sessions', e);
            return false;
        }
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
        getTotalStats,
        // #15: 記録ツール用のエクスポート/インポート機能
        exportSessions,
        importSessions,
    };
}
