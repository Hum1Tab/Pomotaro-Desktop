import { useState, useEffect } from 'react';
import { usePomodoro, SessionType } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import { useLocation } from 'wouter';
import { useSessionHistory } from "../hooks/useSessionHistory"; // Corrected Relative import
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useStudyCategories } from '@/hooks/useStudyCategories';
import { useSound } from '@/hooks/useSound';
import { useWhiteNoise } from '@/hooks/useWhiteNoise';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import { useAppearance } from '@/contexts/AppearanceContext'; // Added
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

import { TimerExtension } from '@/components/TimerExtension';
import { CategorySelector } from '@/components/CategorySelector';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { WeeklyChart } from '@/components/WeeklyChart';
import { ExamCountdown } from '@/components/ExamCountdown';
import { ExamManager } from '@/components/ExamManager';
import { FallingTomato } from '@/components/FallingTomato';

/**
 * Home Page - Pomotaro Main Application
 * 
 * Design Philosophy: Warm Minimalism
 * - Coral Red (#E8644A) for primary actions and focus time
 * - Sage Green (#8B9D83) for accents and break time
 * - Warm Beige (#F5E6D3) for backgrounds and highlights
 * - Soft shadows and smooth animations for depth
 */
import { useLanguage } from '@/hooks/useLanguage';

import { DigitalClock } from '@/components/DigitalClock';

