import { SessionType } from '@/hooks/usePomodoro';
import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { Pencil, Coffee, Clock } from 'lucide-react';

interface SessionTabsProps {
    currentSession: SessionType;
    onSessionChange: (session: SessionType) => void;
}

export function SessionTabs({ currentSession, onSessionChange }: SessionTabsProps) {
    const { t } = useLanguage();

    const tabs: { type: SessionType; label: string; icon: React.ElementType }[] = [
        { type: 'pomodoro', label: t('timer.pomodoro'), icon: Pencil },
        { type: 'shortBreak', label: t('timer.shortBreak'), icon: Coffee },
        { type: 'longBreak', label: t('timer.longBreak'), icon: Clock },
    ];

    return (
        <div
            className="flex p-1 bg-black/20 backdrop-blur-lg rounded-full border border-white/10 shadow-inner"
            role="tablist"
            aria-label={t('timer.sessionType') || 'セッションタイプ'}
        >
            {tabs.map((tab) => {
                const isActive = currentSession === tab.type;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.type}
                        onClick={() => onSessionChange(tab.type)}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={tab.label}
                        title={tab.label}
                        className={`
                            relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 z-10
                            ${isActive ? 'text-primary-foreground' : 'text-white/60 hover:text-white/90 hover:bg-white/5'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary shadow-lg rounded-full -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
