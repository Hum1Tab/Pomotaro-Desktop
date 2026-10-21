import { SessionTabs } from '@/components/SessionTabs';
import { TimerControls } from '@/components/TimerControls';
import { TimerDisplay } from '@/components/TimerDisplay';
import { Button } from '@/components/ui/button';
import type { HomeLogic } from '@/hooks/useHomeLogic';
import type { CSSProperties } from 'react';
import { Maximize2, Settings, Waves } from 'lucide-react';

const draggable = { WebkitAppRegion: 'drag' } as CSSProperties;
const notDraggable = { WebkitAppRegion: 'no-drag' } as CSSProperties;

export function CompactTimer({ logic }: { logic: HomeLogic }) {
  const { pomodoro, goToSettings, toggleNoise, isNoisePlaying, toggleCompactMode, handleStartTimer, t } = logic;
  return (
    <main className="fixed inset-0 flex select-none flex-col items-center justify-between p-6 animate-fade-in">
      <div className="absolute inset-0 z-0" style={draggable} />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-2">
        <div className="pointer-events-auto scale-90 opacity-90 transition-opacity hover:opacity-100" style={notDraggable}><SessionTabs currentSession={pomodoro.sessionType} onSessionChange={pomodoro.switchSession} /></div>
        <div className="flex flex-1 items-center justify-center py-4"><TimerDisplay timeLeft={pomodoro.timeLeft} sessionType={pomodoro.sessionType} /></div>
        <div className="flex w-full flex-col items-center gap-4" style={notDraggable}>
          <div className="pointer-events-auto"><TimerControls isRunning={pomodoro.isRunning} onStart={handleStartTimer} onPause={pomodoro.pause} onReset={pomodoro.reset} /></div>
          <div className="flex w-full items-center justify-between gap-2 px-2">
            <Button onClick={goToSettings} variant="ghost" size="icon" className="pointer-events-auto h-8 w-8 rounded-full bg-white/10 text-white/70 backdrop-blur-md hover:text-white"><Settings className="h-3.5 w-3.5" /></Button>
            <div className="flex-1 text-center"><span className="inline-block whitespace-nowrap rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/60 backdrop-blur-sm">{pomodoro.sessionType === 'pomodoro' ? t('timer.focusTime') : t('timer.breakTime')}</span></div>
            <div className="flex gap-1.5">
              <Button onClick={toggleNoise} variant="ghost" size="icon" title={isNoisePlaying ? t('timer.stopNoise') : t('timer.playNoise')} className={`pointer-events-auto h-8 w-8 rounded-full bg-white/10 text-white/70 backdrop-blur-md hover:text-white ${isNoisePlaying ? 'animate-pulse text-white' : ''}`}><Waves className="h-3.5 w-3.5" /></Button>
              <Button onClick={toggleCompactMode} variant="ghost" size="icon" title={t('settings.compactDisable')} className="pointer-events-auto h-8 w-8 rounded-full bg-white/10 text-white/70 backdrop-blur-md hover:text-white"><Maximize2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
