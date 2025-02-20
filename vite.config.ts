import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    // SVGs imported from the FA6 don't need to be inlined!
    assetsInlineLimit: 0
  },
  plugins: [
    sveltekit(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{js,ts}'],
    exclude: ['**/node_modules/**', '.*\\.d\\.ts$', '.*\\.spec\\.ts$'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,ts}'],
    }
  }
});
