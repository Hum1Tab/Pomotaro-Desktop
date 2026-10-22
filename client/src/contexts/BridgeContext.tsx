import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BridgeInfo } from '@shared/desktop-api';

const STORAGE_KEY = 'pomotaro-bridge-enabled';

interface BridgeContextValue {
  enabled: boolean;
  info: BridgeInfo | null;
  busy: boolean;
  error: string | null;
  setEnabled: (enabled: boolean) => Promise<void>;
}

const BridgeContext = createContext<BridgeContextValue | undefined>(undefined);

/**
 * Owns the opt-in local bridge used by AI agents.
 *
 * The preference is stored in localStorage and re-applied on every launch, so
 * the bridge only listens while the user has asked for it.
 */
export function BridgeProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<BridgeInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setEnabled = useCallback(async (enabled: boolean) => {
    const api = window.desktopAPI;
    if (!api?.setBridgeEnabled) {
      setError('The desktop bridge is only available in the Pomotaro app.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const nextInfo = await api.setBridgeEnabled(enabled);
      setInfo(nextInfo);
      try {
        localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
      } catch {
        // Persisting the preference is best-effort.
      }
    } catch (cause) {
      setInfo(null);
      setError(String(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const api = window.desktopAPI;
    if (!api?.setBridgeEnabled) return;

    let cancelled = false;
    const stored = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })();

    if (stored === 'true') {
      void setEnabled(true);
      return;
    }

    void api
      .getBridgeInfo()
      .then((current) => {
        if (!cancelled) setInfo(current);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [setEnabled]);

  const value = useMemo(
    () => ({ enabled: info !== null, info, busy, error, setEnabled }),
    [info, busy, error, setEnabled],
  );

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

export function useBridge(): BridgeContextValue {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context;
}
