/**
 * Playwright Konfiguration für Praxis Wabner
 *
 * Definiert Geräte-Profile und gemeinsame Einstellungen.
 * Jedes "project" testet mit einer anderen Bildschirmgröße.
 */

const { devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/praxis-wabner';

module.exports = {
  testDir: '.',
  timeout: 30000,
  retries: 1,

  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },

  // Geräte-Profile: Jedes Projekt testet mit anderen Viewport-Einstellungen
  projects: [
    // ==================== Mobile ====================
    {
      name: 'iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iPhone 14',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone 14 Pro Max',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
    {
      name: 'Pixel 7',
      use: { ...devices['Pixel 7'] },
    },

    // ==================== Tablet ====================
    {
      name: 'iPad Mini',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'iPad Pro 11',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'Galaxy Tab S4',
      use: { ...devices['Galaxy Tab S4'] },
    },

    // ==================== Desktop ====================
    {
      name: 'Desktop 1024',
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'Desktop 1440',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Desktop 1920',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
};
