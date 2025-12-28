import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils'; // Added

import { useAppearance } from '@/contexts/AppearanceContext'; // Added


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
    const { settings: appearanceSettings } = useAppearance(); // Added


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
                size={appearanceSettings.isCompact ? "sm" : "lg"}
                className={cn(
                    "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full shadow-lg hover:shadow-xl transition-all",
                    appearanceSettings.isCompact ? "px-5 py-3 text-sm" : "px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
                )}
            >
                {isRunning ? (
                    <>
                        <Pause className={cn("mr-2", appearanceSettings.isCompact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6")} />
                        {t('timer.pause')}
                    </>
                ) : (
                    <>
                        <Play className={cn("mr-2", appearanceSettings.isCompact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6")} />
                        {t('timer.start')}
                    </>
                )}
            </Button>
            <Button
                onClick={handleReset}
                size={appearanceSettings.isCompact ? "icon" : "lg"}
                variant="outline"
                className={cn(
                    "border-2 border-border text-foreground hover:border-primary hover:text-primary rounded-full",
                    appearanceSettings.isCompact ? "w-10 h-10 p-0" : "px-4 sm:px-6 py-4 sm:py-6"
                )}
            >
                <RotateCcw className={appearanceSettings.isCompact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} />
            </Button>
        </div>
    );
}
