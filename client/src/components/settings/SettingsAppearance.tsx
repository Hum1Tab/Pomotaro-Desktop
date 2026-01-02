import { useAppearance, THEME_PRESETS, PresetTheme, BackgroundType } from '@/contexts/AppearanceContext';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Palette, Image as ImageIcon, Video, Link } from 'lucide-react';

export function SettingsAppearance() {
    const { settings: appearanceSettings, updateSettings: updateAppearance } = useAppearance();
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-fade-in">
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
    );
}
