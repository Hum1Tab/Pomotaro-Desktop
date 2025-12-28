import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BackgroundType = 'gradient' | 'image' | 'video';

export interface AppearanceSettings {
    backgroundType: BackgroundType;
    gradientColors: [string, string];
    mediaUrl: string;
    bgOpacity: number;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
    backgroundType: 'gradient',
    gradientColors: ['#FFD200', '#F7971E'], // Default Orange Gradient
    mediaUrl: '',
    bgOpacity: 0.2, // For media overlay
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
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <AppearanceContext.Provider value={{ settings, updateSettings }}>
            {/* Background Layer */}
            <div className="fixed inset-0 -z-50 transition-all duration-700 ease-in-out overflow-hidden">
                {settings.backgroundType === 'gradient' && (
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)]"
                        style={{
                            background: `linear-gradient(135deg, ${settings.gradientColors[0]} 0%, ${settings.gradientColors[1]} 100%)`,
                            backgroundAttachment: 'fixed'
                        }}
                    />
                )}

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
