import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";

import { lazy, Suspense, useEffect } from "react";
import { toast } from "sonner";

import ErrorBoundary from "./components/ErrorBoundary";
import ComponentErrorBoundary from "./components/ComponentErrorBoundary";
import { AppProviders } from "./components/AppProviders";
import { WindowTitleSync } from "./components/WindowTitleSync";
import Home from "./pages/Home";
import { useLanguage } from "./hooks/useLanguage";


import { useLocation, Router as WouterRouter, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { AnimatePresence, motion } from "framer-motion";

// Settings is only reachable from the home screen, so it is loaded on demand.
// This keeps the first paint small (charts and settings UI stay out of the
// initial bundle).
const Settings = lazy(() => import("./pages/Settings"));

// Helper to freeze the location for the exiting component
// This ensures that the 'Switch' inside the exiting motion.div
// continues to render the OLD route instead of switching to the NEW route
const FrozenRouter = ({ children, location, navigate }: { children: React.ReactNode; location: string, navigate: (to: string, options?: any) => void }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const staticHook = () => [location, navigate] as [string, (to: string, options?: any) => void];
  return <WouterRouter hook={staticHook}>{children}</WouterRouter>;
};

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-24 w-24 animate-pulse rounded-full bg-muted" aria-hidden="true" />
    </div>
  );
}

// ページコンポーネントをErrorBoundaryでラップ
const SafeHome = () => (
  <ComponentErrorBoundary>
    <Home />
  </ComponentErrorBoundary>
);

const SafeSettings = () => (
  <ComponentErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <Settings />
    </Suspense>
  </ComponentErrorBoundary>
);

function AnimatedRoutes() {
  const [location, navigate] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <FrozenRouter location={location} navigate={navigate}>
          <Switch>
            <Route path={"/"} component={SafeHome} />
            <Route path={"/settings"} component={SafeSettings} />
            <Route path={"/404"} component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
          </Switch>
        </FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <AnimatedRoutes />
    </WouterRouter>
  );
}

/**
 * Registers auto-update listeners and checks for updates once on startup.
 * Lives inside AppProviders so it can use the shared language context.
 */
function UpdateNotifications() {
  const { t } = useLanguage();

  useEffect(() => {
    const api = window.desktopAPI;
    if (!api) return;

    const unsubscribeStatus = api.onUpdateStatus((data) => {
      // 翻訳キーの場合は翻訳、そうでなければそのまま表示（後方互換性）
      const message = typeof data === 'object' && data.key ? t(data.key) : String(data);
      toast.info(message);
    });

    const unsubscribeError = api.onUpdateError((data) => {
      // 翻訳キーの場合は翻訳してエラーメッセージを付加
      const message = typeof data === 'object' && data.key
        ? t(data.key) + (data.message || '')
        : String(data);
      toast.error(message);
    });

    const unsubscribeDownloaded = api.onUpdateDownloaded(() => {
      toast(t('update.restartPrompt'), {
        description: t('update.restartDesc'),
        action: {
          label: t('update.restart'),
          onClick: () => api.restartApp(),
        },
        duration: Infinity, // Keep it visible
      });
    });

    // Check for updates on startup (delayed slightly to ensure UI is ready)
    const updateTimer = window.setTimeout(() => {
      api.checkForUpdates().catch((error) => {
        console.error('Failed to check for updates:', error);
      });
    }, 2000);

    return () => {
      unsubscribeStatus();
      unsubscribeError();
      unsubscribeDownloaded();
      window.clearTimeout(updateTimer);
    };
  }, [t]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <WindowTitleSync />
        <UpdateNotifications />
        <Toaster />
        <Router />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
