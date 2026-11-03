import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Tests cover the pure logic in src/lib only, so a plain Node environment is enough.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
