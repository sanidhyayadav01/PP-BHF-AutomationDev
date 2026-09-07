import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // Run specs sequentially to avoid overloading dev env
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Single worker for predictable execution on dev environment
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: 'https://dev.prizeplanet.com/',
    navigationTimeout: 15_000,
    viewport: null, // null viewport uses full maximized screen resolution
    launchOptions: {
      args: ['--start-maximized'],
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    // Global setup to perform authentication once and save state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'e2e-authenticated',
      testIgnore: [/01_login_signup\.spec\.ts/, /.*\.setup\.ts/],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
        storageState: '.auth/user.json',
      },
    },
    {
      name: 'e2e-unauthenticated',
      testMatch: /01_login_signup\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,
        deviceScaleFactor: undefined,
      },
    },
  ],
});
