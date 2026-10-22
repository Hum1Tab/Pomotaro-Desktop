import { useEffect, useRef } from 'react';
import type { DiscordActivity } from '@shared/desktop-api';
import { PomodoroSettings, SessionType } from '@/contexts/PomodoroContext';

interface UseDiscordRPCProps {
    settings: PomodoroSettings;
    sessionType: SessionType;
    timeLeft: number;
    isRunning: boolean;
    sessionsCompleted: number;
    getSessionDuration: (type: SessionType, settings: PomodoroSettings) => number;
}

/** Discord renders the countdown from endTimestamp, so the presence only needs
 *  a periodic refresh to correct drift instead of one IPC call per second. */
const PRESENCE_REFRESH_MS = 30_000;

function resolveStateText(
    settings: PomodoroSettings,
    sessionType: SessionType,
): string {
    if (!settings.showCategoryOnRpc) {
        return sessionType === 'pomodoro'
            ? (settings.rpcTextWorking || 'Pomotaro で作業中')
            : (settings.rpcTextBreaking || '休憩中');
    }

    try {
        const savedSelectedId = localStorage.getItem('selectedCategoryId');
        const savedCategories = localStorage.getItem('studyCategories');
        if (!savedSelectedId || !savedCategories) throw new Error('no category');

        const categories = JSON.parse(savedCategories) as Array<{ id: string; name: string }>;
        const currentCat = categories.find((category) => category.id === savedSelectedId);
        if (!currentCat) throw new Error('category not found');

        return sessionType === 'pomodoro'
            ? `${currentCat.name}${settings.rpcTextCategoryWorkingSuffix || ' を学習中'}`
            : `${currentCat.name}${settings.rpcTextCategoryBreakingSuffix || ' の合間に休憩中'}`;
    } catch {
        return sessionType === 'pomodoro'
            ? (settings.rpcTextWorking || 'Pomotaro で作業中')
            : (settings.rpcTextBreaking || '休憩中');
    }
}

export function useDiscordRPC({
    settings,
    sessionType,
    timeLeft,
    isRunning,
    sessionsCompleted,
    getSessionDuration
}: UseDiscordRPCProps) {
    const lastSignatureRef = useRef<string | null>(null);
    const lastSentAtRef = useRef(0);

    useEffect(() => {
        const api = window.desktopAPI;
        if (!api) return;

        // The taskbar progress is cheap to update and benefits from per-second
        // granularity, so it is intentionally outside the throttled block.
        if (isRunning) {
            const duration = getSessionDuration(sessionType, settings);
            const progress = duration > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / duration)) : 0;
            void api.setProgressBar(progress).catch(() => undefined);
        } else {
            void api.setProgressBar(-1).catch(() => undefined);
        }

        if (!settings.enableDiscordRpc) {
            if (lastSignatureRef.current !== 'disabled') {
                lastSignatureRef.current = 'disabled';
                void api.clearActivity().catch(() => undefined);
            }
            return;
        }

        const visibleState = resolveStateText(settings, sessionType);
        const signature = [
            sessionType,
            isRunning ? 'running' : 'paused',
            visibleState,
            settings.showPomodorosOnRpc ? sessionsCompleted : 0,
        ].join('|');

        const now = Date.now();
        if (signature === lastSignatureRef.current && now - lastSentAtRef.current < PRESENCE_REFRESH_MS) {
            return;
        }

        const activity: DiscordActivity = {
            details: sessionType === 'pomodoro' ? '集中中' : '休憩中',
            state: visibleState,
            sessionType,
            sessionsCompleted: settings.showPomodorosOnRpc ? sessionsCompleted : 0,
        };

        if (isRunning) {
            activity.endTimestamp = now + timeLeft * 1000;
        }

        lastSignatureRef.current = signature;
        lastSentAtRef.current = now;
        void api.updateActivity(activity).catch(() => undefined);
    }, [timeLeft, isRunning, sessionType, settings, getSessionDuration, sessionsCompleted]);
}
