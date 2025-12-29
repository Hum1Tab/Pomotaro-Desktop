import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useSoundContext, NoiseType } from '@/contexts/SoundContext';

interface WhiteNoiseContextType {
    isPlaying: boolean;
    toggle: () => void;
}

const WhiteNoiseContext = createContext<WhiteNoiseContextType | undefined>(undefined);

export function WhiteNoiseProvider({ children }: { children: ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const bufferCache = useRef<Map<NoiseType, AudioBuffer>>(new Map()); // ノイズタイプごとのキャッシュ
    const { settings } = useSoundContext();
    const volume = settings.whiteNoiseVolume;
    const noiseType = settings.noiseType;

    // Initialize AudioContext lazily or on mount? 
    // Usually on first user interaction is better, but here we init on mount to be ready
    useEffect(() => {
        // We don't necessarily start context here, just prepare refs if needed
        // Cleanup on unmount
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Handle Volume Changes
    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            // Smooth transition
            gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);
        }
    }, [volume]);

    // ノイズバッファを生成（タイプごとにキャッシュ）
    const createNoiseBuffer = useCallback((ctx: AudioContext, type: NoiseType): AudioBuffer => {
        const cached = bufferCache.current.get(type);
        if (cached) {
            return cached;
        }

        // バッファサイズ: 10秒分でループ時の継ぎ目を目立たなくする
        const bufferSize = ctx.sampleRate * 10;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        switch (type) {
            case 'white':
                // ホワイトノイズ: 全周波数が均等
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.3;
                }
                break;

            case 'pink':
                // ピンクノイズ: Voss-McCartney アルゴリズムで1/fノイズを生成
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.15;
                    b6 = white * 0.115926;
                }
                break;

            case 'brown':
                // ブラウンノイズ: 積分フィルタで低周波数を強調
                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    lastOut = (lastOut + (0.02 * white)) / 1.02;
                    data[i] = lastOut * 3.5;
                }
                break;
        }

        bufferCache.current.set(type, buffer);
        return buffer;
    }, []);

    // Handle Noise Type Changes - 再生中の場合は自動的に切り替え
    useEffect(() => {
        if (!isPlaying) return;

        // 現在の再生を停止
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }

        // 新しいタイプで再生
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const buffer = createNoiseBuffer(ctx, noiseType);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();

        sourceNodeRef.current = source;
        gainNodeRef.current = gainNode;
    }, [noiseType, isPlaying, createNoiseBuffer]); // volumeを依存配列から削除

    const play = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // バッファを取得（ノイズタイプに応じてキャッシュから取得または生成）
        const buffer = createNoiseBuffer(ctx, noiseType);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();

        sourceNodeRef.current = source;
        gainNodeRef.current = gainNode;
        setIsPlaying(true);
    }, [createNoiseBuffer, noiseType, volume]);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const toggle = useCallback(() => {
        if (isPlaying) {
            stop();
        } else {
            play();
        }
    }, [isPlaying, play, stop]);

    return (
        <WhiteNoiseContext.Provider value={{ isPlaying, toggle }}>
            {children}
        </WhiteNoiseContext.Provider>
    );
}

export function useWhiteNoiseContext() {
    const context = useContext(WhiteNoiseContext);
    if (!context) {
        throw new Error('useWhiteNoiseContext must be used within a WhiteNoiseProvider');
    }
    return context;
}
