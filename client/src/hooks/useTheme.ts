import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('system');

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;

        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            // Default to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme whenever it changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    }, [theme]);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;

        if (newTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
        } else {
            root.classList.toggle('dark', newTheme === 'dark');
        }
    };

    const toggleTheme = () => {
        setTheme((current) => {
            if (current === 'light') return 'dark';
            if (current === 'dark') return 'system';
            return 'light';
        });
    };

    const setLightTheme = () => setTheme('light');
    const setDarkTheme = () => setTheme('dark');
    const setSystemTheme = () => setTheme('system');

    return {
        theme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setSystemTheme,
    };
}
