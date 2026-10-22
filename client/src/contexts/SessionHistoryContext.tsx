import { createContext, useContext, type ReactNode } from 'react';

import { useSessionHistoryState, type SessionHistoryApi } from '@/hooks/useSessionHistory';

const SessionHistoryContext = createContext<SessionHistoryApi | undefined>(undefined);

/**
 * One session history for the whole app.
 *
 * Previously every screen created its own `useSessionHistory()` state. That
 * meant the stats screen did not see a session recorded by the home screen
 * until it remounted, and a session finishing while Home was unmounted (for
 * example on the Settings screen) was dropped entirely.
 */
export function SessionHistoryProvider({ children }: { children: ReactNode }) {
  const value = useSessionHistoryState();
  return <SessionHistoryContext.Provider value={value}>{children}</SessionHistoryContext.Provider>;
}

export function useSessionHistory(): SessionHistoryApi {
  const context = useContext(SessionHistoryContext);
  if (!context) {
    throw new Error('useSessionHistory must be used within a SessionHistoryProvider');
  }
  return context;
}
