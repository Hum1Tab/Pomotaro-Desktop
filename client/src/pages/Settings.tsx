import { useLocation } from 'wouter';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useSoundContext } from '@/contexts/SoundContext';
import { useAppearance, THEME_PRESETS, PresetTheme, BackgroundType } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Palette, Image as ImageIcon, Video, Link, Volume2, Clock,
    Layout, Maximize2, Minimize2, ChevronLeft, ArrowLeft, Upload, Download, Heart,
    Plus, Minus, Coffee, Pencil
} from 'lucide-react';


import { useEffect, useState } from 'react';

export default function Settings() {
    const [, setLocation] = useLocation();
    const { settings: pomoSettings, updateSettings: updatePomoSettings } = usePomodoro();
    const { settings: soundSettings, updateSettings: updateSoundSettings } = useSoundContext();
    const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();
    const { language, changeLanguage, t } = useLanguage();

    // Auto Launch State
    const [isAutoLaunch, setIsAutoLaunch] = useState(false);
    // Manual Update Check State
    const [updateCheckStatus, setUpdateCheckStatus] = useState<'idle' | 'checking'>('idle');
    const [updateCheckMessage, setUpdateCheckMessage] = useState<string | null>(null);

    useEffect(() => {
        if (window.electronAPI?.getAutoLaunch) {
            window.electronAPI.getAutoLaunch().then(setIsAutoLaunch);
        }
    }, []);

    const toggleAutoLaunch = async (checked: boolean) => {
        setIsAutoLaunch(checked);
        if (window.electronAPI?.setAutoLaunch) {
            await window.electronAPI.setAutoLaunch(checked);
        }
    };

    const toggleCompactMode = async () => {
        const newCompactState = !appearanceSettings.isCompact;
        updateAppearance({ isCompact: newCompactState });

        if (newCompactState) {
            setLocation('/'); // Redirect to Home immediately to avoid "ugly" settings view
        }
    };


    // Ensure settings page is large enough to be readable
    useEffect(() => {
        const syncSize = async () => {
            if (window.electronAPI?.setWindowSize && window.electronAPI.isMaximized) {
                const maximized = await window.electronAPI.isMaximized();
                if (!maximized) {
                    // Check if current window is too small (e.g. from compact mode)
                    // We don't have a direct "getWindowSize" but we can assume if we are not maximized
                    // and we just came from Home, we might need a reset.
                    // To be safe and respect manual resize, we only resize if it's likely we were compact.
                    // Actually, a simpler way is to just NOT force 1200x800 here unless we know we were compact.
                    // Since Settings page is only accessible from Home, and Home handles its own compact state,
                    // we can rely on the fact that goToSettings in Home.tsx already handles the resize if needed.
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

                        {/* General Tab */}
                        <TabsContent value="general" className="space-y-6 animate-fade-in">
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium">{t('settings.section.display')}</h3>

                                {/* Language */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.language')}</label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={language === 'en' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => changeLanguage('en')}
                                        >
                                            English
                                        </Button>
                                        <Button
                                            variant={language === 'ja' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => changeLanguage('ja')}
                                        >
                                            日本語
                                        </Button>
                                    </div>
                                </div>

                                {/* Compact Mode */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium">{t('settings.compactMode')}</label>
                                        <p className="text-xs text-muted-foreground">{t('settings.compactModeDesc')}</p>
                                    </div>
                                    <Button
                                        variant={appearanceSettings.isCompact ? "default" : "outline"}
                                        onClick={toggleCompactMode}
                                        className="gap-2"
                                    >
                                        {appearanceSettings.isCompact ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        {appearanceSettings.isCompact ? t('settings.compactActive') : t('settings.compactEnable')}
                                    </Button>
                                </div>

                                {/* Always on Top (Standard) */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.alwaysOnTop')}</label>
                                    <Switch
                                        checked={pomoSettings.alwaysOnTop}
                                        onCheckedChange={(checked) => {
                                            updatePomoSettings({ ...pomoSettings, alwaysOnTop: checked });
                                            window.electronAPI?.setAlwaysOnTop(checked);
                                        }}
                                    />
                                </div>

                                {/* Auto Launch */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.autoLaunch') || 'スタートアップ起動'}</label>
                                    <Switch
                                        checked={isAutoLaunch}
                                        onCheckedChange={toggleAutoLaunch}
                                    />
                                </div>

                                {/* Prevent Sleep */}
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.preventSleep') || 'スリープ抑制'}</label>
                                    <Switch
                                        checked={pomoSettings.preventSleep}
                                        onCheckedChange={(checked) => {
                                            updatePomoSettings({ ...pomoSettings, preventSleep: checked });
                                        }}
                                    />
                                </div>

                                {/* Discord Settings */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <h3 className="text-lg font-medium">Discord 設定</h3>

                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Discord 連携を有効にする</label>
                                        <Switch
                                            checked={pomoSettings.enableDiscordRpc}
                                            onCheckedChange={(checked) => {
                                                updatePomoSettings({ ...pomoSettings, enableDiscordRpc: checked });
                                            }}
                                        />
                                    </div>

                                    {pomoSettings.enableDiscordRpc && (
                                        <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <label className="text-sm font-medium">カテゴリーを表示</label>
                                                    <p className="text-xs text-muted-foreground">ステータスに現在のカテゴリー名を表示します</p>
                                                </div>
                                                <Switch
                                                    checked={pomoSettings.showCategoryOnRpc}
                                                    onCheckedChange={(checked) => {
                                                        updatePomoSettings({ ...pomoSettings, showCategoryOnRpc: checked });
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <label className="text-sm font-medium">ポモドーロ数を表示</label>
                                                    <p className="text-xs text-muted-foreground">完了したポモドーロ数を表示します</p>
                                                </div>
                                                <Switch
                                                    checked={pomoSettings.showPomodorosOnRpc}
                                                    onCheckedChange={(checked) => {
                                                        updatePomoSettings({ ...pomoSettings, showPomodorosOnRpc: checked });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Data Features */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <h3 className="text-lg font-medium">{t('settings.section.data')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                            onClick={() => {
                                                const sessions = localStorage.getItem('pomotaro-sessions');
                                                const tasks = localStorage.getItem('pomodoroTasks');

                                                const data = {
                                                    pomodoroSettings: pomoSettings,
                                                    soundSettings: soundSettings,
                                                    appearanceSettings: appearanceSettings,
                                                    sessionHistory: sessions ? JSON.parse(sessions) : [],
                                                    tasks: tasks ? JSON.parse(tasks) : [],
                                                    sessionsCompleted: localStorage.getItem('sessionsCompleted') || '0',
                                                    timestamp: new Date().toISOString()
                                                };
                                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `pomotaro-backup-${new Date().toISOString().split('T')[0]}.json`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                        >
                                            <Download className="w-4 h-4" /> {t('settings.export')}
                                        </Button>
                                        <Button variant="outline" className="w-full gap-2 relative">
                                            <Upload className="w-4 h-4" /> {t('settings.import')}
                                            <input
                                                type="file"
                                                accept=".json"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            try {
                                                                const data = JSON.parse(event.target?.result as string);
                                                                if (data.pomodoroSettings) updatePomoSettings(data.pomodoroSettings);
                                                                if (data.soundSettings) updateSoundSettings(data.soundSettings);
                                                                if (data.appearanceSettings) updateAppearance(data.appearanceSettings);

                                                                // Import history and tasks
                                                                if (data.sessionHistory) {
                                                                    localStorage.setItem('pomotaro-sessions', JSON.stringify(data.sessionHistory));
                                                                }
                                                                if (data.tasks) {
                                                                    localStorage.setItem('pomodoroTasks', JSON.stringify(data.tasks));
                                                                }
                                                                if (data.sessionsCompleted) {
                                                                    localStorage.setItem('sessionsCompleted', data.sessionsCompleted);
                                                                }

                                                                alert(t('settings.importSuccess'));
                                                                // Reload to reflect data changes (Tasks, History)
                                                                window.location.reload();
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert(t('settings.importError'));
                                                            }
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                }}
                                            />
                                        </Button>
                                    </div>
                                </div>

                                {/* Support Section */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <h3 className="text-lg font-medium">{t('settings.section.support')}</h3>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30 border-pink-200 dark:border-pink-900"
                                        onClick={() => window.electronAPI ? window.electronAPI.openExternal('https://github.com/sponsors/Hum1Tab') : window.open('https://github.com/sponsors/Hum1Tab', '_blank')}
                                    >
                                        <Heart className="w-4 h-4 fill-current" /> {t('settings.support.github')}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">{t('settings.support.desc')}</p>
                                </div>

                                {/* Update Section */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <h3 className="text-lg font-medium">アップデート</h3>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        disabled={updateCheckStatus === 'checking'}
                                        onClick={async () => {
                                            if (window.electronAPI?.checkForUpdates) {
                                                setUpdateCheckStatus('checking');
                                                setUpdateCheckMessage(null);
                                                try {
                                                    const result = await window.electronAPI.checkForUpdates() as any;
                                                    // console.log('Update Check Result:', result);

                                                    // checkForUpdatesAndNotify returns UpdateCheckResult | null.
                                                    // If null, no update info available (update-not-available or error, but error usually throws).
                                                    // Actually, if no update is available, result might be null OR result.updateInfo exists but version is same?
                                                    // Let's rely on valid result.

                                                    if (result && result.updateInfo) {
                                                        // Check if the version is actually newer?
                                                        // autoUpdater usually handles this.
                                                        // If we got here, it means check completed.
                                                        // If an update IS available, 'update-available' event fires and main.ts sends 'update-status'.
                                                        // Ideally we want to know if "Nothing found".
                                                        // But result contains updateInfo even if no update is available (in some versions).
                                                        // Actually, standard behavior: result is returned.
                                                        // We can assume if no 'update-available' event fired (or we rely on result), we can show 'Up to date'.
                                                        // But 'update-available' is async.
                                                        // Let's simply show "最新です" if result is returned and we are not downloading?
                                                        // A safer way: catch 'update-not-available' if we could, but we don't have that listener exposed yet.
                                                        // Main process doesn't send 'update-not-available'. 
                                                        // BUT, `checkForUpdates` returns the result. 
                                                        // If result.updateInfo.version == current version => Up to date.

                                                        // Simplification: just wait for the promise. If it resolves and we didn't get an "Update found" event...
                                                        // But how do we know?

                                                        // Re-reading electron-updater docs:
                                                        // result.downloadPromise is present if update is available and autoDownload is true.
                                                        // OR we can check versions.

                                                        // For now, let's try to assume if promise resolves, we are good.
                                                        // If it was available, the other listener shows "Downloading...".
                                                        // We can show "最新です" if we don't see that.
                                                        // However, keeping it simple:
                                                        // If result is valid, we can say "Check complete".
                                                        // Let's try to inspect result version vs package version?
                                                        // Too complex to pass package version here reliably without importing.

                                                        // Let's use a simpler heuristic:
                                                        // If update is available, `autoUpdater` kicks in.
                                                        // If we want to show "Up to date", we can just show it after await, temporarily, unless "Downloading" takes over.
                                                        setUpdateCheckStatus('idle');
                                                        // We'll show a temporary "Up to date" message if no update event came in? 
                                                        // Actually, let's just show "最新のバージョンです" if we assume so.
                                                        // This might clash if update IS available.

                                                        // Better approach:
                                                        // Modify main.ts to explicitly return whether update was found?
                                                        // main.ts returns `autoUpdater.checkForUpdatesAndNotify()`.
                                                        // If update available, it returns result. If not, it returns result (with update info).
                                                        // We can check `result.updateInfo.version`.
                                                        // But we need current version.

                                                        // Let's simply show the result version?
                                                        // or "最新です (vX.X.X)".

                                                        setUpdateCheckMessage(`チェック完了: v${result.updateInfo.version}`);

                                                    } else {
                                                        setUpdateCheckStatus('idle');
                                                        setUpdateCheckMessage('最新です');
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    setUpdateCheckStatus('idle');
                                                    setUpdateCheckMessage('エラーが発生しました');
                                                }
                                            }
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                        {updateCheckStatus === 'checking' ? '確認中...' : 'アップデートを確認'}
                                    </Button>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-xs text-muted-foreground text-center">v1.1.18</p>
                                        {updateCheckMessage && (
                                            <p className="text-xs text-primary font-medium animate-fade-in">
                                                {updateCheckMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Timer Tab */}
                        <TabsContent value="timer" className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Pomodoro */}
                                <div className="group relative p-6 rounded-3xl bg-secondary/10 border border-border/50 hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                        <Pencil className="w-4 h-4" />
                                        <span className="font-medium text-sm tracking-wide">{t('settings.pomodoro')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, pomodoroTime: Math.max(1, pomoSettings.pomodoroTime - 1) })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <div className="flex flex-col items-center w-24">
                                            <Input
                                                type="number"
                                                value={pomoSettings.pomodoroTime}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        updatePomoSettings({ ...pomoSettings, pomodoroTime: Math.max(1, val) });
                                                    }
                                                }}
                                                className="text-5xl font-bold font-mono leading-none h-auto py-2 px-0 text-center w-full bg-transparent border-none shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">{t('common.minutes')}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, pomodoroTime: pomoSettings.pomodoroTime + 1 })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Short Break */}
                                <div className="group relative p-6 rounded-3xl bg-secondary/10 border border-border/50 hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                        <Coffee className="w-4 h-4" />
                                        <span className="font-medium text-sm tracking-wide">{t('settings.shortBreak')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, shortBreakTime: Math.max(1, pomoSettings.shortBreakTime - 1) })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <div className="flex flex-col items-center w-24">
                                            <Input
                                                type="number"
                                                value={pomoSettings.shortBreakTime}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        updatePomoSettings({ ...pomoSettings, shortBreakTime: Math.max(1, val) });
                                                    }
                                                }}
                                                className="text-5xl font-bold font-mono leading-none h-auto py-2 px-0 text-center w-full bg-transparent border-none shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">{t('common.minutes')}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, shortBreakTime: pomoSettings.shortBreakTime + 1 })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Long Break */}
                                <div className="group relative p-6 rounded-3xl bg-secondary/10 border border-border/50 hover:border-primary/50 hover:bg-secondary/20 transition-all duration-300 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-medium text-sm tracking-wide">{t('settings.longBreak')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, longBreakTime: Math.max(1, pomoSettings.longBreakTime - 1) })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <div className="flex flex-col items-center w-24">
                                            <Input
                                                type="number"
                                                value={pomoSettings.longBreakTime}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) {
                                                        updatePomoSettings({ ...pomoSettings, longBreakTime: Math.max(1, val) });
                                                    }
                                                }}
                                                className="text-5xl font-bold font-mono leading-none h-auto py-2 px-0 text-center w-full bg-transparent border-none shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wider">{t('common.minutes')}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updatePomoSettings({ ...pomoSettings, longBreakTime: pomoSettings.longBreakTime + 1 })}
                                            className="h-10 w-10 rounded-full bg-background/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.autoStartBreaks')}</label>
                                    <Switch
                                        checked={pomoSettings.autoStartBreaks}
                                        onCheckedChange={(checked) => updatePomoSettings({ ...pomoSettings, autoStartBreaks: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.autoStartPomodoros')}</label>
                                    <Switch
                                        checked={pomoSettings.autoStartPomodoros}
                                        onCheckedChange={(checked) => updatePomoSettings({ ...pomoSettings, autoStartPomodoros: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.showEstimatedFinishTime')}</label>
                                    <Switch
                                        checked={pomoSettings.showEstimatedFinishTime}
                                        onCheckedChange={(checked) => updatePomoSettings({ ...pomoSettings, showEstimatedFinishTime: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.showTaskInput')}</label>
                                    <Switch
                                        checked={pomoSettings.showTaskInput}
                                        onCheckedChange={(checked) => updatePomoSettings({ ...pomoSettings, showTaskInput: checked })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Appearance Tab */}
                        <TabsContent value="appearance" className="space-y-6 animate-fade-in">
                            <div className="space-y-6">
                                {/* Theme Presets */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground">{t('settings.themeColor')}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {(Object.keys(THEME_PRESETS) as PresetTheme[]).map((themeKey) => {
                                            if (themeKey === 'custom') return null;
                                            const preset = THEME_PRESETS[themeKey];
                                            const isSelected = appearanceSettings.backgroundTheme === themeKey;

                                            return (
                                                <button
                                                    key={themeKey}
                                                    onClick={() => {
                                                        updateAppearance({
                                                            backgroundType: 'gradient',
                                                            backgroundTheme: themeKey,
                                                            gradientColors: preset.colors
                                                        });
                                                    }}
                                                    className={`
                                                        relative flex items-center gap-3 p-3 rounded-xl border transition-all overflow-hidden
                                                        ${isSelected
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                            : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                                                    `}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full shadow-sm"
                                                        style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }}
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {t(`settings.theme.${themeKey}`) === `settings.theme.${themeKey}`
                                                            ? preset.name
                                                            : t(`settings.theme.${themeKey}`)}
                                                    </span>
                                                </button>
                                            )
                                        })}

                                        {/* Custom Option */}
                                        <button
                                            onClick={() => {
                                                updateAppearance({
                                                    backgroundType: 'gradient',
                                                    backgroundTheme: 'custom'
                                                });
                                            }}
                                            className={`
                                                relative flex items-center gap-3 p-3 rounded-xl border transition-all overflow-hidden
                                                ${appearanceSettings.backgroundTheme === 'custom'
                                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                                            `}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 shadow-sm flex items-center justify-center">
                                                <Palette className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium">{t('settings.theme.custom')}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Detailed Gradient Controls (Only if Custom) */}
                                {appearanceSettings.backgroundTheme === 'custom' && appearanceSettings.backgroundType === 'gradient' && (
                                    <div className="space-y-3 pt-4 border-t border-border/50 animate-fade-in">
                                        <label className="text-sm font-medium text-foreground">{t('settings.customGradient')}</label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={appearanceSettings.gradientColors[0]}
                                                    onChange={(e) => {
                                                        const newColors = [...appearanceSettings.gradientColors] as [string, string];
                                                        newColors[0] = e.target.value;
                                                        updateAppearance({ gradientColors: newColors });
                                                    }}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-xs font-mono">{appearanceSettings.gradientColors[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={appearanceSettings.gradientColors[1]}
                                                    onChange={(e) => {
                                                        const newColors = [...appearanceSettings.gradientColors] as [string, string];
                                                        newColors[1] = e.target.value;
                                                        updateAppearance({ gradientColors: newColors });
                                                    }}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-xs font-mono">{appearanceSettings.gradientColors[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Background Type Toggle (Image/Video) */}
                                <div className="space-y-3 pt-6 border-t border-border/50">
                                    <label className="text-sm font-medium text-foreground">{t('settings.section.media')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['gradient', 'image', 'video'] as BackgroundType[]).map((type) => (
                                            <Button
                                                key={type}
                                                variant={appearanceSettings.backgroundType === type ? 'default' : 'outline'}
                                                onClick={() => updateAppearance({ backgroundType: type })}
                                                className="gap-2"
                                            >
                                                {type === 'gradient' && <Palette className="w-4 h-4" />}
                                                {type === 'image' && <ImageIcon className="w-4 h-4" />}
                                                {type === 'video' && <Video className="w-4 h-4" />}
                                                {t(`settings.bg.${type}`)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Media URL & Opacity */}
                                {(appearanceSettings.backgroundType === 'image' || appearanceSettings.backgroundType === 'video') && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('settings.mediaUrl')}</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={appearanceSettings.mediaUrl}
                                                        onChange={(e) => updateAppearance({ mediaUrl: e.target.value })}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium">{t('settings.overlayOpacity')}</label>
                                                <span className="text-sm text-muted-foreground">{Math.round(appearanceSettings.bgOpacity * 100)}%</span>
                                            </div>
                                            <Slider
                                                value={[appearanceSettings.bgOpacity]}
                                                onValueChange={(val) => updateAppearance({ bgOpacity: val[0] })}
                                                max={1}
                                                step={0.1}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Sound Tab */}
                        <TabsContent value="sound" className="space-y-6 animate-fade-in">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.soundVolume')}</label>
                                        <span className="text-sm text-muted-foreground">{Math.round(soundSettings.volume * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[soundSettings.volume]}
                                        onValueChange={(val) => updateSoundSettings({ volume: val[0] })}
                                        max={1}
                                        step={0.01}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.whiteNoiseVolume')}</label>
                                        <span className="text-sm text-muted-foreground">{Math.round(soundSettings.whiteNoiseVolume * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[soundSettings.whiteNoiseVolume]}
                                        onValueChange={(val) => updateSoundSettings({ whiteNoiseVolume: val[0] })}
                                        max={1}
                                        step={0.01}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['white', 'pink', 'brown'] as const).map(type => (
                                            <Button
                                                key={type}
                                                variant={soundSettings.noiseType === type ? 'default' : 'outline'}
                                                onClick={() => updateSoundSettings({ noiseType: type })}
                                                size="sm"
                                            >
                                                {t(`settings.noise.${type}`)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.tickSound')}</label>
                                        <Switch
                                            checked={soundSettings.playTickSound}
                                            onCheckedChange={(checked) => updateSoundSettings({ playTickSound: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.notificationSound')}</label>
                                        <Switch
                                            checked={soundSettings.playNotificationSound}
                                            onCheckedChange={(checked) => updateSoundSettings({ playNotificationSound: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
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
