import { SessionTabs } from '@/components/SessionTabs';
import { TimerControls } from '@/components/TimerControls';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/ui/button';
import type { HomeLogic } from '@/hooks/useHomeLogic';
import { Minimize2, Settings, Waves } from 'lucide-react';

export function FocusTimer({ logic }: { logic: HomeLogic }) {
  const { pomodoro, goToSettings, toggleNoise, isNoisePlaying, setIsFocusMode, handleStartTimer, t } = logic;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-8 animate-in fade-in duration-300">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 sm:gap-12">
        <div className="scale-110 opacity-80 transition-opacity hover:opacity-100"><SessionTabs currentSession={pomodoro.sessionType} onSessionChange={pomodoro.switchSession} /></div>
        <TimerDisplay timeLeft={pomodoro.timeLeft} sessionType={pomodoro.sessionType} className="scale-110 sm:scale-125" />
        <div className="mt-8 flex flex-col items-center gap-12">
          <div className="origin-center scale-125 transform sm:scale-150"><TimerControls isRunning={pomodoro.isRunning} onStart={handleStartTimer} onPause={pomodoro.pause} onReset={pomodoro.reset} /></div>
          <div className="flex items-center gap-8 rounded-full border border-white/10 bg-white/5 p-2 px-6 backdrop-blur-md">
            <Button onClick={goToSettings} variant="ghost" size="icon" className="h-12 w-12 rounded-full text-muted-foreground hover:bg-muted/20 hover:text-foreground"><Settings className="h-6 w-6" /></Button>
            <div className="h-6 w-px bg-white/10" />
            <Button onClick={toggleNoise} variant="ghost" size="icon" title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')} className={`h-12 w-12 rounded-full text-muted-foreground hover:bg-muted/20 hover:text-foreground ${isNoisePlaying ? 'animate-pulse text-primary' : ''}`}><Waves className="h-6 w-6" /></Button>
            <div className="h-6 w-px bg-white/10" />
            <Button onClick={() => setIsFocusMode(false)} variant="ghost" size="icon" title={t('timer.exitFocusMode')} className="h-12 w-12 rounded-full text-muted-foreground hover:bg-muted/20 hover:text-foreground"><Minimize2 className="h-6 w-6" /></Button>
          </div>
        </div>
        <div className="mt-4 text-xl font-medium text-muted-foreground opacity-30 sm:text-2xl">{pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}</div>
      </div>
    </div>
  );
}
