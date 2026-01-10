/**
 * 共通のセッション型定義
 * #5: SessionType型の統合
 */

// セッションの種類
export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

// セッション記録
export interface SessionRecord {
    id: string;
    duration: number; // 秒単位
    timestamp: string; // ISO string
    sessionType: SessionType;
    taskName?: string;
    categoryId?: string;
    categoryName?: string;
}

// 日別統計
export interface DailyStats {
    date: string;
    totalFocusTime: number; // 秒単位
    pomodoroCount: number;
    totalBreakTime: number;
    sessions: SessionRecord[];
}

// 統計マップ (日付 -> DailyStats)
export interface StatsMap {
    [key: string]: DailyStats;
}
