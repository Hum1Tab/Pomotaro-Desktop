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


import { useLocation, Router as WouterRouter, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { AnimatePresence, motion } from "framer-motion";

// Helper to freeze the location for the exiting component
// This ensures that the 'Switch' inside the exiting motion.div
// continues to render the OLD route instead of switching to the NEW route
const FrozenRouter = ({ children, location, navigate }: { children: React.ReactNode; location: string, navigate: (to: string, options?: any) => void }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const staticHook = () => [location, navigate] as [string, (to: string, options?: any) => void];
  return <WouterRouter hook={staticHook}>{children}</WouterRouter>;
};

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
            <Route path={"/"} component={Home} />
            <Route path={"/settings"} component={Settings} />
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


