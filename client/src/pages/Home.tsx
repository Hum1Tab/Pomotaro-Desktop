
import { useHomeLogic } from '@/hooks/useHomeLogic';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Moon, Sun, Maximize2, Minimize2, Timer, Watch, Layers, BarChart2, Calendar, Wrench, Waves } from 'lucide-react';
import { TimerDisplay } from '@/components/TimerDisplay';
import { TimerControls } from '@/components/TimerControls';
import { SessionTabs } from '@/components/SessionTabs';
import { SessionInfo } from '@/components/SessionInfo';
import { TaskList } from '@/components/TaskList';
import { AddTaskForm } from '@/components/AddTaskForm';
import { StatsDashboard } from '@/components/StatsDashboard';
import { StopwatchMode } from '@/components/StopwatchMode';
import { CalendarView } from '@/components/CalendarView';
import { CategorySelector } from '@/components/CategorySelector';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';

import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { ExamCountdown } from '@/components/ExamCountdown';
import { ExamManager } from '@/components/ExamManager';
import { FallingTomato } from '@/components/FallingTomato';
import { DigitalClock } from '@/components/DigitalClock';

export default function Home() {
  const {
    pomodoro,
    tasks,
    activeTasks,
    sound,
    isNoisePlaying,
    toggleNoise,
    theme,
    setLightTheme,
    setDarkTheme,
    appearanceSettings,
    t,
    activeTab,
    setActiveTab,
    showCategoryDialog,
    setShowCategoryDialog,
    isFocusMode,
    setIsFocusMode,
    tomatoes,
    setTomatoes,
    handleAddTask,
    handleStartTimer,
    handleCategoryConfirm,
    toggleCompactMode,
    goToSettings,
    currentCompact
  } = useHomeLogic();

  useKeyboardShortcuts({
    startPause: () => {
      if (pomodoro.isRunning) {
        pomodoro.pause();
      } else {
        handleStartTimer();
      }
    },
    reset: () => pomodoro.reset(),
    toggleSettings: () => goToSettings(),
  });

  return (
    <div className="min-h-screen transition-colors duration-500 relative">
      {/* Home Clock - Top Left */}
      {!isFocusMode && (
        <div className="absolute top-6 left-6 z-10 opacity-80 hover:opacity-100 transition-opacity hidden sm:block">
          <DigitalClock />
        </div>
      )}

      {/* Main Content */}
      {!isFocusMode && !appearanceSettings.isCompact && (
        <main className="container mx-auto px-4 py-8 pb-32 max-w-4xl animate-fade-in-up">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Bottom Dock Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 pl-4 pr-2 flex items-center gap-2 shadow-2xl ring-1 ring-white/10">
                <TabsList className="bg-transparent p-0 flex items-center gap-1 h-auto">
                  <TabsTrigger value="timer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.timer')}>
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                  <TabsTrigger value="stopwatch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.stopwatch')}>
                    <Watch className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.categories')}>
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.stats')}>
                    <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.calendar')}>
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0 flex items-center justify-center transition-all hover:bg-muted/50 data-[state=active]:shadow-lg" title={t('tabs.tools')}>
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
                  </TabsTrigger>
                </TabsList>
                <div className="w-px h-8 bg-border mx-1" />
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      sound.playClickSound();
                      if (theme === 'dark') setLightTheme();
                      else setDarkTheme();
                    }}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all"
                    title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </Button>
                  <Button
                    onClick={goToSettings}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Timer Tab */}
            <TabsContent value="timer" className="space-y-6">
              <ExamCountdown />
              <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setIsFocusMode(true)}
                  title={t('timer.focusMode')}
                >
                  <Maximize2 className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={toggleNoise}
                  title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}
                >
                  <Waves className={`w-6 h-6 ${isNoisePlaying ? 'animate-pulse' : ''}`} />
                </Button>
                <div className="mb-8 scale-90 sm:scale-100 transition-transform">
                  <SessionTabs
                    currentSession={pomodoro.sessionType}
                    onSessionChange={pomodoro.switchSession}
                  />
                </div>
                <div className="mb-12">
                  <TimerDisplay
                    timeLeft={pomodoro.timeLeft}
                    sessionType={pomodoro.sessionType}
                  />
                </div>
                <div className="scale-125">
                  <TimerControls
                    isRunning={pomodoro.isRunning}
                    onStart={handleStartTimer}
                    onPause={pomodoro.pause}
                    onReset={pomodoro.reset}
                  />
                </div>
                <div className="mt-8">
                  <SessionInfo
                    sessionsCompleted={pomodoro.sessionsCompleted}
                  />
                </div>
              </div>

              {/* Tasks Section */}
              {(pomodoro.settings.showTaskInput || activeTasks.length > 0) && (
                <div className="space-y-4 sm:space-y-6 bg-card rounded-lg p-4 sm:p-8 shadow-warm">
                  <div>
                    {pomodoro.settings.showTaskInput && (
                      <AddTaskForm onAddTask={handleAddTask} />
                    )}
                  </div>
                  {activeTasks.length > 0 && (
                    <div>
                      <TaskList
                        tasks={activeTasks}
                        onToggleComplete={tasks.toggleTaskCompletion}
                        onDeleteTask={tasks.deleteTask}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="stopwatch" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <StopwatchMode />
            </TabsContent>
            <TabsContent value="categories" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <CategorySelector />
            </TabsContent>
            <TabsContent value="stats" className="space-y-6">
              <StatsDashboard />
            </TabsContent>
            <TabsContent value="calendar" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <CalendarView />
            </TabsContent>
            <TabsContent value="tools" className="space-y-6">
              <ExamManager />
              <div className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
                <ShortcutsDialog />
              </div>


            </TabsContent>
          </Tabs>
        </main>
      )}

      {/* Compact Mode Layout */}
      {!isFocusMode && appearanceSettings.isCompact && (
        <main className="fixed inset-0 flex flex-col items-center justify-between p-6 animate-fade-in select-none">
          {/* Draggable Background Area */}
          <div
            className="absolute inset-0 z-0"
            style={{ WebkitAppRegion: 'drag' } as any}
          />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-2">
            {/* Top: Session Tabs */}
            <div className="scale-90 opacity-90 hover:opacity-100 transition-opacity pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <SessionTabs
                currentSession={pomodoro.sessionType}
                onSessionChange={pomodoro.switchSession}
              />
            </div>

            {/* Center: Timer Display */}
            <div className="flex-1 flex items-center justify-center py-4">
              <TimerDisplay timeLeft={pomodoro.timeLeft} sessionType={pomodoro.sessionType} />
            </div>

            {/* Bottom: Controls and Meta Actions */}
            <div className="flex flex-col items-center gap-4 w-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className="pointer-events-auto">
                <TimerControls isRunning={pomodoro.isRunning} onStart={handleStartTimer} onPause={pomodoro.pause} onReset={pomodoro.reset} />
              </div>

              <div className="flex items-center justify-between w-full px-2 gap-2">
                <Button onClick={goToSettings} variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white pointer-events-auto h-8 w-8">
                  <Settings className="w-3.5 h-3.5" />
                </Button>

                <div className="flex-1 text-center">
                  <div className="inline-block text-[10px] font-medium text-white/60 bg-white/5 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                    {pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <Button onClick={toggleNoise} variant="ghost" size="icon" className={`bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white pointer-events-auto h-8 w-8 ${isNoisePlaying ? 'animate-pulse text-white' : ''}`} title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}>
                    <Waves className="w-3.5 h-3.5" />
                  </Button>
                  <Button onClick={toggleCompactMode} variant="ghost" size="icon" className="bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white pointer-events-auto h-8 w-8" title={t('settings.compactDisable')}>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center w-full gap-8 sm:gap-12">
            <div className="scale-110 opacity-80 hover:opacity-100 transition-opacity">
              <SessionTabs
                currentSession={pomodoro.sessionType}
                onSessionChange={pomodoro.switchSession}
              />
            </div>

            <TimerDisplay timeLeft={pomodoro.timeLeft} sessionType={pomodoro.sessionType} className="scale-110 sm:scale-125" />

            <div className="flex flex-col items-center gap-12 mt-8">
              <div className="scale-125 sm:scale-150 transform origin-center">
                <TimerControls isRunning={pomodoro.isRunning} onStart={handleStartTimer} onPause={pomodoro.pause} onReset={pomodoro.reset} />
              </div>

              <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md p-2 px-6 rounded-full border border-white/10">
                <Button onClick={goToSettings} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-12 h-12 rounded-full hover:bg-muted/20">
                  <Settings className="w-6 h-6" />
                </Button>

                <div className="w-px h-6 bg-white/10" />

                <Button onClick={toggleNoise} variant="ghost" size="icon" className={`text-muted-foreground hover:text-foreground w-12 h-12 rounded-full hover:bg-muted/20 ${isNoisePlaying ? 'animate-pulse text-primary' : ''}`} title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}>
                  <Waves className="w-6 h-6" />
                </Button>

                <div className="w-px h-6 bg-white/10" />

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-12 h-12 rounded-full hover:bg-muted/20" onClick={() => setIsFocusMode(false)} title={t('timer.exitFocusMode')}>
                  <Minimize2 className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="text-xl sm:text-2xl text-muted-foreground font-medium opacity-30 mt-4">
              {pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Dialog */}
      <CategorySelectionDialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)} onConfirm={handleCategoryConfirm} />

      {/* Falling Tomatoes Animation */}
      {tomatoes.map(id => (
        <FallingTomato key={id} id={id} onComplete={(id) => setTomatoes(prev => prev.filter(t => t !== id))} />
      ))}
    </div>
  );
}
