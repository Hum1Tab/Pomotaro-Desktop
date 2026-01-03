
import { useMemo, memo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend
} from 'recharts';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useLanguage } from '@/hooks/useLanguage';
import { useStudyCategories } from '@/hooks/useStudyCategories';

export const WeeklyChart = memo(function WeeklyChart() {
    const { getWeeklyStats } = useSessionHistory();
    const { t } = useLanguage();
    const { categories } = useStudyCategories();

    // Map categories for easy lookup of name/color
    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {} as Record<string, typeof categories[0]>);
    }, [categories]);

    const { data, activeCategoryIds } = useMemo(() => {
        const stats = getWeeklyStats();
        const activeIds = new Set<string>();

        const chartData = Object.entries(stats).map(([date, stat]) => {
            const d = new Date(date);
            const categoryBreakdown: Record<string, number> = {};

            stat.sessions.forEach(session => {
                if (session.sessionType === 'pomodoro') {
                    const catId = session.categoryId || 'uncategorized';
                    if (session.categoryId) activeIds.add(catId);

                    categoryBreakdown[catId] = (categoryBreakdown[catId] || 0) + session.duration;
                }
            });

            // Convert to minutes
            const result: any = {
                name: d.toLocaleDateString(undefined, { weekday: 'short' }),
                date: date,
                totalMinutes: Math.round(stat.totalFocusTime / 60),
            };

            Object.entries(categoryBreakdown).forEach(([id, duration]) => {
                result[id] = Math.round(duration / 60);
            });

            return result;
        });

        return { data: chartData, activeCategoryIds: Array.from(activeIds) };
    }, [getWeeklyStats]);

    const totalMinutes = data.reduce((sum, item) => sum + (item.totalMinutes || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{t('stats.weeklyFocus')}</h3>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                    <div className="text-xs text-muted-foreground">{t('stats.totalFocus')}</div>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}m`}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            isAnimationActive={false}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                            cursor={{ fill: 'hsl(var(--muted-foreground))', opacity: 0.1 }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />

                        {/* Render bars for each active category */}
                        {activeCategoryIds.map(catId => (
                            <Bar
                                key={catId}
                                dataKey={catId}
                                name={categoryMap[catId]?.name || 'Unknown'}
                                stackId="a"
                                fill={categoryMap[catId]?.color || '#CCCCCC'}
                                radius={[0, 0, 0, 0]}
                            />
                        ))}

                        {/* Fallback for uncategorized if it exists in data */}
                        <Bar
                            dataKey="uncategorized"
                            name="Uncategorized"
                            stackId="a"
                            fill="hsl(var(--muted-foreground))"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
