import { useCallback, useRef } from 'react';
import { useSoundContext } from '@/contexts/SoundContext';

export type { NoiseType, SoundSettings } from '@/contexts/SoundContext';

export function useSound() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const { settings, updateSettings } = useSoundContext();

    // Initialize AudioContext on first use
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const playSessionCompleteSound = useCallback(() => {
        if (!settings.enabled || !settings.sessionCompleteSound) return;

        const context = getAudioContext();
        const vol = settings.volume;
        const now = context.currentTime;

        // Play a pleasant sequence of beeps using Web Audio API scheduling
        const playBeep = (frequency: number, startTime: number, duration: number) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        // Musical sequence: C5 - E5 - G5 (C major triad)
        playBeep(523.25, now, 0.2);      // C5
        playBeep(659.25, now + 0.25, 0.2); // E5
        playBeep(783.99, now + 0.5, 0.3);  // G5
    }, [settings.enabled, settings.sessionCompleteSound, settings.volume, getAudioContext]);

    const playBreakCompleteSound = useCallback(() => {
        if (!settings.enabled || !settings.breakCompleteSound) return;

        const context = getAudioContext();
        const vol = settings.volume;
        const now = context.currentTime;

        const playBeep = (frequency: number, startTime: number, duration: number) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol * 0.7, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        // Softer, descending tones: G5 - E5
        playBeep(783.99, now, 0.15);      // G5
        playBeep(659.25, now + 0.2, 0.2); // E5
    }, [settings.enabled, settings.breakCompleteSound, settings.volume, getAudioContext]);

    const playClickSound = useCallback(() => {
        if (!settings.enabled) return;

        const context = getAudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 800;

        gainNode.gain.setValueAtTime(settings.volume * 0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.05);
    }, [settings.enabled, settings.volume, getAudioContext]);

    const playSuccessSound = useCallback(() => {
        if (!settings.enabled) return;

        const context = getAudioContext();
        const vol = settings.volume;
        const now = context.currentTime;

        const playBeep = (frequency: number, startTime: number, duration: number) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol * 0.5, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        // Success jingle: C5 - E5 - G5 - C6 (rising triad)
        playBeep(523.25, now, 0.1);        // C5
        playBeep(659.25, now + 0.12, 0.1); // E5
        playBeep(783.99, now + 0.24, 0.1); // G5
        playBeep(1046.5, now + 0.36, 0.2); // C6
    }, [settings.enabled, settings.volume, getAudioContext]);

    const playTickSound = useCallback(() => {
        if (!settings.enabled || !settings.playTickSound) return;

        const context = getAudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Mechanical "tick-tock" feel using low frequency sine pulse
        oscillator.type = 'sine';
        oscillator.frequency.value = 150;

        const now = context.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(settings.volume * 0.1, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }, [settings.enabled, settings.playTickSound, settings.volume, getAudioContext]);


    return {
        settings,
        updateSettings,
        playSessionCompleteSound,
        playBreakCompleteSound,
        playClickSound,
        playSuccessSound,
        playTickSound,
    };
}

