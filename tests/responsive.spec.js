/**
 * Responsive Design Tests
 *
 * Tests the Definition of Done criteria for the responsive design implementation.
 * Run with: npx playwright test tests/responsive.spec.js
 *
 * Prerequisites:
 *   npm init -y && npm install -D @playwright/test && npx playwright install chromium
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/praxis-wabner';

const PAGES = [
  { path: '/', name: 'index' },
  { path: '/index2.html', name: 'index2' },
  { path: '/osteopathie.html', name: 'osteopathie' },
  { path: '/kinesiologie.html', name: 'kinesiologie' },
  { path: '/about_me.html', name: 'about_me' },
  { path: '/praxis.html', name: 'praxis' },
  { path: '/kosten.html', name: 'kosten' },
  { path: '/impressum.html', name: 'impressum' },
  { path: '/dsvgo.html', name: 'dsvgo' },
];

const VIEWPORTS = [
  { name: 'iPhone SE', width: 320, height: 568 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 },
  { name: 'Desktop Large', width: 1440, height: 900 },
];

// DoD: No horizontal scrollbars on mobile
test.describe('No horizontal overflow', () => {
  for (const viewport of VIEWPORTS) {
    for (const page of PAGES) {
      test(`${page.name} at ${viewport.name} (${viewport.width}px)`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const p = await context.newPage();
        await p.goto(`${BASE_URL}${page.path}`);

        const scrollWidth = await p.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await p.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px tolerance
        await context.close();
      });
    }
  }
});

// DoD: Navigation works on all devices (hamburger menu on mobile)
test.describe('Navigation', () => {
  test('hamburger menu visible on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/index2.html`);

    const hamburger = page.locator('.nav-toggle');
    await expect(hamburger).toBeVisible();
    await context.close();
  });

  test('hamburger menu hidden on desktop', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/index2.html`);

    const hamburger = page.locator('.nav-toggle');
    await expect(hamburger).toBeHidden();
    await context.close();
  });

  test('nav menu toggles on hamburger click', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/index2.html`);

    const nav = page.locator('#header ul');
    const hamburger = page.locator('.nav-toggle');

    // Menu should be hidden initially
    await expect(nav).toBeHidden();

    // Click hamburger - menu should open
    await hamburger.click();
    await expect(nav).toBeVisible();

    // Click again - menu should close
    await hamburger.click();
    await expect(nav).toBeHidden();

    await context.close();
  });

  test('nav menu visible on desktop without hamburger', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/index2.html`);

    const nav = page.locator('#header ul');
    await expect(nav).toBeVisible();
    await context.close();
  });
});

// DoD: Images don't overflow viewport
test.describe('Images responsive', () => {
  for (const viewport of VIEWPORTS.filter(v => v.width <= 768)) {
    test(`images fit within viewport at ${viewport.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/index2.html`);

      const images = await page.locator('img').all();
      for (const img of images) {
        const box = await img.boundingBox();
        if (box) {
          expect(box.width).toBeLessThanOrEqual(viewport.width);
        }
      }
      await context.close();
    });
  }
});

// DoD: Text readable without zoom (min 16px on mobile)
test.describe('Typography', () => {
  test('base font size >= 16px on mobile', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/index2.html`);

    const fontSize = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.body).fontSize);
    });

    expect(fontSize).toBeGreaterThanOrEqual(16);
    await context.close();
  });
});

// DoD: All 9 HTML pages load successfully
test.describe('All pages load', () => {
  for (const page of PAGES) {
    test(`${page.name} loads successfully`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${page.path}`);
      expect(response.status()).toBe(200);
    });
  }
});

// Viewport meta tag present
test.describe('Viewport meta tag', () => {
  for (const page of PAGES) {
    test(`${page.name} has viewport meta tag`, async ({ browser }) => {
      const context = await browser.newContext();
      const p = await context.newPage();
      await p.goto(`${BASE_URL}${page.path}`);

      const viewport = await p.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
      // Should NOT have user-scalable=0 (accessibility issue)
      expect(viewport).not.toContain('user-scalable=0');

      await context.close();
    });
  }
});
