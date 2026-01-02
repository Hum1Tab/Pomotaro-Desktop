
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

const COLORS = ['#E8644A', '#8B9D83', '#E8A84A', '#4A90E2', '#9B59B6', '#34495E'];

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

    // Aggregate by category
    const categoryStats = useMemo(() => {
        return focusSessions.reduce((acc: Record<string, number>, session: SessionRecord) => {
            const name = session.categoryName || 'Uncategorized';
            acc[name] = (acc[name] || 0) + session.duration;
            return acc;
        }, {} as Record<string, number>);
    }, [focusSessions]);

    const pieData = useMemo(() => {
        return Object.entries(categoryStats).map(([name, value]: [string, unknown]) => ({
            name,
            value: Math.round((value as number) / 60), // minutes
        })).sort((a, b) => b.value - a.value);
    }, [categoryStats]);

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
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number) => `${value} min`}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            color: 'hsl(var(--popover-foreground))',
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'inherit' }}
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
