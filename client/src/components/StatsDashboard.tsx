import { useState, useMemo, memo } from 'react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useStudyCategories } from '@/hooks/useStudyCategories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '@/hooks/useLanguage';

export const StatsDashboard = memo(function StatsDashboard() {
  const history = useSessionHistory();
  const { t } = useLanguage();
  const { categories } = useStudyCategories();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const totalStats = history.getTotalStats();
  const dailyStats = history.getDailyStats(selectedDate);
  const weeklyStats = history.getWeeklyStats();
  const monthlyStats = history.getMonthlyStats(selectedYear, selectedMonth);
  const yearlyStats = history.getYearlyStats(selectedYear);

  // Pre-compute category map for O(1) lookup
  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<string, typeof categories[0]>);
  }, [categories]);

  // Calculate category-based statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { name: string; focusTime: number; color: string }> = {};

    history.sessions
      .filter((session) => session.sessionType === 'pomodoro' && session.categoryId)
      .forEach((session) => {
        const categoryId = session.categoryId!;
        if (!stats[categoryId]) {
          const category = categoryMap[categoryId];
          stats[categoryId] = {
            name: session.categoryName || 'Unknown',
            focusTime: 0,
            color: category?.color || '#CCCCCC',
          };
        }
        stats[categoryId].focusTime += session.duration;
      });

    return Object.values(stats);
  }, [history.sessions, categoryMap]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Prepare chart data
  const weeklyChartData = Object.entries(weeklyStats).map(([date, stats]) => ({
    date: new Date(date).toLocaleDateString('ja-JP', { weekday: 'short' }),
    focusTime: Math.round(stats.totalFocusTime / 60),
    pomodoros: stats.pomodoroCount,
  }));

  const monthlyChartData = Object.entries(monthlyStats).map(([date, stats]) => ({
    date: new Date(date).getDate(),
    focusTime: Math.round(stats.totalFocusTime / 60),
    pomodoros: stats.pomodoroCount,
  }));

  const yearlyChartData = Object.entries(yearlyStats).map(([month, stats]) => ({
    month: new Date(0, parseInt(month)).toLocaleDateString('ja-JP', { month: 'short' }),
    focusTime: Math.round(stats.totalFocusTime / 60),
    pomodoros: stats.pomodoroCount,
  }));

  const pieData = [
    { name: 'Focus', value: Math.round(totalStats.totalFocusTime / 60) },
    { name: 'Break', value: Math.round(totalStats.totalBreakTime / 60) },
  ];

  const categoryPieData = categoryStats.map((stat) => ({
    name: stat.name,
    value: Math.round(stat.focusTime / 60),
    color: stat.color,
  }));

  const COLORS = ['#E8644A', '#8B9D83'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">{t('stats.totalFocus')}</div>
          <div className="text-xl sm:text-2xl font-bold text-primary mt-2">
            {formatTime(totalStats.totalFocusTime)}
          </div>
        </Card>
        <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">{t('stats.totalPomodoros')}</div>
          <div className="text-xl sm:text-2xl font-bold text-primary mt-2">
            {totalStats.pomodoroCount}
          </div>
        </Card>
        <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">{t('stats.totalBreak')}</div>
          <div className="text-xl sm:text-2xl font-bold text-accent-foreground mt-2">
            {formatTime(totalStats.totalBreakTime)}
          </div>
        </Card>
        <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">{t('stats.todaysFocus')}</div>
          <div className="text-xl sm:text-2xl font-bold text-primary mt-2">
            {formatTime(dailyStats.totalFocusTime)}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="day">{t('stats.day')}</TabsTrigger>
          <TabsTrigger value="week">{t('stats.week')}</TabsTrigger>
          <TabsTrigger value="month">{t('stats.month')}</TabsTrigger>
          <TabsTrigger value="year">{t('stats.year')}</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-4">
          <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('stats.todaysSessions')}</h3>
            <div className="space-y-2">
              {dailyStats.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('stats.noSessions')}</p>
              ) : (
                dailyStats.sessions.map((session) => (
                  <div key={session.id} className="flex justify-between text-sm p-2 rounded bg-secondary/50">
                    <span className="text-foreground">{session.taskName || session.sessionType}</span>
                    <span className="text-muted-foreground">{formatTime(session.duration)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('stats.weeklyFocus')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  isAnimationActive={false}
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="focusTime" fill="hsl(var(--primary))" name="Focus (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('stats.monthlyFocus')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  isAnimationActive={false}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="focusTime" stroke="hsl(var(--primary))" name="Focus (min)" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="year" className="space-y-4">
          <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('stats.yearlyFocus')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  isAnimationActive={false}
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="focusTime" fill="hsl(var(--primary))" name="Focus (min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('stats.focusVsBreak')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}m`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Category Statistics */}
      {categoryPieData.length > 0 && (
        <Card className="p-4 bg-card/90 backdrop-blur-sm shadow-warm">
          <h3 className="text-sm font-semibold text-foreground mb-4">カテゴリー別学習時間</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}m`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                isAnimationActive={false}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Category List */}
          <div className="mt-4 space-y-2">
            {categoryStats.map((stat) => (
              <div key={stat.name} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-sm text-foreground">{stat.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatTime(stat.focusTime)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});
