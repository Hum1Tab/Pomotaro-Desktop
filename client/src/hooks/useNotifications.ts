import { useCallback, useState, useEffect } from 'react';
import { desktopAPI, isDesktop } from '@/lib/desktop-api';
import { useLanguage } from '@/hooks/useLanguage';

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
    const { t } = useLanguage();
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const [permission, setPermission] = useState<NotificationPermission>(
        isDesktop ? 'granted' : 'default'
    );

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

        // Desktop notifications are always allowed by the native app.
        if (isDesktop) {
            setPermission('granted');
        } else if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }, [settings]);

    const requestPermission = useCallback(async () => {
        if (isDesktop) {
            setPermission('granted');
            return true;
        }

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

        if (isDesktop) {
            void desktopAPI.sendNotification(title, options?.body ?? '').catch((error) => {
                console.error('Failed to send notification:', error);
            });
            return;
        }

        if (!('Notification' in window) || Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        try {
            const notification = new Notification(title, {
                icon: '/icon.png',
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
        // `duration` describes the session that just ended; only a focus session
        // needs the "you focused for N minutes" wording.
        const title = sessionType === 'pomodoro'
            ? t('notification.sessionComplete')
            : t('notification.breakComplete');
        const body = sessionType === 'pomodoro'
            ? t('notification.sessionBody').replace('{minutes}', String(minutes))
            : t('notification.breakBody');

        sendNotification(title, { body });
    }, [settings.sessionComplete, sendNotification, t]);

    const notifyBreakComplete = useCallback(() => {
        if (!settings.breakComplete) return;

        sendNotification(t('notification.breakComplete'), {
            body: t('notification.breakBody'),
        });
    }, [settings.breakComplete, sendNotification, t]);

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
