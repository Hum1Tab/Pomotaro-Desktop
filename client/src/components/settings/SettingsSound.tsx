import { useSoundContext } from '@/contexts/SoundContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function SettingsSound() {
    const { settings: soundSettings, updateSettings: updateSoundSettings } = useSoundContext();
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-fade-in">
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
    );
}
