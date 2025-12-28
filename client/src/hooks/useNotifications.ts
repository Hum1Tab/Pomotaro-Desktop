import { useCallback, useState, useEffect } from 'react';

export interface NotificationSettings {
    enabled: boolean;
    sessionComplete: boolean;
    breakComplete: boolean;
    requestPermissionOnLoad: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    sessionComplete: true,
    breakComplete: true,
    requestPermissionOnLoad: false,
};

export function useNotifications() {
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Failed to load notification settings:', error);
            }
        }

        // Check current permission
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }, [settings]);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, []);

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!settings.enabled) return;

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        try {
            const notification = new Notification(title, {
                icon: '/icon.png', // You can add a custom icon
                badge: '/badge.png',
                ...options,
            });

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, [settings.enabled]);

    const notifySessionComplete = useCallback((sessionType: string, duration: number) => {
        if (!settings.sessionComplete) return;

        const minutes = Math.floor(duration / 60);
        const title = sessionType === 'pomodoro'
            ? '学習セッション完了！'
            : '休憩完了！';
        const body = `${minutes}分間お疲れ様でした。${sessionType === 'pomodoro' ? '休憩を取りましょう。' : '次の学習セッションを開始しましょう。'}`;

        sendNotification(title, { body });
    }, [settings.sessionComplete, sendNotification]);

    const notifyBreakComplete = useCallback(() => {
        if (!settings.breakComplete) return;

        sendNotification('休憩完了！', {
            body: '次の学習セッションを開始しましょう。',
        });
    }, [settings.breakComplete, sendNotification]);

    const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    }, []);

    return {
        settings,
        permission,
        updateSettings,
        requestPermission,
        sendNotification,
        notifySessionComplete,
        notifyBreakComplete,
    };
}
