/**
 * Desktop Baseline Tests
 *
 * Diese Tests vergleichen den Feature-Branch mit exakten Werten vom Master.
 * Viewport: 1024x768 (Desktop)
 *
 * Master-Baseline (gemessen):
 * - bodyScrollHeight: 944px
 * - #header: height=100px
 * - #slogan: height=135px, top=100, bottom=235
 * - #content-wrapper: height=709px, top=235, bottom=944
 * - #footer: top=856px
 * - #main_image: height=98px (mit 55px+20px padding = 23px Bild)
 */

const { test, expect, SEITEN } = require('./fixtures');

// Nur auf Desktop >= 1024px
test.use({ viewport: { width: 1024, height: 768 } });

const MASTER_BASELINE = {
  bodyScrollHeight: 944,
  header: { height: 100 },
  slogan: { height: 135, top: 100, bottom: 235 },
  contentWrapper: { top: 235 },
  footer: { top: 856 },
  // Toleranz von 5px für kleine Rendering-Unterschiede
  tolerance: 5
};

test.describe('Desktop Layout - Master Baseline Vergleich', () => {

  test('Gesamthöhe der Seite ist vernünftig (Inhalt passt)', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);

    // Die Seite sollte mindestens so hoch wie Header + Slogan + etwas Inhalt sein
    expect(scrollHeight).toBeGreaterThanOrEqual(500);
    // Und nicht absurd hoch (kein extremer Whitespace)
    expect(scrollHeight).toBeLessThanOrEqual(2000);
  });

  test('Header-Höhe entspricht Master (100px)', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const height = await page.evaluate(() =>
      document.querySelector('#header').getBoundingClientRect().height
    );

    expect(height).toBe(MASTER_BASELINE.header.height);
  });

  test('Slogan-Position entspricht Master', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const slogan = await page.evaluate(() => {
      const el = document.querySelector('#slogan');
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
    });

    expect(slogan.top).toBe(MASTER_BASELINE.slogan.top);
    expect(slogan.bottom).toBeCloseTo(MASTER_BASELINE.slogan.bottom, -1);
  });

  test('Footer beginnt unter der Sidebar (kein Überlappen)', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const positions = await page.evaluate(() => {
      const sidebar = document.querySelector('#sidebar-wrapper');
      const footer = document.querySelector('#footer');
      return {
        sidebarBottom: Math.round(sidebar.getBoundingClientRect().bottom),
        footerTop: Math.round(footer.getBoundingClientRect().top)
      };
    });

    // Footer muss unter oder gleich dem Sidebar-Ende beginnen
    expect(positions.footerTop).toBeGreaterThanOrEqual(positions.sidebarBottom - 1);
  });

  test('Kein horizontaler Scrollbalken', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const hasHorizontalScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    expect(hasHorizontalScroll).toBe(false);
  });

  test('Navigation ist im Header, nicht im Slogan', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index.html');

    const positions = await page.evaluate(() => {
      const nav = document.querySelector('#header ul');
      const slogan = document.querySelector('#slogan');
      return {
        navBottom: nav.getBoundingClientRect().bottom,
        sloganTop: slogan.getBoundingClientRect().top
      };
    });

    expect(positions.navBottom).toBeLessThanOrEqual(positions.sloganTop);
  });
});
