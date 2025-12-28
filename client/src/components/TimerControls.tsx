import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSound } from '@/hooks/useSound';

interface TimerControlsProps {
    isRunning: boolean;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
}

export function TimerControls({
    isRunning,
    onStart,
    onPause,
    onReset,
}: TimerControlsProps) {
    const { t } = useLanguage();
    const { playClickSound } = useSound();

    const handleStartPause = () => {
        playClickSound();
        isRunning ? onPause() : onStart();
    };

    const handleReset = () => {
        playClickSound();
        onReset();
    };

    return (
        <div className="flex gap-3 sm:gap-4 justify-center items-center">
            <Button
                onClick={handleStartPause}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
                {isRunning ? (
                    <>
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        {t('timer.pause')}
                    </>
                ) : (
                    <>
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        {t('timer.start')}
                    </>
                )}
            </Button>
            <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="border-2 border-border text-foreground hover:border-primary hover:text-primary px-4 sm:px-6 py-4 sm:py-6 rounded-full"
            >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
        </div>
    );
}
