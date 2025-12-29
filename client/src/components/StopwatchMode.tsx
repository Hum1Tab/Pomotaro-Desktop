import { useState } from 'react';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useStudyCategories } from '@/hooks/useStudyCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function StopwatchMode() {
  const stopwatch = useStopwatch();
  const history = useSessionHistory();
  const { categories, selectedCategoryId: globalSelectedId } = useStudyCategories();
  const [taskName, setTaskName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(globalSelectedId);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSaveTime = () => {
    const category = categories.find(c => c.id === selectedCategoryId);

    history.addSession(
      stopwatch.timeElapsed,
      'pomodoro',
      undefined,
      taskName || undefined,
      selectedCategoryId,
      category?.name
    );
    toast.success(`${stopwatch.formatTime(stopwatch.timeElapsed)} saved as study time!`);
    stopwatch.reset();
    setTaskName('');
    setShowSaveForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Stopwatch Mode
        </div>
        <div className="timer-display text-primary transition-colors duration-300 text-3xl sm:text-5xl font-mono">
          {stopwatch.formatTime(stopwatch.timeElapsed)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {!stopwatch.isRunning ? (
          <Button
            onClick={stopwatch.start}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
            Start
          </Button>
        ) : (
          <Button
            onClick={stopwatch.pause}
            size="lg"
            variant="outline"
            className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-semibold border-2 border-primary text-primary hover:bg-primary/5"
          >
            <Pause className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
            Pause
          </Button>
        )}

        <Button
          onClick={stopwatch.reset}
          size="lg"
          variant="ghost"
          className="rounded-full p-2 sm:p-3 text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <RotateCcw className="w-4 sm:w-5 h-4 sm:h-5" />
        </Button>

        <Button
          onClick={() => stopwatch.addTime(60)}
          size="lg"
          variant="outline"
          className="rounded-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-2 border-border text-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-1" />
          +1m
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[1, 5, 10, 30].map((minutes) => (
          <Button
            key={minutes}
            onClick={() => stopwatch.addTime(minutes * 60)}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm border-2 border-border text-foreground hover:border-primary hover:text-primary"
          >
            +{minutes}m
          </Button>
        ))}
      </div>

      {stopwatch.timeElapsed > 0 && (
        <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border-2 border-primary/20">
          <h3 className="text-sm font-semibold text-foreground">Save as Study Time</h3>

          {!showSaveForm ? (
            <Button
              onClick={() => setShowSaveForm(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Time
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Task name (optional)"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="rounded-lg border-2 border-border focus:border-primary focus:ring-0 bg-input text-sm"
              />

              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="w-full bg-input border-2 border-border focus:ring-0">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveTime}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveForm(false);
                    setTaskName('');
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-border text-foreground hover:border-primary hover:text-primary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
