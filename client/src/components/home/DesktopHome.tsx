import { lazy, Suspense } from 'react';

import { CategorySelector } from '@/components/CategorySelector';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { HomeLogic } from '@/hooks/useHomeLogic';
import { HomeNavigation } from './HomeNavigation';
import { TimerTab } from './TimerTab';

// Heavy tabs (charts, calendar, tool screens) are split out of the initial
// bundle and loaded the first time the tab is opened.
const StopwatchMode = lazy(() => import('@/components/StopwatchMode').then((m) => ({ default: m.StopwatchMode })));
const StatsDashboard = lazy(() => import('@/components/StatsDashboard').then((m) => ({ default: m.StatsDashboard })));
const CalendarView = lazy(() => import('@/components/CalendarView').then((m) => ({ default: m.CalendarView })));
const ExamManager = lazy(() => import('@/components/ExamManager').then((m) => ({ default: m.ExamManager })));
const ShortcutsDialog = lazy(() => import('@/components/ShortcutsDialog').then((m) => ({ default: m.ShortcutsDialog })));

function TabFallback() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-card/70" />
    </div>
  );
}

function Deferred({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<TabFallback />}>{children}</Suspense>;
}

export function DesktopHome({ logic }: { logic: HomeLogic }) {
  return (
    <main className="container mx-auto max-w-4xl animate-fade-in-up px-4 py-8 pb-32">
      <Tabs value={logic.activeTab} onValueChange={logic.setActiveTab} className="w-full">
        <HomeNavigation logic={logic} />
        <TabsContent value="timer" className="space-y-6"><TimerTab logic={logic} /></TabsContent>
        <TabsContent value="stopwatch" className="rounded-lg bg-card p-4 shadow-warm sm:p-8">
          <Deferred><StopwatchMode /></Deferred>
        </TabsContent>
        <TabsContent value="categories" className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><CategorySelector /></TabsContent>
        <TabsContent value="stats" className="space-y-6">
          <Deferred><StatsDashboard /></Deferred>
        </TabsContent>
        <TabsContent value="calendar" className="rounded-lg bg-card p-4 shadow-warm sm:p-8">
          <Deferred><CalendarView /></Deferred>
        </TabsContent>
        <TabsContent value="tools" className="space-y-6">
          <Deferred>
            <ExamManager />
            <div className="rounded-lg bg-card p-4 shadow-warm sm:p-8"><ShortcutsDialog /></div>
          </Deferred>
        </TabsContent>
      </Tabs>
    </main>
  );
}
