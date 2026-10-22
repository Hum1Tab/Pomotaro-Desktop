import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: './', // Tauri serves the built assets from its custom protocol
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  envDir: "..",
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // React and the animation library are shared by every route, so they get
        // their own long-lived chunks. Charts are intentionally not listed: the
        // stats/calendar screens are lazy, and forcing recharts into a manual
        // chunk made the entry preload 420 kB that the timer screen never uses.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true, // Must match tauri.conf.json devUrl
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
