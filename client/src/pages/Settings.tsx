import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Check, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { usePomodoro, PomodoroSettings } from '@/hooks/usePomodoro';
import { useSoundContext, SoundSettings } from '@/contexts/SoundContext';
import { useAppearance, AppearanceSettings } from '@/contexts/AppearanceContext';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Palette, Image as ImageIcon, Video, Link } from 'lucide-react';

declare global {
    interface Window {
        electronAPI?: {
            setAlwaysOnTop: (flag: boolean) => Promise<void>;
            setProgressBar: (progress: number) => Promise<void>;
        };
    }
}

export default function Settings() {
    const [, setLocation] = useLocation();
    const { t, language, changeLanguage } = useLanguage();
    const { settings, updateSettings } = usePomodoro();
    const { settings: soundSettings, updateSettings: updateSoundSettings } = useSoundContext();
    const { settings: appearanceSettings, updateSettings: updateAppearanceSettings } = useAppearance();

    const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);
    const [tempSoundSettings, setTempSoundSettings] = useState<SoundSettings>(soundSettings);
    const [tempAppearanceSettings, setTempAppearanceSettings] = useState<AppearanceSettings>(appearanceSettings);

    const [initialSettings, setInitialSettings] = useState<PomodoroSettings>(settings);
    const [initialSoundSettings, setInitialSoundSettings] = useState<SoundSettings>(soundSettings);
    const isInitializedRef = useRef(false);

    // 設定画面を開いたときに最新の設定を読み込む
    // 設定画面を開いたときに最新の設定を読み込む
    useEffect(() => {
        if (JSON.stringify(settings) !== JSON.stringify(tempSettings)) {
            setTempSettings(settings);
        }
        if (JSON.stringify(soundSettings) !== JSON.stringify(tempSoundSettings)) {
            setTempSoundSettings(soundSettings);
        }
        if (JSON.stringify(appearanceSettings) !== JSON.stringify(tempAppearanceSettings)) {
            setTempAppearanceSettings(appearanceSettings);
        }

        // Initial values technically don't need real-time sync back, but good to keep updated
        setInitialSettings(settings);
        setInitialSoundSettings(soundSettings);

        // isInitializedRef is no longer strictly needed for blocking, but we keep the concept if needed
        isInitializedRef.current = false;
    }, [settings, soundSettings, appearanceSettings]);

    // リアルタイムで見た目を更新
    useEffect(() => {
        // 初回レンダリング時も適用して問題ない、あるいは変更があった時のみ適用
        updateAppearanceSettings(tempAppearanceSettings);
    }, [tempAppearanceSettings]);

    // リアルタイムで設定を更新（完了時刻などを即座に反映）
    useEffect(() => {
        updateSettings(tempSettings);
    }, [tempSettings]);

    // 音量変更をリアルタイムで反映
    useEffect(() => {
        updateSoundSettings(tempSoundSettings);
    }, [tempSoundSettings.volume, tempSoundSettings.whiteNoiseVolume, tempSoundSettings.noiseType]);

    const handleSave = () => {
        updateSettings(tempSettings);
        updateSoundSettings(tempSoundSettings);
        updateAppearanceSettings(tempAppearanceSettings);
        setLocation('/');
    };

    const handleCancel = () => {
        // キャンセル時は設定を元に戻す
        updateSoundSettings(initialSoundSettings);
        setLocation('/');
    };

    return (
        <div className="min-h-screen bg-background p-4 animate-fade-in-up">
            <div className="container mx-auto max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleCancel}
                        variant="ghost"
                        size="icon"
                        className="text-foreground"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
                </div>

                <Card className="p-6 bg-card shadow-warm space-y-6">
                    {/* Language Settings */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                            {t('settings.language')}
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant={language === 'en' ? 'default' : 'outline'}
                                onClick={() => changeLanguage('en')}
                                className="flex-1"
                            >
                                English
                            </Button>
                            <Button
                                variant={language === 'ja' ? 'default' : 'outline'}
                                onClick={() => changeLanguage('ja')}
                                className="flex-1"
                            >
                                日本語
                            </Button>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Palette className="w-5 h-5" /> {t('settings.appearance') || '外観'}
                        </h2>

                        <div className="space-y-4">
                            {/* Background Type */}
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={tempAppearanceSettings.backgroundType === 'gradient' ? 'default' : 'outline'}
                                    onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'gradient' })}
                                    className="gap-2"
                                >
                                    <Palette className="w-4 h-4" /> Gradient
                                </Button>
                                <Button
                                    variant={tempAppearanceSettings.backgroundType === 'image' ? 'default' : 'outline'}
                                    onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'image' })}
                                    className="gap-2"
                                >
                                    <ImageIcon className="w-4 h-4" /> Image
                                </Button>
                                <Button
                                    variant={tempAppearanceSettings.backgroundType === 'video' ? 'default' : 'outline'}
                                    onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'video' })}
                                    className="gap-2"
                                >
                                    <Video className="w-4 h-4" /> Video
                                </Button>
                            </div>

                            {/* Gradient Colors */}
                            {tempAppearanceSettings.backgroundType === 'gradient' && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-sm font-medium">Gradient Colors</label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs text-muted-foreground">Start Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[0]}
                                                    onChange={(e) => setTempAppearanceSettings({
                                                        ...tempAppearanceSettings,
                                                        gradientColors: [e.target.value, tempAppearanceSettings.gradientColors[1]]
                                                    })}
                                                    className="w-10 h-10 rounded cursor-pointer border-none"
                                                />
                                                <Input
                                                    value={tempAppearanceSettings.gradientColors[0]}
                                                    onChange={(e) => setTempAppearanceSettings({
                                                        ...tempAppearanceSettings,
                                                        gradientColors: [e.target.value, tempAppearanceSettings.gradientColors[1]]
                                                    })}
                                                    className="flex-1 font-mono uppercase"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-xs text-muted-foreground">End Color</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[1]}
                                                    onChange={(e) => setTempAppearanceSettings({
                                                        ...tempAppearanceSettings,
                                                        gradientColors: [tempAppearanceSettings.gradientColors[0], e.target.value]
                                                    })}
                                                    className="w-10 h-10 rounded cursor-pointer border-none"
                                                />
                                                <Input
                                                    value={tempAppearanceSettings.gradientColors[1]}
                                                    onChange={(e) => setTempAppearanceSettings({
                                                        ...tempAppearanceSettings,
                                                        gradientColors: [tempAppearanceSettings.gradientColors[0], e.target.value]
                                                    })}
                                                    className="flex-1 font-mono uppercase"
                                                    maxLength={7}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Media URL */}
                            {(tempAppearanceSettings.backgroundType === 'image' || tempAppearanceSettings.backgroundType === 'video') && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Link className="w-4 h-4" /> Media URL (Direct Link)
                                    </label>
                                    <Input
                                        value={tempAppearanceSettings.mediaUrl}
                                        onChange={(e) => setTempAppearanceSettings({ ...tempAppearanceSettings, mediaUrl: e.target.value })}
                                        placeholder={`https://example.com/media.${tempAppearanceSettings.backgroundType === 'image' ? 'jpg' : 'mp4'}`}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Paste a direct link to an image or .mp4 video file.
                                    </p>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-medium">Overlay Opacity</label>
                                            <span className="text-xs text-muted-foreground">{Math.round(tempAppearanceSettings.bgOpacity * 100)}%</span>
                                        </div>
                                        <Slider
                                            value={[tempAppearanceSettings.bgOpacity]}
                                            max={0.9}
                                            step={0.05}
                                            onValueChange={(val) => setTempAppearanceSettings({ ...tempAppearanceSettings, bgOpacity: val[0] })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preset Timer Options */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h2 className="text-lg font-semibold text-foreground">
                            {t('settings.timerPresets')}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {t('settings.presetsDesc')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempSettings({
                                        ...tempSettings,
                                        pomodoroTime: 15,
                                        shortBreakTime: 3,
                                    });
                                }}
                                className="flex flex-col h-auto py-3 items-start"
                            >
                                <span className="font-semibold">{t('settings.preset.short')}</span>
                                <span className="text-xs text-muted-foreground">15min + 3min</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempSettings({
                                        ...tempSettings,
                                        pomodoroTime: 25,
                                        shortBreakTime: 5,
                                    });
                                }}
                                className="flex flex-col h-auto py-3 items-start"
                            >
                                <span className="font-semibold">{t('settings.preset.standard')} ⭐</span>
                                <span className="text-xs text-muted-foreground">25min + 5min</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempSettings({
                                        ...tempSettings,
                                        pomodoroTime: 35,
                                        shortBreakTime: 7,
                                    });
                                }}
                                className="flex flex-col h-auto py-3 items-start"
                            >
                                <span className="font-semibold">{t('settings.preset.medium')}</span>
                                <span className="text-xs text-muted-foreground">35min + 7min</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempSettings({
                                        ...tempSettings,
                                        pomodoroTime: 50,
                                        shortBreakTime: 10,
                                    });
                                }}
                                className="flex flex-col h-auto py-3 items-start"
                            >
                                <span className="font-semibold">{t('settings.preset.long')}</span>
                                <span className="text-xs text-muted-foreground">50min + 10min</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setTempSettings({
                                        ...tempSettings,
                                        pomodoroTime: 52,
                                        shortBreakTime: 17,
                                    });
                                }}
                                className="flex flex-col h-auto py-3 items-start col-span-2"
                            >
                                <span className="font-semibold flex items-center gap-1">
                                    {t('settings.preset.research')}
                                    <span className="text-xs">📊</span>
                                </span>
                                <span className="text-xs text-muted-foreground">52min + 17min ({t('settings.preset.researchDesc')})</span>
                            </Button>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h2 className="text-lg font-semibold text-foreground">
                                {t('settings.appearance')}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {/* Background Type Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Background Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={tempAppearanceSettings.backgroundType === 'gradient' ? 'default' : 'outline'}
                                        onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'gradient' })}
                                        className="gap-2"
                                    >
                                        <Palette className="w-4 h-4" />
                                        Gradient
                                    </Button>
                                    <Button
                                        variant={tempAppearanceSettings.backgroundType === 'image' ? 'default' : 'outline'}
                                        onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'image' })}
                                        className="gap-2"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        Image
                                    </Button>
                                    <Button
                                        variant={tempAppearanceSettings.backgroundType === 'video' ? 'default' : 'outline'}
                                        onClick={() => setTempAppearanceSettings({ ...tempAppearanceSettings, backgroundType: 'video' })}
                                        className="gap-2"
                                    >
                                        <Video className="w-4 h-4" />
                                        Video
                                    </Button>
                                </div>
                            </div>

                            {/* Gradient Colors */}
                            {tempAppearanceSettings.backgroundType === 'gradient' && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-sm font-medium text-foreground">
                                        Gradient Colors
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Start Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[0]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[0] = e.target.value;
                                                        setTempAppearanceSettings({ ...tempAppearanceSettings, gradientColors: newColors });
                                                    }}
                                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                                />
                                                <Input
                                                    value={tempAppearanceSettings.gradientColors[0]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[0] = e.target.value;
                                                        setTempAppearanceSettings({ ...tempAppearanceSettings, gradientColors: newColors });
                                                    }}
                                                    className="uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">End Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={tempAppearanceSettings.gradientColors[1]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[1] = e.target.value;
                                                        setTempAppearanceSettings({ ...tempAppearanceSettings, gradientColors: newColors });
                                                    }}
                                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                                />
                                                <Input
                                                    value={tempAppearanceSettings.gradientColors[1]}
                                                    onChange={(e) => {
                                                        const newColors = [...tempAppearanceSettings.gradientColors] as [string, string];
                                                        newColors[1] = e.target.value;
                                                        setTempAppearanceSettings({ ...tempAppearanceSettings, gradientColors: newColors });
                                                    }}
                                                    className="uppercase font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Media URL Input */}
                            {(tempAppearanceSettings.backgroundType === 'image' || tempAppearanceSettings.backgroundType === 'video') && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-sm font-medium text-foreground">
                                        Media URL
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value={tempAppearanceSettings.mediaUrl}
                                                onChange={(e) => setTempAppearanceSettings({ ...tempAppearanceSettings, mediaUrl: e.target.value })}
                                                placeholder={tempAppearanceSettings.backgroundType === 'image' ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Enter a direct URL to an {tempAppearanceSettings.backgroundType} file.
                                    </p>
                                </div>
                            )}

                            {/* Overlay Opacity */}
                            {(tempAppearanceSettings.backgroundType === 'image' || tempAppearanceSettings.backgroundType === 'video') && (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-foreground">Overlay Opacity</label>
                                        <span className="text-sm text-muted-foreground">{Math.round(tempAppearanceSettings.bgOpacity * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[tempAppearanceSettings.bgOpacity]}
                                        max={0.9}
                                        step={0.05}
                                        onValueChange={(val) => setTempAppearanceSettings({ ...tempAppearanceSettings, bgOpacity: val[0] })}
                                        className="py-4"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Adjust transparency to make text readable.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timer Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h2 className="text-lg font-semibold text-foreground">
                                Timer Settings
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">
                                    {t('settings.pomodoro')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={tempSettings.pomodoroTime}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            pomodoroTime: Math.max(1, Math.min(180, parseInt(e.target.value) || 25)),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">
                                    {t('settings.shortBreak')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={tempSettings.shortBreakTime}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            shortBreakTime: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">
                                    {t('settings.longBreak')} (min)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={tempSettings.longBreakTime}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            longBreakTime: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-foreground block mb-2">
                                    {t('settings.longBreakInterval')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={tempSettings.longBreakInterval}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            longBreakInterval: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempSettings.autoStartPomodoros}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            autoStartPomodoros: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-foreground">{t('settings.autoStartPomodoros')}</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempSettings.autoStartBreaks}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            autoStartBreaks: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm font-medium text-foreground">{t('settings.autoStartBreaks')}</span>
                            </label>
                        </div>

                        {/* Category Option */}
                        <div className="pt-4 border-t border-border">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempSettings.alwaysAskCategory}
                                    onChange={(e) =>
                                        setTempSettings({
                                            ...tempSettings,
                                            alwaysAskCategory: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-foreground">
                                        {t('settings.alwaysAskCategory')}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t('settings.alwaysAskCategoryDesc')}
                                    </p>
                                </div>
                            </label>

                            <div className="pt-4 border-t border-border">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={tempSettings.showEstimatedFinishTime}
                                        onChange={(e) =>
                                            setTempSettings({
                                                ...tempSettings,
                                                showEstimatedFinishTime: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                    <span className="text-sm font-medium text-foreground">
                                        {t('settings.showEstimatedFinishTime')}
                                    </span>
                                </label>
                            </div>
                            <div className="pt-4 border-t border-border">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={tempSettings.showTaskInput}
                                        onChange={(e) =>
                                            setTempSettings({
                                                ...tempSettings,
                                                showTaskInput: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                                    />
                                    <span className="text-sm font-medium text-foreground">
                                        タスク名と予想ポモドーロ数を表示
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Features */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={tempSettings.alwaysOnTop || false}
                                onChange={(e) => {
                                    setTempSettings({
                                        ...tempSettings,
                                        alwaysOnTop: e.target.checked,
                                    });
                                    if (window.electronAPI) {
                                        window.electronAPI.setAlwaysOnTop(e.target.checked);
                                    }
                                }}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-foreground">
                                最前面に固定 (Always on Top)
                            </span>
                        </label>
                    </div>

                    {/* Sound Settings */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h2 className="text-lg font-semibold text-foreground">{t('settings.sound')}</h2>

                        {/* Volume Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">{t('settings.volume')}</label>
                                <span className="text-sm text-muted-foreground">{Math.round(tempSoundSettings.volume * 100)}%</span>
                            </div>
                            <Slider
                                defaultValue={[tempSoundSettings.volume]}
                                value={[tempSoundSettings.volume]}
                                max={1}
                                step={0.01}
                                onValueChange={(val) => setTempSoundSettings({ ...tempSoundSettings, volume: val[0] })}
                                className="py-4"
                            />
                        </div>

                        {/* White Noise Volume Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">{t('settings.whiteNoiseVolume')}</label>
                                <span className="text-sm text-muted-foreground">{Math.round(tempSoundSettings.whiteNoiseVolume * 100)}%</span>
                            </div>

                            <Slider
                                defaultValue={[tempSoundSettings.whiteNoiseVolume]}
                                value={[tempSoundSettings.whiteNoiseVolume]}
                                max={1}
                                step={0.01}
                                onValueChange={(val) => setTempSoundSettings({ ...tempSoundSettings, whiteNoiseVolume: val[0] })}
                                className="py-4"
                            />

                        </div>

                        {/* Noise Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                ノイズタイプ
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={tempSoundSettings.noiseType === 'white' ? 'default' : 'outline'}
                                    onClick={() => setTempSoundSettings({ ...tempSoundSettings, noiseType: 'white' })}
                                    className="text-xs"
                                >
                                    ホワイト
                                </Button>
                                <Button
                                    variant={tempSoundSettings.noiseType === 'pink' ? 'default' : 'outline'}
                                    onClick={() => setTempSoundSettings({ ...tempSoundSettings, noiseType: 'pink' })}
                                    className="text-xs"
                                >
                                    ピンク
                                </Button>
                                <Button
                                    variant={tempSoundSettings.noiseType === 'brown' ? 'default' : 'outline'}
                                    onClick={() => setTempSoundSettings({ ...tempSoundSettings, noiseType: 'brown' })}
                                    className="text-xs"
                                >
                                    ブラウン
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ブラウンノイズ: 深い音で最も集中しやすい（推奨）
                            </p>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h2 className="text-lg font-semibold text-foreground">{t('settings.data')}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-secondary/20 space-y-3">
                                <h3 className="font-medium">{t('settings.export')}</h3>
                                <p className="text-xs text-muted-foreground">{t('settings.exportDesc')}</p>
                                <Button
                                    onClick={() => {
                                        try {
                                            const getParsedItem = (key: string) => {
                                                const item = localStorage.getItem(key);
                                                return item ? JSON.parse(item) : null;
                                            };

                                            const data = {
                                                pomodoroSettings: getParsedItem('pomodoroSettings'),
                                                // sessionsCompleted: getParsedItem('sessionsCompleted'), // Not persisted
                                                pomodoroSessions: getParsedItem('pomotaro-sessions'), // Correct key
                                                tasks: getParsedItem('pomodoroTasks'), // Correct key
                                                studyCategories: getParsedItem('studyCategories'),
                                                'app-language': localStorage.getItem('app-language'), // String value
                                                soundSettings: getParsedItem('soundSettings'),
                                                // whiteNoiseVolume: getParsedItem('whiteNoiseVolume'), // Included in soundSettings
                                                exams: getParsedItem('examDates'), // Correct key
                                                appearanceSettings: getParsedItem('appearanceSettings'),
                                                theme: localStorage.getItem('theme'),
                                            };

                                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `pomotaro-backup-${new Date().toISOString().split('T')[0]}.json`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        } catch (error) {
                                            console.error('Export failed:', error);
                                            alert(t('settings.importError') || 'Export failed'); // Fallback message
                                        }
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {t('settings.export')}
                                </Button>
                            </div>

                            <div className="p-4 rounded-lg bg-secondary/20 space-y-3">
                                <h3 className="font-medium">{t('settings.import')}</h3>
                                <p className="text-xs text-muted-foreground">{t('settings.importDesc')}</p>
                                <div className="relative">
                                    <Button variant="outline" className="w-full relative cursor-pointer">
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

                                                            // Mapping for import compatibility
                                                            const keyMapping: Record<string, string> = {
                                                                pomodoroSettings: 'pomodoroSettings',
                                                                pomodoroSessions: 'pomotaro-sessions',
                                                                tasks: 'pomodoroTasks',
                                                                studyCategories: 'studyCategories',
                                                                'app-language': 'app-language',
                                                                soundSettings: 'soundSettings',
                                                                exams: 'examDates',
                                                                appearanceSettings: 'appearanceSettings',
                                                                theme: 'theme'
                                                            };

                                                            Object.entries(data).forEach(([key, value]) => {
                                                                const storageKey = keyMapping[key] || key;
                                                                if (value !== null && value !== undefined) {
                                                                    if (typeof value === 'object') {
                                                                        localStorage.setItem(storageKey, JSON.stringify(value));
                                                                    } else {
                                                                        localStorage.setItem(storageKey, String(value));
                                                                    }
                                                                }
                                                            });

                                                            alert(t('settings.importSuccess'));
                                                            window.location.reload();
                                                        } catch (error) {
                                                            console.error('Import failed:', error);
                                                            alert(t('settings.importError'));
                                                        }
                                                    };
                                                    reader.readAsText(file);
                                                }
                                            }}
                                        />
                                        {t('settings.import')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            {t('settings.save')}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1 border-2 border-border text-foreground hover:border-primary hover:text-primary"
                        >
                            <X className="w-4 h-4 mr-2" />
                            {t('settings.cancel')}
                        </Button>
                    </div>
                </Card>
            </div >
        </div >
    );
}
