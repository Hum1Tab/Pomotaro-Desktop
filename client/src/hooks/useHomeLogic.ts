import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useStudyCategories } from '@/hooks/useStudyCategories';
import { useSound } from '@/hooks/useSound';
import { useWhiteNoise } from '@/hooks/useWhiteNoise';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/hooks/useLanguage';
import { SessionType } from '@/contexts/PomodoroContext';

const ACTIVE_TAB_KEY = 'pomotaro-active-tab';
const SESSION_ORDER: SessionType[] = ['pomodoro', 'shortBreak', 'longBreak'];

function loadActiveTab(): string {
    try {
        return localStorage.getItem(ACTIVE_TAB_KEY) || 'timer';
    } catch {
        return 'timer';
    }
}

export function useHomeLogic() {
    const [, setLocation] = useLocation();

    const pomodoro = usePomodoro();
    const tasks = useTasks();
    const history = useSessionHistory();
    const { selectedCategoryId, getSelectedCategory } = useStudyCategories();
    const sound = useSound();
    const { isPlaying: isNoisePlaying, toggle: toggleNoise } = useWhiteNoise();
    const notifications = useNotifications();
    const { theme, setLightTheme, setDarkTheme } = useTheme();
    const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();
    const { t } = useLanguage();

    const [activeTab, setActiveTabState] = useState(loadActiveTab);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [tomatoes, setTomatoes] = useState<number[]>([]);

    // The session-complete handler needs the latest history/sound/notification
    // APIs, but re-registering it on every render kept replacing the callback.
    // Keep the newest values in a ref and register once.
    const latestRef = useRef({ history, sound, notifications, getSelectedCategory });
    useEffect(() => {
        latestRef.current = { history, sound, notifications, getSelectedCategory };
    });

    const { registerSessionCompleteCallback } = pomodoro;
    useEffect(() => {
        registerSessionCompleteCallback((type: SessionType, duration: number) => {
            const { history, sound, notifications, getSelectedCategory } = latestRef.current;
            const category = getSelectedCategory();
            history.addSession(
                duration,
                type,
                undefined,
                undefined,
                category?.id,
                category?.name
            );

            // Play sound and show notification
            if (type === 'pomodoro') {
                sound.playSessionCompleteSound();
                notifications.notifySessionComplete('学習セッション', duration);
                // Add visual reward
                setTomatoes(prev => [...prev, Date.now()]);
            } else {
                sound.playBreakCompleteSound();
                notifications.notifyBreakComplete();
            }
        });
    }, [registerSessionCompleteCallback]);

    const setActiveTab = useCallback((tab: string) => {
        setActiveTabState(tab);
        try {
            localStorage.setItem(ACTIVE_TAB_KEY, tab);
        } catch {
            // Remembering the tab is a convenience; never fail the UI over it.
        }
    }, []);

    // Handle Focus Mode Enter/Exit for Fullscreen
    useEffect(() => {
        if (window.desktopAPI && window.desktopAPI.toggleFullscreen) {
            window.desktopAPI.toggleFullscreen(isFocusMode);
        }
    }, [isFocusMode]);

    // Handle Window Size Synchronization
    const [currentCompact, setCurrentCompact] = useState(appearanceSettings.isCompact);

    useEffect(() => {
        const syncSize = async () => {
            if (window.desktopAPI?.setWindowSize && window.desktopAPI.isMaximized) {
                const maximized = await window.desktopAPI.isMaximized();

                if (appearanceSettings.isCompact) {
                    // Entering or staying in compact mode
                    window.desktopAPI.setWindowSize(300, 450);
                    window.desktopAPI.setAlwaysOnTop(true);
                } else if (currentCompact !== appearanceSettings.isCompact && !maximized) {
                    // ONLY restore default size if we just EXITED compact mode
                    window.desktopAPI.setWindowSize(1200, 800);
                    window.desktopAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
                } else {
                    // Just sync always on top without resizing
                    window.desktopAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
                }
                setCurrentCompact(appearanceSettings.isCompact);
            }
        };
        syncSize();
    }, [appearanceSettings.isCompact, pomodoro.settings.alwaysOnTop]);

    // Ensure Focus Mode and Compact Mode are mutually exclusive
    useEffect(() => {
        if (isFocusMode && appearanceSettings.isCompact) {
            updateAppearance({ isCompact: false });
        }
    }, [isFocusMode, appearanceSettings.isCompact]);

    // Listen for Native Window Events
    // (Now handled globally in AppearanceContext)

    // Trigger Tick Sound
    useEffect(() => {
        if (pomodoro.isRunning && pomodoro.timeLeft > 0 && sound.settings.playTickSound) {
            sound.playTickSound();
        }
    }, [pomodoro.timeLeft, pomodoro.isRunning, sound.settings.playTickSound, sound]);


    const handleAddTask = (title: string, estimatedPomodoros: number) => {
        tasks.addTask(title, estimatedPomodoros);
    };

    const handleStartTimer = () => {
        if (pomodoro.settings.alwaysAskCategory || !selectedCategoryId) {
            setShowCategoryDialog(true);
        } else {
            pomodoro.start();
        }
    };

    const handleCategoryConfirm = () => {
        pomodoro.start();
    };

    // Keyboard navigation between the three session types.
    const cycleSession = (direction: 1 | -1) => {
        const index = SESSION_ORDER.indexOf(pomodoro.sessionType);
        const nextIndex = (index + direction + SESSION_ORDER.length) % SESSION_ORDER.length;
        pomodoro.switchSession(SESSION_ORDER[nextIndex]);
    };

    const toggleCompactMode = async () => {
        const newCompactState = !appearanceSettings.isCompact;
        updateAppearance({ isCompact: newCompactState });

        if (newCompactState && isFocusMode) {
            setIsFocusMode(false);
        }
    };

    const goToSettings = async () => {
        sound.playClickSound();
        if (window.desktopAPI?.setWindowSize && window.desktopAPI.isMaximized) {
            const maximized = await window.desktopAPI.isMaximized();
            if (!maximized && currentCompact) {
                await window.desktopAPI.setWindowSize(1200, 800);
            }
            await window.desktopAPI.setAlwaysOnTop(false);
        }
        setLocation('/settings');
    };

    return {
        pomodoro,
        tasks,
        activeTasks: tasks.getActiveTasks(),
        sound,
        isNoisePlaying,
        toggleNoise,
        theme,
        setLightTheme,
        setDarkTheme,
        appearanceSettings,
        t,
        activeTab,
        setActiveTab,
        showCategoryDialog,
        setShowCategoryDialog,
        isFocusMode,
        setIsFocusMode,
        tomatoes,
        setTomatoes,
        handleAddTask,
        handleStartTimer,
        handleCategoryConfirm,
        nextSession: () => cycleSession(1),
        prevSession: () => cycleSession(-1),
        toggleCompactMode,
        goToSettings,
        currentCompact
    };
}

export type HomeLogic = ReturnType<typeof useHomeLogic>;
