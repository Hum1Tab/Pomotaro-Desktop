import { usePomodoro } from '@/hooks/usePomodoro';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Pencil, Coffee, Clock } from 'lucide-react';

export function SettingsTimer() {
    const { settings: pomoSettings, updateSettings: updatePomoSettings } = usePomodoro();
    const { t } = useLanguage();

    return (
        <div className="space-y-6 animate-fade-in">
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
        </div>
    );
}
