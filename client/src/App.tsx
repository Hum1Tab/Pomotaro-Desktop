import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoundProvider } from "./contexts/SoundContext";
import { WhiteNoiseProvider } from "./contexts/WhiteNoiseContext";
import { AppearanceProvider } from "./contexts/AppearanceContext";
import { PomodoroProvider } from "./contexts/PomodoroContext";
import Home from "./pages/Home";
import Settings from "./pages/Settings";


import { Router as WouterRouter, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook



import { useEffect } from "react";
import { toast } from "sonner";

function App() {
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUpdateStatus((message) => {
        toast.info(message);
      });

      window.electronAPI.onUpdateError((message) => {
        toast.error(message);
      });

      window.electronAPI.onUpdateDownloaded(() => {
        toast("新しいバージョンが利用可能です", {
          description: "再起動して更新を適用しますか？",
          action: {
            label: "再起動",
            onClick: () => window.electronAPI?.restartApp(),
          },
          duration: Infinity, // Keep it visible
        });
      });

      // Check for updates on startup (delayed slightly to ensure UI is ready)
      setTimeout(() => {
        window.electronAPI?.checkForUpdates();
      }, 2000);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      // switchable
      >
        <TooltipProvider>
          <SoundProvider>
            <WhiteNoiseProvider>
              <AppearanceProvider>
                <PomodoroProvider>
                  <Toaster />
                  <Router />
                </PomodoroProvider>
              </AppearanceProvider>
            </WhiteNoiseProvider>
          </SoundProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

declare global {
  interface Window {
    electronAPI?: {
      updateActivity: (activity: any) => Promise<void>;
      setProgressBar: (progress: number) => Promise<void>;
      setAlwaysOnTop: (flag: boolean) => Promise<void>;
      setWindowSize: (width: number, height: number) => Promise<void>;
      toggleFullscreen: (flag: boolean) => Promise<void>;
      unmaximizeWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      onWindowStateChanged: (callback: (state: string) => void) => void;
      onUpdateStatus: (callback: (message: string) => void) => void;
      onUpdateError: (callback: (message: string) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      restartApp: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      setAutoLaunch: (enabled: boolean) => Promise<void>;
      getAutoLaunch: () => Promise<boolean>;
      setPowerSaveBlocker: (enabled: boolean) => Promise<void>;
      checkForUpdates: () => Promise<void>;
    };
  }
}
