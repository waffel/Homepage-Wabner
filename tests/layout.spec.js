/**
 * Layout-Tests: Kein horizontales Scrollen, Bilder passen
 */

const { test, expect, SEITEN, hatHorizontalenOverflow } = require('./fixtures');

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
