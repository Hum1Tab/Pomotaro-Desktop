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

      <Card className="p-6 bg-card/30 border-2 shadow-none rounded-xl">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-muted-foreground/70 py-2 uppercase tracking-wider"
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

            if (dayStats && dayStats.sessions) {
              const categoryDurations: Record<string, number> = {};
              dayStats.sessions.forEach((session: any) => {
                if (session.sessionType === 'pomodoro' && session.categoryId) {
                  categoryDurations[session.categoryId] = (categoryDurations[session.categoryId] || 0) + session.duration;
                }
              });

              let maxDuration = 0;
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
                className={`aspect-square p-1 sm:p-2 rounded-xl border-2 transition-all relative group cursor-pointer flex flex-col justify-between
                  ${isToday ? 'ring-2 ring-primary border-primary' : 'border-transparent hover:border-primary/50'}
                  ${dominantColor ? 'bg-card' : 'hover:bg-card/50'}
                `}
                style={dominantColor ? { borderColor: dominantColor, color: dominantColor } : undefined}
                title={`${day}: ${formatTime(focusTime)}`}
              >
                {/* Background "Fill" style for intensity if no specific category, or simple highlight */}
                {!dominantColor && focusTime > 0 && (
                  <div className={`absolute inset-0 rounded-xl opacity-20 ${getIntensityColor(focusTime)}`} />
                )}

                <div className={`text-sm font-bold z-10 ${dominantColor ? '' : 'text-foreground'}`}>
                  {day}
                </div>

                {focusTime > 0 && (
                  <div className="z-10 text-[10px] font-medium text-right opacity-80">
                    {dayStats?.pomodoroCount || 0}
                    <span className="text-[8px] ml-0.5">🍅</span>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 bg-card/30 border-2 shadow-none rounded-xl">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Activity Legend</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md border-2 border-primary/20 bg-primary/10" />
              <span className="text-sm text-foreground">Some Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md border-2 border-primary/40 bg-primary/30" />
              <span className="text-sm text-foreground">Good Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md border-2 border-primary/60 bg-primary/50" />
              <span className="text-sm text-foreground">High Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md border-2 border-[var(--category-color)] bg-card" />
              <span className="text-sm text-foreground">Category Color</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card/30 border-2 shadow-none rounded-xl">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Monthly Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
              <span className="text-sm font-medium text-muted-foreground">Total Focus</span>
              <span className="text-base font-bold text-primary">
                {formatTime(
                  Object.values(monthlyStats).reduce((sum: number, day: any) => sum + day.totalFocusTime, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
              <span className="text-sm font-medium text-muted-foreground">Total Pomodoros</span>
              <span className="text-base font-bold text-primary">
                {Object.values(monthlyStats).reduce((sum: number, day: any) => sum + day.pomodoroCount, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-card/50">
              <span className="text-sm font-medium text-muted-foreground">Active Days</span>
              <span className="text-base font-bold text-primary">
                {Object.values(monthlyStats).filter((day: any) => day.totalFocusTime > 0).length}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ {daysInMonth}</span>
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
