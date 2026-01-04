import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useSoundContext } from '@/contexts/SoundContext'; // Needed for export
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Minimize2, Maximize2, Download, Upload, Heart } from 'lucide-react';

export function SettingsGeneral() {
    const [, setLocation] = useLocation();
    const { settings: pomoSettings, updateSettings: updatePomoSettings } = usePomodoro();
    const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();
    const { settings: soundSettings, updateSettings: updateSoundSettings } = useSoundContext();
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

    return (
        <div className="space-y-6 animate-fade-in">
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

            {/* Auto Compact On Unmaximize Setting */}
            <div className="flex items-center justify-between animate-fade-in">
                <div className="space-y-0.5">
                    <label className="text-sm font-medium">{t('settings.autoCompactOnUnmaximize')}</label>
                    <p className="text-xs text-muted-foreground">{t('settings.autoCompactOnUnmaximizeDesc')}</p>
                </div>
                <Switch
                    checked={appearanceSettings.autoCompactOnUnmaximize}
                    onCheckedChange={(checked) => updateAppearance({ autoCompactOnUnmaximize: checked })}
                />
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
                                if (result && result.updateInfo) {
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

                    {updateCheckMessage && (
                        <p className="text-xs text-primary font-medium animate-fade-in">
                            {updateCheckMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
