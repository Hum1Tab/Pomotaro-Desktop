
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function DigitalClock() {
    const { language } = useLanguage();
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = date.toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const dateString = date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex flex-col items-start select-none">
            <div className="text-4xl font-bold tracking-tight text-foreground/90 font-mono">
                {timeString}
            </div>
            <div className="text-sm font-medium text-muted-foreground tracking-wide">
                {dateString}
            </div>
        </div>
    );
}
