import { AddTaskForm } from '@/components/AddTaskForm';
import { ExamCountdown } from '@/components/ExamCountdown';
import { SessionInfo } from '@/components/SessionInfo';
import { SessionTabs } from '@/components/SessionTabs';
import { TaskList } from '@/components/TaskList';
import { TimerControls } from '@/components/TimerControls';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/ui/button';
import { Maximize2, Waves } from 'lucide-react';
import type { HomeLogic } from '@/hooks/useHomeLogic';

export function TimerTab({ logic }: { logic: HomeLogic }) {
  const { pomodoro, activeTasks, tasks, handleAddTask, handleStartTimer, setIsFocusMode, toggleNoise, isNoisePlaying, t } = logic;
  return (
    <>
      <ExamCountdown />
      <div className="relative flex min-h-[60vh] flex-col items-center justify-center">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10 text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setIsFocusMode(true)} title={t('timer.focusMode')}>
          <Maximize2 className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 z-10 text-white/70 hover:bg-white/10 hover:text-white" onClick={toggleNoise} title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}>
          <Waves className={`h-6 w-6 ${isNoisePlaying ? 'animate-pulse' : ''}`} />
        </Button>
        <div className="mb-8 scale-90 transition-transform sm:scale-100"><SessionTabs currentSession={pomodoro.sessionType} onSessionChange={pomodoro.switchSession} /></div>
        <div className="mb-12"><TimerDisplay timeLeft={pomodoro.timeLeft} sessionType={pomodoro.sessionType} /></div>
        <div className="scale-125"><TimerControls isRunning={pomodoro.isRunning} onStart={handleStartTimer} onPause={pomodoro.pause} onReset={pomodoro.reset} /></div>
        <div className="mt-8"><SessionInfo sessionsCompleted={pomodoro.sessionsCompleted} /></div>
      </div>
      {(pomodoro.settings.showTaskInput || activeTasks.length > 0) && (
        <div className="space-y-4 rounded-lg bg-card p-4 shadow-warm sm:space-y-6 sm:p-8">
          {pomodoro.settings.showTaskInput && <AddTaskForm onAddTask={handleAddTask} />}
          {activeTasks.length > 0 && <TaskList tasks={activeTasks} onToggleComplete={tasks.toggleTaskCompletion} onDeleteTask={tasks.deleteTask} />}
        </div>
      )}
    </>
  );
}
