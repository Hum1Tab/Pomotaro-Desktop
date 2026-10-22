import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const resolvePath = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolvePath('./client/src'),
      '@shared': resolvePath('./shared'),
    },
  },
  test: {
    environment: 'node',
    include: ['client/src/**/*.{test,spec}.{ts,tsx}'],
    reporters: 'default',
  },
});
