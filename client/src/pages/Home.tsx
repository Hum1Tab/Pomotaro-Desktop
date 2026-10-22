import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { DigitalClock } from '@/components/DigitalClock';
import { FallingTomato } from '@/components/FallingTomato';
import { CompactTimer } from '@/components/home/CompactTimer';
import { DesktopHome } from '@/components/home/DesktopHome';
import { FocusTimer } from '@/components/home/FocusTimer';
import { useHomeLogic } from '@/hooks/useHomeLogic';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function Home() {
  const logic = useHomeLogic();
  const { pomodoro, handleStartTimer, goToSettings, isFocusMode, appearanceSettings, showCategoryDialog, setShowCategoryDialog, handleCategoryConfirm, tomatoes, setTomatoes, nextSession, prevSession } = logic;

  useKeyboardShortcuts({
    startPause: () => pomodoro.isRunning ? pomodoro.pause() : handleStartTimer(),
    reset: () => pomodoro.reset(),
    nextSession,
    prevSession,
    toggleSettings: goToSettings,
  });

  return (
    <div className="relative min-h-screen transition-colors duration-500">
      {!isFocusMode && <div className="absolute left-6 top-6 z-10 hidden opacity-80 transition-opacity hover:opacity-100 sm:block"><DigitalClock /></div>}
      {!isFocusMode && !appearanceSettings.isCompact && <DesktopHome logic={logic} />}
      {!isFocusMode && appearanceSettings.isCompact && <CompactTimer logic={logic} />}
      {isFocusMode && <FocusTimer logic={logic} />}
      <CategorySelectionDialog open={showCategoryDialog} onClose={() => setShowCategoryDialog(false)} onConfirm={handleCategoryConfirm} />
      {tomatoes.map((id) => <FallingTomato key={id} id={id} onComplete={(completedId) => setTomatoes((current) => current.filter((id) => id !== completedId))} />)}
    </div>
  );
}
