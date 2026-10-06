import { defineConfig } from 'playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.e2e.ts'],
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: 'bun run build && bun run preview --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000
  }
});