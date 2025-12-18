import { defineConfig, devices } from '@playwright/test';
import { config, env } from './config/variables';

/**
 * Playwright configuration following KATA standards
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: 0, // KATA: Investigate failures, don't mask them
  workers: env.isCI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: config.baseUrl,
    reuseExistingServer: !env.isCI,
    timeout: 120_000,
  },
});
