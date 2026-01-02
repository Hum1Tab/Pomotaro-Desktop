import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Palette, Volume2, Clock, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

// Sub-components
import { SettingsGeneral } from '@/components/settings/SettingsGeneral';
import { SettingsTimer } from '@/components/settings/SettingsTimer';
import { SettingsAppearance } from '@/components/settings/SettingsAppearance';
import { SettingsSound } from '@/components/settings/SettingsSound';

export default function Settings() {
    const [, setLocation] = useLocation();
    const { t } = useLanguage();

    // Ensure settings page is large enough to be readable
    useEffect(() => {
        const syncSize = async () => {
            if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
                const maximized = await window.electronAPI.isMaximized();
                if (!maximized) {
                    // Check if current window is too small (e.g. from compact mode)
                }
                window.electronAPI.setAlwaysOnTop(false);
            }
        };
        syncSize();
    }, []);

    return (
        <div className="min-h-screen bg-background p-4 sm:p-8 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation('/')}
                        className="rounded-full hover:bg-muted"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
                </div>

                <Card className="p-6 glass-panel min-h-[500px]">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="general" className="gap-2"><Layout className="w-4 h-4" /> {t('settings.tab.general')}</TabsTrigger>
                            <TabsTrigger value="timer" className="gap-2"><Clock className="w-4 h-4" /> {t('settings.tab.timer')}</TabsTrigger>
                            <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4" /> {t('settings.tab.appearance')}</TabsTrigger>
                            <TabsTrigger value="sound" className="gap-2"><Volume2 className="w-4 h-4" /> {t('settings.tab.sound')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general">
                            <SettingsGeneral />
                        </TabsContent>

                        <TabsContent value="timer">
                            <SettingsTimer />
                        </TabsContent>

                        <TabsContent value="appearance">
                            <SettingsAppearance />
                        </TabsContent>

                        <TabsContent value="sound">
                            <SettingsSound />
                        </TabsContent>
                    </Tabs>

                    {/* Footer Actions */}
                    <div className="flex justify-between pt-6 mt-6 border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                            {/* Auto-saving indicator could go here if needed */}
                        </div>
                        <Button onClick={() => setLocation('/')} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                            <ArrowLeft className="w-5 h-5" />
                            {t('settings.back')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
