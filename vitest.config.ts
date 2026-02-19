import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@cartographie/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
