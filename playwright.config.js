import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Playwright starts both parts of the app, while reusing servers already run in VS Code.
  webServer: [
    {
      command: 'npm.cmd run server',
      url: 'http://127.0.0.1:5000/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
