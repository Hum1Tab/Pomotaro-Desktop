import { CalendarView } from '@/components/CalendarView';
import { CategorySelector } from '@/components/CategorySelector';
import { ExamManager } from '@/components/ExamManager';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { StatsDashboard } from '@/components/StatsDashboard';
import { StopwatchMode } from '@/components/StopwatchMode';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { HomeLogic } from '@/hooks/useHomeLogic';
import { HomeNavigation } from './HomeNavigation';
import { TimerTab } from './TimerTab';

export function DesktopHome({ logic }: { logic: HomeLogic }) {
  return (
    <main className="container mx-auto max-w-4xl animate-fade-in-up px-4 py-8 pb-32">
      <Tabs value={logic.activeTab} onValueChange={logic.setActiveTab} className="w-full">
        <HomeNavigation logic={logic} />
        <TabsContent value="timer" className="space-y-6"><TimerTab logic={logic} /></TabsContent>
        <TabsContent value="stopwatch" className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><StopwatchMode /></TabsContent>
        <TabsContent value="categories" className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><CategorySelector /></TabsContent>
        <TabsContent value="stats" className="space-y-6"><StatsDashboard /></TabsContent>
        <TabsContent value="calendar" className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><CalendarView /></TabsContent>
        <TabsContent value="tools" className="space-y-6">
          <ExamManager />
          <div className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><ShortcutsDialog /></div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
