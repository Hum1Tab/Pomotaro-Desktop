import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BackgroundType = 'gradient' | 'image' | 'video';

// Preset Themes
export type PresetTheme = 'default' | 'sakura' | 'matcha' | 'ajisai' | 'kuri' | 'custom';

export const THEME_PRESETS: Record<PresetTheme, { name: string; colors: [string, string] }> = {
    default: { name: '蜜柑 (Mikan)', colors: ['#FFD200', '#F7971E'] },
    sakura: { name: '桜 (Sakura)', colors: ['#ff9a9e', '#fecfef'] },
    matcha: { name: '抹茶 (Matcha)', colors: ['#84fab0', '#8fd3f4'] }, // Adjusted for fresh look
    ajisai: { name: '紫陽花 (Ajisai)', colors: ['#a18cd1', '#fbc2eb'] },
    kuri: { name: '栗 (Kuri)', colors: ['#dfd2c0', '#d8cbb6'] }, // Gentle beige/brown
    custom: { name: 'カスタム', colors: ['#FFD200', '#F7971E'] }
};

export interface AppearanceSettings {
    backgroundType: BackgroundType;
    backgroundTheme: PresetTheme; // Added
    gradientColors: [string, string];
    mediaUrl: string;
    bgOpacity: number;
    isCompact: boolean; // Added
    autoCompactOnUnmaximize: boolean; // Added
}

const DEFAULT_SETTINGS: AppearanceSettings = {
    backgroundType: 'gradient',
    backgroundTheme: 'default', // Added
    gradientColors: THEME_PRESETS.default.colors,
    mediaUrl: '',
    bgOpacity: 0.2, // For media overlay
    isCompact: false, // Added
    autoCompactOnUnmaximize: true, // Added
};

interface AppearanceContextType {
    settings: AppearanceSettings;
    updateSettings: (newSettings: Partial<AppearanceSettings>) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('appearanceSettings');
        if (saved) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Failed to load appearance settings', e);
            }
        }
    }, []);

    // Save settings
    useEffect(() => {
        localStorage.setItem('appearanceSettings', JSON.stringify(settings));
        applyBackground(settings);
    }, [settings]);

    const applyBackground = (s: AppearanceSettings) => {
        const root = document.documentElement;

        if (s.backgroundType === 'gradient') {
            root.style.setProperty('--gradient-start', s.gradientColors[0]);
            root.style.setProperty('--gradient-end', s.gradientColors[1]);
            // Force re-render of gradient util if needed, but css var update should work
        }
    };

    const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            return updated;
        });
    };

    // Global Window State Listener
    useEffect(() => {
        if (window.electronAPI?.onWindowStateChanged) {
            const cleanup = window.electronAPI.onWindowStateChanged((state: string) => {
                setSettings(prev => {
                    if (state === 'maximized') {
                        return { ...prev, isCompact: false };
                    } else if (state === 'unmaximized') {
                        if (prev.autoCompactOnUnmaximize) {
                            return { ...prev, isCompact: true };
                        }
                    }
                    return prev;
                });
            });
            return cleanup;
        }
    }, []);

    return (
        <AppearanceContext.Provider value={{ settings, updateSettings }}>
            {/* Background Layer */}
            <div className="fixed inset-0 -z-50 transition-all duration-700 ease-in-out overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)]"
                    style={{
                        background: `linear-gradient(135deg, ${settings.gradientColors[0]} 0%, ${settings.gradientColors[1]} 100%)`,
                        backgroundAttachment: 'fixed',
                        zIndex: -2 // Ensure it stays behind media
                    }}
                />

                {(settings.backgroundType === 'image' || settings.backgroundType === 'video') && settings.mediaUrl && (
                    <>
                        {settings.backgroundType === 'image' ? (
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
                                style={{ backgroundImage: `url(${settings.mediaUrl})` }}
                            />
                        ) : (
                            <video
                                src={settings.mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        {/* Overlay for contrast */}
                        <div
                            className="absolute inset-0 bg-black transition-opacity duration-500"
                            style={{ opacity: settings.bgOpacity }}
                        />
                    </>
                )}
            </div>

            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within AppearanceProvider');
    }
    return context;
}
