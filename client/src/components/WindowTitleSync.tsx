import { useEffect } from 'react';

import { useLanguage } from '@/hooks/useLanguage';
import { usePomodoro } from '@/hooks/usePomodoro';

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Mirrors the remaining time into the native window title.
 *
 * The README promised title-bar progress in v1, but the Tauri rewrite never
 * wired it up. Updating it here keeps the information visible while the window
 * is in the background or the taskbar is the only thing on screen.
 */
export function WindowTitleSync() {
  const { timeLeft, isRunning, sessionType } = usePomodoro();
  const { t } = useLanguage();

  const label = t(sessionType === 'pomodoro' ? 'timer.focusBadge' : 'timer.breakBadge');
  const title = isRunning ? `${formatClock(timeLeft)} · ${label} — Pomotaro` : 'Pomotaro';

  useEffect(() => {
    document.title = title;
    const api = window.desktopAPI;
    if (api?.setWindowTitle) {
      void api.setWindowTitle(title).catch(() => {
        // The title is cosmetic; never surface an IPC failure to the user.
      });
    }
  }, [title]);

  return null;
}
