import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type NoiseType = 'white' | 'pink' | 'brown';

export interface SoundSettings {
    enabled: boolean;
    volume: number; // 0-1
    whiteNoiseVolume: number; // 0-1
    noiseType: NoiseType;
    sessionCompleteSound: boolean;
    breakCompleteSound: boolean;
}

const DEFAULT_SETTINGS: SoundSettings = {
    enabled: true,
    volume: 0.5,
    whiteNoiseVolume: 0.3, // 研究に基づく最適な初期値（30-50%が効果的）
    noiseType: 'brown',
    sessionCompleteSound: true,
    breakCompleteSound: true,
};

interface SoundContextType {
    settings: SoundSettings;
    updateSettings: (newSettings: Partial<SoundSettings>) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SETTINGS);
    const isLoadedRef = useRef(false);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('soundSettings');
        if (savedSettings) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
            } catch (error) {
                console.error('Failed to load sound settings:', error);
            }
        }
        isLoadedRef.current = true;
    }, []);

    // Save settings to localStorage (only after initial load)
    useEffect(() => {
        if (isLoadedRef.current) {
            localStorage.setItem('soundSettings', JSON.stringify(settings));
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<SoundSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return (
        <SoundContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSoundContext() {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSoundContext must be used within a SoundProvider');
    }
    return context;
}
