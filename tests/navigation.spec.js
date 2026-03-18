/**
 * Navigation-Tests: Hamburger-Menü, Menüpunkte
 */

const { test, expect, MENUEPUNKTE, oeffneMobileMenue, istImViewport } = require('./fixtures');

test.describe('Navigation', () => {

  test.describe('Hamburger-Menü', () => {

    test('ist auf mobilen Geräten sichtbar', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(!istMobil, 'Nur für mobile Geräte');

      await oeffneSeite('/index2.html');
      await expect(page.locator('.nav-toggle')).toBeVisible();
    });

    test('ist auf Desktop versteckt', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(istMobil, 'Nur für Desktop');

      await oeffneSeite('/index2.html');
      await expect(page.locator('.nav-toggle')).toBeHidden();
    });

    test('öffnet und schließt das Menü', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(!istMobil, 'Nur für mobile Geräte');

      await oeffneSeite('/index2.html');

      const menue = page.locator('#header ul');
      const hamburger = page.locator('.nav-toggle');

      // Menü ist anfangs geschlossen
      await expect(menue).toBeHidden();

      // Klick öffnet
      await hamburger.click();
      await expect(menue).toBeVisible();

      // Nochmal klicken schließt
      await hamburger.click();
      await expect(menue).toBeHidden();
    });
  });

  test.describe('Menüpunkte', () => {

    test('alle 6 Punkte sind erreichbar', async ({ page, oeffneSeite, viewport }) => {
      await oeffneSeite('/index2.html');
      await oeffneMobileMenue(page);

      for (const punkt of MENUEPUNKTE) {
        const link = page.locator(`#header ul a:has-text("${punkt.text}")`);

        await expect(link, `"${punkt.text}" sollte sichtbar sein`).toBeVisible();

        // Auf Mobilgeräten: Prüfen ob nicht abgeschnitten
        if (viewport && viewport.width < 768) {
          const imViewport = await istImViewport(link, viewport.height);
          expect(imViewport, `"${punkt.text}" sollte im sichtbaren Bereich sein`).toBe(true);
        }
      }
    });

    test('Navigation führt zur richtigen Seite', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');
      await oeffneMobileMenue(page);

      // Klick auf "Osteopathie"
      await page.locator('#header ul a:has-text("Osteopathie")').click();

      await expect(page).toHaveURL(/osteopathie\.html/);
    });
  });
});
