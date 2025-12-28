import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePomodoro, PomodoroSettings } from '@/hooks/usePomodoro';
import { useSoundContext, SoundSettings } from '@/contexts/SoundContext';
import { useAppearance, AppearanceSettings, THEME_PRESETS, PresetTheme } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Palette, Image as ImageIcon, Video, Link, Volume2, Clock,
    Layout, Maximize2, Minimize2, ChevronLeft, Save, Upload, Download
} from 'lucide-react';

export default function Settings() {
    const [, setLocation] = useLocation();
    const { settings, updateSettings } = usePomodoro();
    const sound = useSoundContext();
    const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();
    const { language, changeLanguage, t } = useLanguage();
    const { requestPermission } = useNotifications();

    // Local state for immediate feedback
    const [tempPomoSettings, setTempPomoSettings] = useState<PomodoroSettings>(settings);
    const [tempSoundSettings, setTempSoundSettings] = useState<SoundSettings>(sound.settings);
    const [tempAppearanceSettings, setTempAppearanceSettings] = useState<AppearanceSettings>(appearanceSettings);



    useEffect(() => {
        setTempPomoSettings(settings);
    }, [settings]);

    useEffect(() => {
        setTempSoundSettings(sound.settings);
    }, [sound.settings]);

    useEffect(() => {
        setTempAppearanceSettings(appearanceSettings);
    }, [appearanceSettings]);

    const handleSave = () => {
        updateSettings(tempPomoSettings);
        sound.updateSettings(tempSoundSettings);
        updateAppearance(tempAppearanceSettings);
        setLocation('/');
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
                                        checked={tempPomoSettings.alwaysOnTop}
                                        onCheckedChange={(checked) => {
                                            setTempPomoSettings({ ...tempPomoSettings, alwaysOnTop: checked });
                                            window.electronAPI?.setAlwaysOnTop(checked);
                                        }}
                                    />
                                </div>

                                {/* Data Features */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <h3 className="text-lg font-medium">{t('settings.section.data')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                            onClick={() => {
                                                const data = {
                                                    pomodoroSettings: tempPomoSettings,
                                                    soundSettings: tempSoundSettings,
                                                    appearanceSettings: tempAppearanceSettings,
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
                                                                if (data.pomodoroSettings) setTempPomoSettings(data.pomodoroSettings);
                                                                if (data.soundSettings) setTempSoundSettings(data.soundSettings);
                                                                if (data.appearanceSettings) {
                                                                    setTempAppearanceSettings(data.appearanceSettings);
                                                                    updateAppearance(data.appearanceSettings); // Instant preview on import
                                                                }
                                                                alert(t('settings.importSuccess'));
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
                            </div>
                        </TabsContent>

                        {/* Timer Tab */}
                        <TabsContent value="timer" className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">{t('settings.pomodoro')}</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={tempPomoSettings.pomodoroTime}
                                            onChange={(e) => setTempPomoSettings({ ...tempPomoSettings, pomodoroTime: Number(e.target.value) })}
                                            className="font-mono text-lg"
                                        />
                                        <span className="text-sm text-muted-foreground">{t('common.minutes')}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">{t('settings.shortBreak')}</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={tempPomoSettings.shortBreakTime}
                                            onChange={(e) => setTempPomoSettings({ ...tempPomoSettings, shortBreakTime: Number(e.target.value) })}
                                            className="font-mono text-lg"
                                        />
                                        <span className="text-sm text-muted-foreground">{t('common.minutes')}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">{t('settings.longBreak')}</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={tempPomoSettings.longBreakTime}
                                            onChange={(e) => setTempPomoSettings({ ...tempPomoSettings, longBreakTime: Number(e.target.value) })}
                                            className="font-mono text-lg"
                                        />
                                        <span className="text-sm text-muted-foreground">{t('common.minutes')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.autoStartBreaks')}</label>
                                    <Switch
                                        checked={tempPomoSettings.autoStartBreaks}
                                        onCheckedChange={(checked) => setTempPomoSettings({ ...tempPomoSettings, autoStartBreaks: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.autoStartPomodoros')}</label>
                                    <Switch
                                        checked={tempPomoSettings.autoStartPomodoros}
                                        onCheckedChange={(checked) => setTempPomoSettings({ ...tempPomoSettings, autoStartPomodoros: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.showEstimatedFinishTime')}</label>
                                    <Switch
                                        checked={tempPomoSettings.showEstimatedFinishTime}
                                        onCheckedChange={(checked) => setTempPomoSettings({ ...tempPomoSettings, showEstimatedFinishTime: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">{t('settings.showTaskInput')}</label>
                                    <Switch
                                        checked={tempPomoSettings.showTaskInput}
                                        onCheckedChange={(checked) => setTempPomoSettings({ ...tempPomoSettings, showTaskInput: checked })}
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
                                            const isSelected = tempAppearanceSettings.backgroundTheme === themeKey;

                                            return (
                                                <button
                                                    key={themeKey}
                                                    onClick={() => {
                                                        const newSettings: AppearanceSettings = {
                                                            ...tempAppearanceSettings,
                                                            backgroundType: 'gradient',
                                                            backgroundTheme: themeKey,
                                                            gradientColors: preset.colors
                                                        };
                                                        setTempAppearanceSettings(newSettings);
                                                        updateAppearance(newSettings); // Instant Preview
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
                                                    <span className="text-sm font-medium">{t(`settings.theme.${themeKey}`)}</span>
                                                </button>
                                            )
                                        })}

                                        {/* Custom Option */}
                                        <button
                                            onClick={() => {
                                                const newSettings: AppearanceSettings = {
                                                    ...tempAppearanceSettings,
                                                    backgroundType: 'gradient',
                                                    backgroundTheme: 'custom'
                                                };
                                                setTempAppearanceSettings(newSettings);
                                                updateAppearance(newSettings); // Instant Preview
                                            }}
                                            className={`
                                                relative flex items-center gap-3 p-3 rounded-xl border transition-all overflow-hidden
                                                ${tempAppearanceSettings.backgroundTheme === 'custom'
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
                                {tempAppearanceSettings.backgroundTheme === 'custom' && tempAppearanceSettings.backgroundType === 'gradient' && (
                                    <div className="space-y-3 pt-4 border-t border-border/50 animate-fade-in">
                                        <label className="text-sm font-medium text-foreground">{t('settings.customGradient')}</label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[0]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[0] = e.target.value;
                                                        const newSettings = { ...tempAppearanceSettings, gradientColors: newColors };
                                                        setTempAppearanceSettings(newSettings);
                                                        updateAppearance(newSettings); // Instant Preview
                                                    }}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-xs font-mono">{tempAppearanceSettings.gradientColors[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[1]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[1] = e.target.value;
                                                        const newSettings = { ...tempAppearanceSettings, gradientColors: newColors };
                                                        setTempAppearanceSettings(newSettings);
                                                        updateAppearance(newSettings); // Instant Preview
                                                    }}
                                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-xs font-mono">{tempAppearanceSettings.gradientColors[1]}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Background Type Toggle (Image/Video) */}
                                <div className="space-y-3 pt-6 border-t border-border/50">
                                    <label className="text-sm font-medium text-foreground">{t('settings.section.media')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            variant={tempAppearanceSettings.backgroundType === 'gradient' ? 'default' : 'outline'}
                                            onClick={() => {
                                                const newSettings: AppearanceSettings = { ...tempAppearanceSettings, backgroundType: 'gradient' };
                                                setTempAppearanceSettings(newSettings);
                                                updateAppearance(newSettings);
                                            }}
                                            className="gap-2"
                                        >
                                            <Palette className="w-4 h-4" /> {t('settings.bg.gradient')}
                                        </Button>
                                        <Button
                                            variant={tempAppearanceSettings.backgroundType === 'image' ? 'default' : 'outline'}
                                            onClick={() => {
                                                const newSettings: AppearanceSettings = { ...tempAppearanceSettings, backgroundType: 'image' };
                                                setTempAppearanceSettings(newSettings);
                                                updateAppearance(newSettings);
                                            }}
                                            className="gap-2"
                                        >
                                            <ImageIcon className="w-4 h-4" /> {t('settings.bg.image')}
                                        </Button>
                                        <Button
                                            variant={tempAppearanceSettings.backgroundType === 'video' ? 'default' : 'outline'}
                                            onClick={() => {
                                                const newSettings: AppearanceSettings = { ...tempAppearanceSettings, backgroundType: 'video' };
                                                setTempAppearanceSettings(newSettings);
                                                updateAppearance(newSettings);
                                            }}
                                            className="gap-2"
                                        >
                                            <Video className="w-4 h-4" /> {t('settings.bg.video')}
                                        </Button>
                                    </div>
                                </div>

                                {/* Media URL & Opacity */}
                                {(tempAppearanceSettings.backgroundType === 'image' || tempAppearanceSettings.backgroundType === 'video') && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('settings.mediaUrl')}</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        value={tempAppearanceSettings.mediaUrl}
                                                        onChange={(e) => {
                                                            const newSettings = { ...tempAppearanceSettings, mediaUrl: e.target.value };
                                                            setTempAppearanceSettings(newSettings);
                                                            updateAppearance(newSettings); // Instant Preview
                                                        }}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="pl-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-sm font-medium">{t('settings.overlayOpacity')}</label>
                                                <span className="text-sm text-muted-foreground">{Math.round(tempAppearanceSettings.bgOpacity * 100)}%</span>
                                            </div>
                                            <Slider
                                                value={[tempAppearanceSettings.bgOpacity]}
                                                onValueChange={(val) => {
                                                    const newSettings = { ...tempAppearanceSettings, bgOpacity: val[0] };
                                                    setTempAppearanceSettings(newSettings);
                                                    updateAppearance(newSettings); // Instant Preview
                                                }}
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
                                        <span className="text-sm text-muted-foreground">{Math.round(tempSoundSettings.volume * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[tempSoundSettings.volume]}
                                        onValueChange={(val) => setTempSoundSettings({ ...tempSoundSettings, volume: val[0] })}
                                        max={1}
                                        step={0.01}
                                    />
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.whiteNoiseVolume')}</label>
                                        <span className="text-sm text-muted-foreground">{Math.round(tempSoundSettings.whiteNoiseVolume * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[tempSoundSettings.whiteNoiseVolume]}
                                        onValueChange={(val) => setTempSoundSettings({ ...tempSoundSettings, whiteNoiseVolume: val[0] })}
                                        max={1}
                                        step={0.01}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['white', 'pink', 'brown'] as const).map(type => (
                                            <Button
                                                key={type}
                                                variant={tempSoundSettings.noiseType === type ? 'default' : 'outline'}
                                                onClick={() => setTempSoundSettings({ ...tempSoundSettings, noiseType: type })}
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
                                            checked={tempSoundSettings.playTickSound}
                                            onCheckedChange={(checked) => setTempSoundSettings({ ...tempSoundSettings, playTickSound: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">{t('settings.notificationSound')}</label>
                                        <Switch
                                            checked={tempSoundSettings.playNotificationSound}
                                            onCheckedChange={(checked) => setTempSoundSettings({ ...tempSoundSettings, playNotificationSound: checked })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-6 mt-6 border-t border-border/50">
                        <Button onClick={handleSave} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Save className="w-5 h-5" />
                            {t('settings.save')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
