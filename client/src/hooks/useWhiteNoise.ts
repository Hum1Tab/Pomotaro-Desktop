import { useWhiteNoiseContext } from '@/contexts/WhiteNoiseContext';

export function useWhiteNoise(volume?: number) {
    // Volume is now handled globally by the context via useSound
    return useWhiteNoiseContext();
}
