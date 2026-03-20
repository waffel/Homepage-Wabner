// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual Regression Tests for Desktop Layout
 *
 * These tests ensure the desktop layout remains visually identical
 * to the original design during the responsive design migration.
 *
 * Baseline: Created from master branch
 * Target: feature/responsive-design branch must match this baseline
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/praxis-wabner';

test.describe('Desktop Layout - Visual Regression', () => {

  test.use({ viewport: { width: 1920, height: 1080 } });

  test('homepage full page matches baseline', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // Wait for fonts and images to load
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-fullpage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01
    });
  });

  test('navigation menu is positioned above banner/spruch', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Screenshot of the header area including menu and spruch-band
    const headerArea = page.locator('body').first();
    await expect(page).toHaveScreenshot('header-and-menu-area-desktop.png', {
      clip: { x: 0, y: 0, width: 1920, height: 400 },
      maxDiffPixelRatio: 0.01
    });
  });

  test('navigation menu element positions', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await page.waitForLoadState('networkidle');

    // Get menu and banner positions to verify menu is ABOVE banner
    // The menu should have a lower Y position than the spruch/banner
    const menuSelector = '#menu, .menu, nav, [class*="menu"]';
    const bannerSelector = '#spruch, .spruch, [class*="spruch"], [class*="banner"]';

    const menu = page.locator(menuSelector).first();
    const banner = page.locator(bannerSelector).first();

    // Check if both elements exist
    const menuCount = await menu.count();
    const bannerCount = await banner.count();

    if (menuCount > 0 && bannerCount > 0) {
      const menuBox = await menu.boundingBox();
      const bannerBox = await banner.boundingBox();

      if (menuBox && bannerBox) {
        // Menu bottom should be at or above banner top (menu is above banner)
        // Allow some overlap tolerance
        console.log(`Menu bottom: ${menuBox.y + menuBox.height}, Banner top: ${bannerBox.y}`);
        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(bannerBox.y + 50);
      }
    }
  });

});

test.describe('Desktop Layout - Other Pages', () => {

  test.use({ viewport: { width: 1920, height: 1080 } });

  const pages = [
    { name: 'osteopathie', url: '/osteopathie.html' },
    { name: 'kinesiologie', url: '/kinesiologie.html' },
    { name: 'praxis', url: '/praxis.html' },
    { name: 'about-me', url: '/about_me.html' },
    { name: 'kosten', url: '/kosten.html' },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} header area matches baseline`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`${pageInfo.name}-header-desktop.png`, {
        clip: { x: 0, y: 0, width: 1920, height: 400 },
        maxDiffPixelRatio: 0.01
      });
    });
  }

});
