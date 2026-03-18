// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright configuration for responsive design tests.
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080/praxis-wabner',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'mvn tomcat7:run',
    url: 'http://localhost:8080/praxis-wabner/',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
