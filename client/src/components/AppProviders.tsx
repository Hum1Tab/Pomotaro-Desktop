import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SoundProvider } from '@/contexts/SoundContext';
import { WhiteNoiseProvider } from '@/contexts/WhiteNoiseContext';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { PomodoroProvider } from '@/contexts/PomodoroContext';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * アプリケーション全体のContext Providerを統合
 * App.tsxのネストを解消し、保守性を向上
 *
 * Language is the outermost provider: every screen (including error and update
 * notifications) must share one language state instead of keeping its own copy.
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <LanguageProvider>
            <ThemeProvider defaultTheme="light">
                <TooltipProvider>
                    <SoundProvider>
                        <WhiteNoiseProvider>
                            <AppearanceProvider>
                                <PomodoroProvider>
                                    {children}
                                </PomodoroProvider>
                            </AppearanceProvider>
                        </WhiteNoiseProvider>
                    </SoundProvider>
                </TooltipProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}
