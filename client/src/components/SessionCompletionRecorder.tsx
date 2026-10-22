import { useEffect } from 'react';

import { useSessionHistory } from '@/contexts/SessionHistoryContext';
import { useNotifications } from '@/hooks/useNotifications';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useSound } from '@/hooks/useSound';
import { readSelectedCategory } from '@/lib/study-category';
import type { SessionType } from '@/types/session';

/**
 * Records a finished session and plays the matching feedback.
 *
 * This used to live in `useHomeLogic`, which meant leaving the home screen (for
 * example to open Settings) unmounted the only listener: a timer that finished
 * while the settings screen was open silently lost its session. The recorder is
 * mounted once, directly under the providers, so it outlives navigation.
 */
export function SessionCompletionRecorder() {
  const history = useSessionHistory();
  const { registerSessionCompleteCallback } = usePomodoro();
  const sound = useSound();
  const notifications = useNotifications();

  useEffect(() => {
    registerSessionCompleteCallback((type: SessionType, duration: number) => {
      const category = readSelectedCategory();
      history.addSession(duration, type, undefined, undefined, category?.id, category?.name);

      if (type === 'pomodoro') {
        sound.playSessionCompleteSound();
        notifications.notifySessionComplete(type, duration);
      } else {
        sound.playBreakCompleteSound();
        notifications.notifyBreakComplete();
      }
    });
  }, [registerSessionCompleteCallback, history, sound, notifications]);

  return null;
}
