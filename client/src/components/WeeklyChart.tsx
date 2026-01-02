import { useMemo, memo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useTheme } from '@/hooks/useTheme';
import { useLanguage } from '@/hooks/useLanguage';

export const WeeklyChart = memo(function WeeklyChart() {
    const { getWeeklyStats } = useSessionHistory();
    const { theme } = useTheme();
    const { t } = useLanguage();

    const data = useMemo(() => {
        const stats = getWeeklyStats();
        return Object.entries(stats).map(([date, stat]) => {
            const d = new Date(date);
            return {
                name: d.toLocaleDateString(undefined, { weekday: 'short' }),
                date: date,
                minutes: Math.round(stat.totalFocusTime / 60),
            };
        });
    }, [getWeeklyStats]);

    const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Weekly Focus</h3>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}m`}
                        />
                        <Tooltip
                            isAnimationActive={false}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                            }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar
                            dataKey="minutes"
                            fill="currentColor"
                            className="fill-primary"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
