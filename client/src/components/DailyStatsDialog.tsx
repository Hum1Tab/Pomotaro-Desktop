
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useMemo } from 'react';
import { SessionRecord, DailyStats, useSessionHistory } from '../hooks/useSessionHistory';
import { useLanguage } from '@/hooks/useLanguage';
import { useStudyCategories } from '@/hooks/useStudyCategories';

import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface DailyStatsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    stats: DailyStats | null;
    dateStr: string;
}



export function DailyStatsDialog({ isOpen, onClose, stats, dateStr }: DailyStatsDialogProps) {
    const { t } = useLanguage();
    const { categories } = useStudyCategories();

    // Create O(1) category lookup map
    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {} as Record<string, typeof categories[0]>);
    }, [categories]);



    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours === 0 && minutes === 0 && seconds > 0) {
            return '< 1m';
        }

        return `${hours > 0 ? `${hours}h ` : ''}${minutes} m`;
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const sessions = stats?.sessions || [];
    const focusSessions = sessions.filter(s => s.sessionType === 'pomodoro');

    // Aggregate by category ID to preserve color info
    const categoryStats = useMemo(() => {
        const stats: Record<string, { name: string; duration: number; color: string }> = {};

        focusSessions.forEach((session) => {
            const id = session.categoryId || 'uncategorized';
            const category = session.categoryId ? categoryMap[session.categoryId] : null;

            if (!stats[id]) {
                stats[id] = {
                    name: category?.name || session.categoryName || t('stats.uncategorized') || 'Uncategorized',
                    duration: 0,
                    color: category?.color || '#9ca3af' // Default gray
                };
            }
            stats[id].duration += session.duration;
        });

        return Object.values(stats);
    }, [focusSessions, categoryMap, t]);

    const pieData = useMemo(() => {
        return categoryStats
            .map((stat) => ({
                name: stat.name,
                value: Math.round(stat.duration / 60), // minutes
                color: stat.color
            }))
            .sort((a, b) => b.value - a.value);
    }, [categoryStats]);

    // Tooltip duration formatter
    const formatTooltipDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}時間 ${m}分` : `${m}分`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{formatDate(dateStr)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">{t('stats.totalFocus')}</div>
                            <div className="text-2xl font-bold text-primary">
                                {formatDuration(stats?.totalFocusTime || 0)}
                            </div>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">{t('stats.sessions')}</div>
                            <div className="text-2xl font-bold text-foreground">
                                {stats?.pomodoroCount || 0}
                            </div>
                        </div>
                    </div>

                    {/* Category Chart */}
                    {pieData.length > 0 && (
                        <div className="h-[200px] w-full">
                            <h3 className="text-sm font-semibold mb-2">{t('stats.categoryFocus')}</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        cornerRadius={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number, name: string) => [formatTooltipDuration(value), name]}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            color: 'hsl(var(--foreground))',
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                                        cursor={{ fill: 'hsl(var(--muted-foreground))', opacity: 0.1 }}
                                    />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Session List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground">{t('stats.history')}</h3>
                        <ScrollArea className="h-[300px] pr-4">
                            {focusSessions.length > 0 ? (
                                <div className="space-y-3">
                                    {focusSessions.map((session, index) => (
                                        <div
                                            key={session.id || index}
                                            className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-xl">
                                                    {(() => {
                                                        const category = session.categoryId ? categoryMap[session.categoryId] : undefined;
                                                        return category ? category.icon : '🍅';
                                                    })()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {session.categoryName || session.taskName || t('tabs.timer')}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="font-mono text-sm font-semibold">
                                                {formatDuration(session.duration)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">{t('stats.noSessions')}</p>
                            )}
                        </ScrollArea>
                    </div >
                </div >
            </DialogContent >
        </Dialog >
    );
}
