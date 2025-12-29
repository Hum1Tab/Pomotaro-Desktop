import { SessionType, usePomodoro } from '@/hooks/usePomodoro';
import { useLanguage } from '@/hooks/useLanguage';
import { useAppearance } from '@/contexts/AppearanceContext'; // Added
import { cn } from '@/lib/utils';


interface TimerDisplayProps {
    timeLeft: number; // in seconds
    sessionType: SessionType;
    className?: string;
}

export function TimerDisplay({ timeLeft, sessionType, className }: TimerDisplayProps) {
    const { settings } = usePomodoro();
    const { settings: appearanceSettings } = useAppearance(); // Added
    const { t } = useLanguage();


    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const formatTime = (value: number) => {
        return value.toString().padStart(2, '0');
    };

    // Calculate total duration for progress
    const getTotalDuration = () => {
        switch (sessionType) {
            case 'pomodoro':
                return settings.pomodoroTime * 60;
            case 'shortBreak':
                return settings.shortBreakTime * 60;
            case 'longBreak':
                return settings.longBreakTime * 60;
            default:
                return 25 * 60;
        }
    };

    const totalDuration = getTotalDuration();
    const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
    const strokeDasharray = 283; // 2 * pi * 45 (radius)
    const strokeDashoffset = strokeDasharray * (1 - progress);

    return (
        <div className={cn("flex flex-col items-center justify-center gap-8", className)}>
            {/* Circular Progress */}
            <div className={cn(
                "relative transition-all duration-500",
                appearanceSettings.isCompact ? "w-[240px] h-[240px]" : "w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
            )}>

                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-20"
                    />
                    {/* Progress */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-linear"
                    />
                </svg>

                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn(
                        "font-light tabular-nums tracking-tighter text-white drop-shadow-lg transition-all",
                        appearanceSettings.isCompact ? "text-5xl" : "text-6xl sm:text-8xl"
                    )}>
                        {formatTime(minutes)}:{formatTime(seconds)}
                    </div>
                    <div className={cn(
                        "font-medium text-white/80 mt-2 tracking-widest uppercase transition-all",
                        appearanceSettings.isCompact ? "text-sm" : "text-lg sm:text-xl"
                    )}>
                        {sessionType === 'pomodoro' ? 'FOCUS' : 'BREAK'}
                    </div>
                </div>
            </div>

            {settings.showEstimatedFinishTime && timeLeft > 0 && (
                <div className="text-sm font-medium text-white/50 animate-fade-in -mt-4">
                    {t('timer.estimatedFinishTime')} {' '}
                    {new Date(Date.now() + timeLeft * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            )}
        </div>
    );
}
