import { useState, useEffect } from 'react';
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

    const [activeTab, setActiveTab] = useState('timer');
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [tomatoes, setTomatoes] = useState<number[]>([]);

    // Register session complete callback
    useEffect(() => {
        pomodoro.registerSessionCompleteCallback((type: SessionType, duration: number) => {
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
    }, [pomodoro, history, sound, notifications]);

    // Handle Focus Mode Enter/Exit for Fullscreen
    useEffect(() => {
        if (window.electronAPI && window.electronAPI.toggleFullscreen) {
            window.electronAPI.toggleFullscreen(isFocusMode);
        }
    }, [isFocusMode]);

    // Handle Window Size Synchronization
    const [currentCompact, setCurrentCompact] = useState(appearanceSettings.isCompact);

    useEffect(() => {
        const syncSize = async () => {
            if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
                const maximized = await window.electronAPI.isMaximized();

                if (appearanceSettings.isCompact) {
                    // Entering or staying in compact mode
                    window.electronAPI.setWindowSize(300, 450);
                    window.electronAPI.setAlwaysOnTop(true);
                } else if (currentCompact !== appearanceSettings.isCompact && !maximized) {
                    // ONLY restore default size if we just EXITED compact mode
                    window.electronAPI.setWindowSize(1200, 800);
                    window.electronAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
                } else {
                    // Just sync always on top without resizing
                    window.electronAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
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
    useEffect(() => {
        if (window.electronAPI?.onWindowStateChanged) {
            window.electronAPI.onWindowStateChanged((state: string) => {
                if (state === 'maximized') {
                    updateAppearance({ isCompact: false });
                }
            });
        }
    }, []);

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

    const toggleCompactMode = async () => {
        const newCompactState = !appearanceSettings.isCompact;
        updateAppearance({ isCompact: newCompactState });

        if (newCompactState && isFocusMode) {
            setIsFocusMode(false);
        }
    };

    const goToSettings = async () => {
        sound.playClickSound();
        if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
            const maximized = await window.electronAPI.isMaximized();
            if (!maximized && currentCompact) {
                await window.electronAPI.setWindowSize(1200, 800);
            }
            await window.electronAPI.setAlwaysOnTop(false);
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
        toggleCompactMode,
        goToSettings,
        currentCompact
    };
}