export default function Home() {
  const [, setLocation] = useLocation();

  const pomodoro = usePomodoro();
  const tasks = useTasks();
  const history = useSessionHistory();
  const { selectedCategoryId, getSelectedCategory } = useStudyCategories();
  const sound = useSound();
  const { isPlaying: isNoisePlaying, toggle: toggleNoise } = useWhiteNoise();
  const notifications = useNotifications();
  const { theme, setLightTheme, setDarkTheme } = useTheme();
  const appearanceSettings_hook = useAppearance(); // Renamed to get the whole object
  const { settings: appearanceSettings } = appearanceSettings_hook;
  const { t, language, changeLanguage } = useLanguage();



  const [activeTab, setActiveTab] = useState('timer');
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [tomatoes, setTomatoes] = useState<number[]>([]);

  // Register session complete callback
  useEffect(() => {
    pomodoro.registerSessionCompleteCallback((type: SessionType, duration: number) => {
      const category = getSelectedCategory();
      history.addSession(
        duration,
        type,
        undefined,
        undefined,
        category?.id,
        category?.name
      );

      // Play sound and show notification
      if (type === 'pomodoro') {
        sound.playSessionCompleteSound();
        notifications.notifySessionComplete('学習セッション', duration);
        // Add visual reward
        setTomatoes(prev => [...prev, Date.now()]);
      } else {
        sound.playBreakCompleteSound();
        notifications.notifyBreakComplete();
      }
    });
  }, [pomodoro, history, sound, notifications]);

  // Handle Focus Mode Enter/Exit for Fullscreen
  useEffect(() => {
    if (window.electronAPI && window.electronAPI.toggleFullscreen) {
      window.electronAPI.toggleFullscreen(isFocusMode);
    }
  }, [isFocusMode]);

  // Handle Window Size Synchronization
  const prevCompactRef = useState(appearanceSettings.isCompact)[0];
  const [currentCompact, setCurrentCompact] = useState(appearanceSettings.isCompact);

  useEffect(() => {
    const syncSize = async () => {
      if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
        const maximized = await window.electronAPI.isMaximized();

        if (appearanceSettings.isCompact) {
          // Entering or staying in compact mode
          window.electronAPI.setWindowSize(300, 450);
          window.electronAPI.setAlwaysOnTop(true);
        } else if (currentCompact !== appearanceSettings.isCompact && !maximized) {
          // ONLY restore default size if we just EXITED compact mode
          window.electronAPI.setWindowSize(1200, 800);
          window.electronAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
        } else {
          // Just sync always on top without resizing
          window.electronAPI.setAlwaysOnTop(pomodoro.settings.alwaysOnTop);
        }
        setCurrentCompact(appearanceSettings.isCompact);
      }
    };
    syncSize();
  }, [appearanceSettings.isCompact, pomodoro.settings.alwaysOnTop]);





  // Ensure Focus Mode and Compact Mode are mutually exclusive
  useEffect(() => {
    if (isFocusMode && appearanceSettings.isCompact) {
      // Prioritize the most recently changed state
      // If we just entered focus mode, disable compact
      // If we just entered compact mode, disable focus
      // This is handled simply by checking which one is active and turning off the other
      // Note: In practical use, the user usually toggles one.
      // If both are true, we turn off compact mode to show the fullscreen overlay
      const { updateSettings: updateAppearance } = appearanceSettings_hook;
      updateAppearance({ isCompact: false });
    }
  }, [isFocusMode, appearanceSettings.isCompact]);

  // Listen for Native Window Events
  useEffect(() => {
    if (window.electronAPI?.onWindowStateChanged) {
      window.electronAPI.onWindowStateChanged((state: string) => {
        if (state === 'maximized') {
          // Force exit compact mode when window is maximized via OS
          const { updateSettings: updateAppearance } = appearanceSettings_hook;
          updateAppearance({ isCompact: false });
        }
      });
    }
  }, []); // Only register once

  // Trigger Tick Sound
  useEffect(() => {
    if (pomodoro.isRunning && pomodoro.timeLeft > 0 && sound.settings.playTickSound) {
      sound.playTickSound();
    }
  }, [pomodoro.timeLeft, pomodoro.isRunning, sound.settings.playTickSound, sound]);








  const handleAddTask = (title: string, estimatedPomodoros: number) => {
    tasks.addTask(title, estimatedPomodoros);
  };

  const handleStartTimer = () => {
    // alwaysAskCategoryがtrueの場合は毎回聞く
    // falseの場合は、selectedCategoryIdがない場合のみ聞く
    if (pomodoro.settings.alwaysAskCategory || !selectedCategoryId) {
      setShowCategoryDialog(true);
    } else {
      pomodoro.start();
    }
  };

  const handleCategoryConfirm = () => {
    pomodoro.start();
  };

  const activeTasks = tasks.getActiveTasks();

  useKeyboardShortcuts({
    startPause: () => {
      if (pomodoro.isRunning) {
        pomodoro.pause();
      } else {
        handleStartTimer();
      }
    },
    reset: () => pomodoro.reset(),
    toggleSettings: () => setLocation('/settings'),
  });

  const toggleCompactMode = async () => {
    const newCompactState = !appearanceSettings.isCompact;
    const { updateSettings: updateAppearance } = appearanceSettings_hook;
    updateAppearance({ isCompact: newCompactState });

    // If entering compact mode, ensure focus mode is off
    if (newCompactState && isFocusMode) {
      setIsFocusMode(false);
    }
  };






  const goToSettings = async () => {
    sound.playClickSound();
    if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
      const maximized = await window.electronAPI.isMaximized();
      if (!maximized) {
        await window.electronAPI.setWindowSize(1200, 800);
      }
      await window.electronAPI.setAlwaysOnTop(false);
    }
    setLocation('/settings');
  };




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


          {/* Main Tabs */}
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
                      if (theme === 'dark') {
                        setLightTheme();
                      } else {
                        setDarkTheme();
                      }
                    }}
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-all"
                    title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
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
              {/* Exam Countdown */}
              <ExamCountdown />

              {/* Timer Section */}
              {/* Timer Section */}
              <div className="relative flex flex-col items-center justify-center min-h-[60vh]">
                {/* Focus Mode Toggle (Top Right) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setIsFocusMode(true)}
                  title={t('timer.focusMode')}
                >
                  <Maximize2 className="w-6 h-6" />
                </Button>

                {/* Noise Toggle (Top Left) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={toggleNoise}
                  title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}
                >
                  <Waves className={`w-6 h-6 ${isNoisePlaying ? 'animate-pulse' : ''}`} />
                </Button>

                {/* Timer Display */}
                <div className="mb-12">
                  <TimerDisplay
                    timeLeft={pomodoro.timeLeft}
                    sessionType={pomodoro.sessionType}
                  />
                </div>

                {/* Timer Controls */}
                <div className="scale-125">
                  <TimerControls
                    isRunning={pomodoro.isRunning}
                    onStart={handleStartTimer}
                    onPause={pomodoro.pause}
                    onReset={pomodoro.reset}
                  />
                </div>

                {/* Session Info */}
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

            {/* Stopwatch Tab */}
            <TabsContent value="stopwatch" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <StopwatchMode />
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <CategorySelector />
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <StatsDashboard />
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
              <CalendarView />
            </TabsContent>



            <TabsContent value="tools" className="space-y-6">
              {/* Exam Date Manager */}
              <ExamManager />

              <div className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
                <ShortcutsDialog />

              </div>

              <div className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
                <WeeklyChart />
              </div>

              <div className="bg-card rounded-lg p-4 sm:p-8 shadow-warm">
                <h2 className="text-lg font-semibold text-foreground mb-6">{t('timer.extension')}</h2>
                <TimerExtension
                  onExtendTime={() => { }}
                  currentTimeLeft={pomodoro.timeLeft}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      )}

      {/* Compact Mode Layout */}
      {!isFocusMode && appearanceSettings.isCompact && (
        <main className="fixed inset-0 flex flex-col items-center justify-center p-4 animate-fade-in">
          {/* Mini Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
            <Button
              onClick={goToSettings}
              variant="ghost"
              size="icon"
              className="bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>


            <Button
              onClick={toggleNoise}
              variant="ghost"
              size="icon"
              className={`bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white ${isNoisePlaying ? 'animate-pulse text-white' : ''}`}
              title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')}
            >
              <Waves className="w-5 h-5" />
            </Button>

            <Button
              onClick={toggleCompactMode}
              variant="ghost"
              size="icon"
              className="bg-white/10 backdrop-blur-md rounded-full text-white/70 hover:text-white"
              title={t('settings.compactDisable')}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>

          </div>

          <div className="flex flex-col items-center gap-6">
            <TimerDisplay
              timeLeft={pomodoro.timeLeft}
              sessionType={pomodoro.sessionType}
            />

            <TimerControls
              isRunning={pomodoro.isRunning}
              onStart={handleStartTimer}
              onPause={pomodoro.pause}
              onReset={pomodoro.reset}
            />

            <div className="text-sm font-medium text-white/60 bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm">
              {pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}
            </div>
          </div>
        </main>
      )}


      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-muted-foreground hover:text-foreground w-12 h-12 rounded-full hover:bg-muted/20"
            onClick={() => setIsFocusMode(false)}
            title={t('timer.exitFocusMode')}
          >
            <Minimize2 className="w-8 h-8" />
          </Button>

          <div className="flex-1 flex flex-col items-center justify-center w-full gap-8 sm:gap-16">
            <TimerDisplay
              timeLeft={pomodoro.timeLeft}
              sessionType={pomodoro.sessionType}
              className="text-[25vw] sm:text-[20vw] font-bold leading-none select-none"
            />

            <div className="scale-125 sm:scale-150 transform origin-center">
              <TimerControls
                isRunning={pomodoro.isRunning}
                onStart={handleStartTimer}
                onPause={pomodoro.pause}
                onReset={pomodoro.reset}
              />
            </div>

            <div className="text-xl sm:text-2xl text-muted-foreground font-medium opacity-50">
              {pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}
            </div>
          </div>
        </div>
      )}

      {/* Category Selection Dialog */}
      <CategorySelectionDialog
        open={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        onConfirm={handleCategoryConfirm}
      />

      {/* Falling Tomatoes Animation */}
      {tomatoes.map(id => (
        <FallingTomato
          key={id}
          id={id}
          onComplete={(id) => setTomatoes(prev => prev.filter(t => t !== id))}
        />
      ))}
    </div>
  );
}
