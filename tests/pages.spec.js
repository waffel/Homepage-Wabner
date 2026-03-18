/**
 * Seiten-Tests: Alle Seiten erreichbar
 */

const { test, expect, SEITEN } = require('./fixtures');

test.describe('Alle Seiten sind erreichbar', () => {

  for (const seite of SEITEN) {
    test(`${seite.name} lädt erfolgreich`, async ({ request, baseURL }) => {
      const response = await request.get(`${baseURL}${seite.pfad}`);
      expect(response.status(), `${seite.name} sollte HTTP 200 liefern`).toBe(200);
    });
  }
});

test.describe('Seiten-Inhalte', () => {

  test('Startseite zeigt Begrüßung', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index2.html');

    await expect(page.locator('h1')).toContainText('Willkommen');
  });

  test('Kontaktdaten sind sichtbar', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index2.html');

    await expect(page.locator('#sidebar-content')).toContainText('Telefon');
    await expect(page.locator('#sidebar-content')).toContainText('0341');
  });

  test('Anfahrtskarte ist vorhanden', async ({ page, oeffneSeite }) => {
    await oeffneSeite('/index2.html');

    const karte = page.locator('img[alt*="Anfahrt"], img[alt*="karte"]');
    await expect(karte).toBeVisible();
  });
});
