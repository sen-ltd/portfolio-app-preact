import { defineConfig } from 'vitest/config';

// The filter tests are pure-function tests and don't need a DOM.
// Overriding to 'node' avoids pulling in jsdom and matches how the
// React/Vue/Svelte siblings run their equivalent suites.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
