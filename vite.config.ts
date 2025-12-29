
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";

import electron from "vite-plugin-electron/simple";

const plugins = [
  react(),
  tailwindcss(),
  electron({
    main: {
      entry: path.resolve(__dirname, "electron/main.ts"),
    },
    preload: {
      input: path.resolve(__dirname, "electron/preload.ts"),
    },
  }),
];

export default defineConfig({
  base: './', // Ensure relative paths for Electron
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  envDir: "..",
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
