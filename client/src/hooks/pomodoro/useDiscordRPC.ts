import { useEffect } from 'react';
import { PomodoroSettings, SessionType } from '@/contexts/PomodoroContext';

interface UseDiscordRPCProps {
    settings: PomodoroSettings;
    sessionType: SessionType;
    timeLeft: number;
    isRunning: boolean;
    sessionsCompleted: number;
    getSessionDuration: (type: SessionType, settings: PomodoroSettings) => number;
}

export function useDiscordRPC({
    settings,
    sessionType,
    timeLeft,
    isRunning,
    sessionsCompleted,
    getSessionDuration
}: UseDiscordRPCProps) {
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
                                        ? `${currentCat.name}${settings.rpcTextCategoryWorkingSuffix || ' を学習中'}`
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
                    window.electronAPI.clearActivity();
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
}
