import { useState } from 'react';
import { useSessionHistory } from '../hooks/useSessionHistory'; // Corrected Relative import
import { useStudyCategories } from '@/hooks/useStudyCategories';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyStatsDialog } from '@/components/DailyStatsDialog';

export function CalendarView() {
  const history = useSessionHistory();
  const { categories } = useStudyCategories();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Get stats for the month
  const monthlyStats = history.getMonthlyStats(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0 && minutes === 0 && seconds > 0) {
      return '< 1m';
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };


  const getIntensityColor = (focusTime: number) => {
    if (focusTime === 0) return 'bg-secondary/30';
    if (focusTime < 30 * 60) return 'bg-primary/20';
    if (focusTime < 60 * 60) return 'bg-primary/40';
    if (focusTime < 120 * 60) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDialogOpen(true);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevMonth}
            variant="outline"
            size="sm"
            className="border-2 border-border text-foreground hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleNextMonth}
            variant="outline"
            size="sm"
            className="border-2 border-border text-foreground hover:border-primary hover:text-primary"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-card shadow-warm">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}


          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div key={`empty-${index}`} className="aspect-square p-2" />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayStats = monthlyStats[dateStr]; // DailyStats or undefined
            const focusTime = dayStats?.totalFocusTime || 0;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            let dominantColor: string | undefined = undefined;
            let maxDuration = 0;

            if (dayStats && dayStats.sessions) {
              const categoryDurations: Record<string, number> = {};
              dayStats.sessions.forEach((session: any) => {
                // Only count pomodoro sessions with a category
                if (session.sessionType === 'pomodoro' && session.categoryId) {
                  categoryDurations[session.categoryId] = (categoryDurations[session.categoryId] || 0) + session.duration;
                }
              });

              let topCategoryId: string | null = null;
              Object.entries(categoryDurations).forEach(([catId, duration]) => {
                if (duration > maxDuration) {
                  maxDuration = duration;
                  topCategoryId = catId;
                }
              });

              if (topCategoryId) {
                const category = categories.find(c => c.id === topCategoryId);
                if (category) {
                  dominantColor = category.color;
                }
              }
            }

            return (
              <div
                key={day}
                onClick={() => handleDayClick(dateStr)}
                className={`aspect-square p-1 sm:p-2 rounded-lg ${!dominantColor ? getIntensityColor(focusTime) : ''
                  } ${isToday ? 'ring-2 ring-primary' : ''
                  } cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group`}
                style={dominantColor ? { backgroundColor: dominantColor } : undefined}
                title={`${day}: ${formatTime(focusTime)}`}
              >
                <div className="h-full flex flex-col justify-between">
                  <div className={`text-xs sm:text-sm font-semibold ${dominantColor ? 'text-white' : 'text-foreground'}`}>
                    {day}
                  </div>
                  <div className={`text-xs ${dominantColor ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {dayStats?.pomodoroCount || 0}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-card shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">Intensity Legend</div>
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary/30" />
              <span className="text-xs text-foreground">No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/20" />
              <span className="text-xs text-foreground">Light</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/40" />
              <span className="text-xs text-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/60" />
              <span className="text-xs text-foreground">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/80" />
              <span className="text-xs text-foreground">Very High</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card shadow-warm">
          <div className="text-xs sm:text-sm text-muted-foreground">Month Summary</div>
          <div className="space-y-2 mt-3">
            <div className="flex justify-between">
              <span className="text-xs text-foreground">Total Focus</span>
              <span className="text-xs font-semibold text-primary">
                {formatTime(
                  Object.values(monthlyStats).reduce((sum: number, day: any) => sum + day.totalFocusTime, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-foreground">Total Pomodoros</span>
              <span className="text-xs font-semibold text-primary">
                {Object.values(monthlyStats).reduce((sum: number, day: any) => sum + day.pomodoroCount, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-foreground">Active Days</span>
              <span className="text-xs font-semibold text-primary">
                {Object.values(monthlyStats).filter((day: any) => day.totalFocusTime > 0).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <DailyStatsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        stats={selectedDate ? monthlyStats[selectedDate] : null}
        dateStr={selectedDate || ''}
      />
    </div>
  );
}
