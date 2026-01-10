import { ReactNode } from 'react';
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
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
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
    );
}
