import { SessionType } from '@/hooks/usePomodoro';
import { useLanguage } from '@/hooks/useLanguage';

interface SessionTabsProps {
    currentSession: SessionType;
    onSessionChange: (session: SessionType) => void;
}

export function SessionTabs({ currentSession, onSessionChange }: SessionTabsProps) {
    const { t } = useLanguage();

    const tabs: { type: SessionType; label: string }[] = [
        { type: 'pomodoro', label: t('timer.pomodoro') },
        { type: 'shortBreak', label: t('timer.shortBreak') },
        { type: 'longBreak', label: t('timer.longBreak') },
    ];

    return (
        <div className="flex gap-2 justify-center">
            {tabs.map((tab) => (
                <button
                    key={tab.type}
                    onClick={() => onSessionChange(tab.type)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${currentSession === tab.type
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
