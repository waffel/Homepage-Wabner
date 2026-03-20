/**
 * Layout-Tests: Kein horizontales Scrollen, Bilder passen, Navigation-Position
 */

const { test, expect, SEITEN, BREAKPOINTS, hatHorizontalenOverflow } = require('./fixtures');

test.describe('Layout passt zur Bildschirmgröße', () => {

  for (const seite of SEITEN) {
    test(`${seite.name}: Kein horizontales Scrollen`, async ({ page, oeffneSeite }) => {
      await oeffneSeite(seite.pfad);

      const overflow = await hatHorizontalenOverflow(page);
      expect(overflow, `${seite.name} sollte nicht horizontal scrollen`).toBe(false);
    });
  }

  test('Bilder sind nicht breiter als der Bildschirm', async ({ page, oeffneSeite, viewportBreite }) => {
    await oeffneSeite('/index2.html');

    const bilder = await page.locator('img').all();

    for (const bild of bilder) {
      const box = await bild.boundingBox();
      if (box) {
        expect(box.width, 'Bild sollte in Viewport passen').toBeLessThanOrEqual(viewportBreite);
      }
    }
  });
});

test.describe('Navigation-Position auf Desktop', () => {
  // Dieser Test läuft nur auf Desktop-Geräten (>= 768px)
  test('Navigation ist innerhalb des Headers, nicht im Slogan-Bereich', async ({ page, oeffneSeite, viewportBreite }) => {
    // Test nur für Desktop
    test.skip(viewportBreite < BREAKPOINTS.mobile, 'Nur für Desktop relevant');

    await oeffneSeite('/index.html');

    const position = await page.evaluate(() => {
      const header = document.querySelector('#header');
      const nav = document.querySelector('#header ul');
      const slogan = document.querySelector('#slogan');

      const headerRect = header.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const sloganRect = slogan.getBoundingClientRect();

      return {
        headerBottom: headerRect.bottom,
        navTop: navRect.top,
        navBottom: navRect.bottom,
        sloganTop: sloganRect.top
      };
    });

    // Navigation muss vollständig im Header sein (über dem Slogan)
    expect(position.navBottom, 'Navigation muss oberhalb des Slogans enden')
      .toBeLessThanOrEqual(position.sloganTop);
    expect(position.navTop, 'Navigation muss innerhalb des Headers beginnen')
      .toBeGreaterThanOrEqual(0);
  });
});
