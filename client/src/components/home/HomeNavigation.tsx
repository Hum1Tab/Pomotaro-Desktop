import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, Calendar, Layers, Moon, Settings, Sun, Timer, Watch, Wrench } from 'lucide-react';
import type { HomeLogic } from '@/hooks/useHomeLogic';

export function HomeNavigation({ logic }: { logic: HomeLogic }) {
  const { sound, theme, setLightTheme, setDarkTheme, goToSettings, t } = logic;
  const tabs = [
    ['timer', Timer, 'tabs.timer'],
    ['stopwatch', Watch, 'tabs.stopwatch'],
    ['categories', Layers, 'tabs.categories'],
    ['stats', BarChart2, 'tabs.stats'],
    ['calendar', Calendar, 'tabs.calendar'],
    ['tools', Wrench, 'tabs.tools'],
  ] as const;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-fit -translate-x-1/2 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="mx-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-2 pl-4 pr-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-md">
        <TabsList className="flex h-auto items-center gap-1 bg-transparent p-0">
          {tabs.map(([value, Icon, label]) => (
            <TabsTrigger key={value} value={value} title={t(label)} className="flex h-10 w-10 items-center justify-center rounded-full p-0 text-muted-foreground transition-all hover:bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mx-1 h-8 w-px bg-border" />
        <div className="flex gap-1">
          <Button onClick={() => { sound.playClickSound(); theme === 'dark' ? setLightTheme() : setDarkTheme(); }} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground/80 transition-all hover:bg-muted/50 hover:text-foreground sm:h-12 sm:w-12" title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')} aria-label={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}>
            {theme === 'dark' ? <Sun className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />}
          </Button>
          <Button onClick={goToSettings} variant="ghost" size="icon" className="h-10 w-10 rounded-full text-foreground/80 transition-all hover:bg-muted/50 hover:text-foreground sm:h-12 sm:w-12" title={t('settings.title')} aria-label={t('settings.title')}>
            <Settings className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
