import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { translations, type Language } from '@/locales/translations';

const STORAGE_KEY = 'app-language';

export type Translate = (key: string) => string;

export interface LanguageContextValue {
  language: Language;
  changeLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translate;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ja';
}

/**
 * Resolve the initial language synchronously so the first paint already uses
 * the saved language. Reading it in an effect caused a visible flash and, more
 * importantly, left each component with its own independent language state.
 */
function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ja';

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // localStorage can be unavailable (private mode / storage disabled).
  }

  return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function translate(language: Language, key: string): string {
  const table = translations[language];
  return table[key] ?? translations.en[key] ?? key;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectInitialLanguage);

  // Keep <html lang> in sync for screen readers, spell checking and CSS.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = useCallback((next: Language) => {
    setLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures; the in-memory language still applies.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const next: Language = current === 'ja' ? 'en' : 'ja';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore persistence failures.
      }
      return next;
    });
  }, []);

  const t = useCallback<Translate>((key) => translate(language, key), [language]);

  const value = useMemo(
    () => ({ language, changeLanguage, toggleLanguage, t }),
    [language, changeLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
