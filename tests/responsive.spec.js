/**
 * Responsive Design Tests für Praxis Wabner
 *
 * Diese Tests prüfen die Definition of Done für das responsive Design.
 *
 * Ausführung: bash test.sh (Server muss laufen: mvn tomcat7:run)
 */

const { test, expect } = require('@playwright/test');

// ============================================================================
// Konfiguration
// ============================================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/praxis-wabner';

/** Alle Seiten der Praxis-Website */
const SEITEN = [
  { pfad: '/',                  name: 'Startseite' },
  { pfad: '/index2.html',       name: 'Startseite (Alt)' },
  { pfad: '/osteopathie.html',  name: 'Osteopathie' },
  { pfad: '/kinesiologie.html', name: 'Kinesiologie' },
  { pfad: '/about_me.html',     name: 'Über mich' },
  { pfad: '/praxis.html',       name: 'Praxis & Anfahrt' },
  { pfad: '/kosten.html',       name: 'Kosten' },
  { pfad: '/impressum.html',    name: 'Impressum' },
  { pfad: '/dsvgo.html',        name: 'Datenschutz' },
];

/** Typische Geräte zum Testen */
const GERAETE = {
  iPhoneSE:      { breite: 320,  hoehe: 568,  name: 'iPhone SE' },
  iPhone14:      { breite: 390,  hoehe: 844,  name: 'iPhone 14' },
  iPad:          { breite: 768,  hoehe: 1024, name: 'iPad' },
  desktop:       { breite: 1024, hoehe: 768,  name: 'Desktop' },
  desktopGross:  { breite: 1440, hoehe: 900,  name: 'Desktop (groß)' },
};

/** Die 6 Hauptmenüpunkte */
const MENUEPUNKTE = ['Start', 'Osteopathie', 'Kinesiologie', 'Über mich', 'Praxis', 'Kosten'];

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/** Öffnet eine Seite mit bestimmter Bildschirmgröße */
async function oeffneSeite(browser, geraet, pfad) {
  const context = await browser.newContext({
    viewport: { width: geraet.breite, height: geraet.hoehe },
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${pfad}`, { waitUntil: 'networkidle' });
  // Warte kurz damit CSS vollständig angewendet wird
  await page.waitForTimeout(100);
  return { page, context };
}

/** Prüft ob horizontales Scrollen nötig ist */
async function hatHorizontalenOverflow(page) {
  const scrollBreite = await page.evaluate(() => document.documentElement.scrollWidth);
  const sichtbareBreite = await page.evaluate(() => document.documentElement.clientWidth);
  return scrollBreite > sichtbareBreite + 1; // 1px Toleranz
}

// ============================================================================
// Tests: Kein horizontales Scrollen
// ============================================================================

test.describe('Kein horizontales Scrollen', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const geraet of Object.values(GERAETE)) {
    for (const seite of SEITEN) {
      test(`${seite.name} auf ${geraet.name}`, async ({ browser }) => {
        const { page, context } = await oeffneSeite(browser, geraet, seite.pfad);

        const overflow = await hatHorizontalenOverflow(page);
        expect(overflow, `Seite "${seite.name}" sollte auf ${geraet.name} nicht horizontal scrollen`).toBe(false);

        await context.close();
      });
    }
  }
});

// ============================================================================
// Tests: Navigation / Hamburger-Menü
// ============================================================================

test.describe('Navigation', () => {

  test('Hamburger-Menü ist auf dem Handy sichtbar', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.iPhone14, '/index2.html');

    const hamburger = page.locator('.nav-toggle');
    await expect(hamburger).toBeVisible();

    await context.close();
  });

  test('Hamburger-Menü ist auf dem Desktop versteckt', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.desktop, '/index2.html');

    const hamburger = page.locator('.nav-toggle');
    await expect(hamburger).toBeHidden();

    await context.close();
  });

  test('Menü öffnet und schließt bei Klick auf Hamburger', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.iPhone14, '/index2.html');

    const menue = page.locator('#header ul');
    const hamburger = page.locator('.nav-toggle');

    // Menü ist anfangs geschlossen
    await expect(menue).toBeHidden();

    // Klick öffnet das Menü
    await hamburger.click();
    await expect(menue).toBeVisible();

    // Nochmal klicken schließt es wieder
    await hamburger.click();
    await expect(menue).toBeHidden();

    await context.close();
  });

  test('Menü ist auf Desktop direkt sichtbar (ohne Hamburger)', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.desktop, '/index2.html');

    const menue = page.locator('#header ul');
    await expect(menue).toBeVisible();

    await context.close();
  });

  test('Alle 6 Menüpunkte sind auf dem Handy erreichbar', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.iPhone14, '/index2.html');

    // Menü öffnen
    await page.locator('.nav-toggle').click();

    // Jeden Menüpunkt prüfen
    for (const punkt of MENUEPUNKTE) {
      const link = page.locator(`#header ul a:has-text("${punkt}")`);

      await expect(link, `Menüpunkt "${punkt}" sollte sichtbar sein`).toBeVisible();

      // Prüfen ob der Punkt im sichtbaren Bereich liegt (nicht abgeschnitten)
      const box = await link.boundingBox();
      expect(box, `Menüpunkt "${punkt}" sollte eine Position haben`).not.toBeNull();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(GERAETE.iPhone14.hoehe);
    }

    await context.close();
  });

  test('Alle 6 Menüpunkte sind auf Desktop sichtbar', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.desktop, '/index2.html');

    for (const punkt of MENUEPUNKTE) {
      const link = page.locator(`#header ul a:has-text("${punkt}")`);
      await expect(link, `Menüpunkt "${punkt}" sollte sichtbar sein`).toBeVisible();
    }

    await context.close();
  });
});

// ============================================================================
// Tests: Responsive Bilder
// ============================================================================

test.describe('Bilder passen in den Bildschirm', () => {

  const mobileGeraete = [GERAETE.iPhoneSE, GERAETE.iPhone14, GERAETE.iPad];

  for (const geraet of mobileGeraete) {
    test(`Bilder auf ${geraet.name} nicht breiter als Bildschirm`, async ({ browser }) => {
      const { page, context } = await oeffneSeite(browser, geraet, '/index2.html');

      const bilder = await page.locator('img').all();

      for (const bild of bilder) {
        const box = await bild.boundingBox();
        if (box) {
          expect(box.width, 'Bild sollte nicht breiter als Bildschirm sein')
            .toBeLessThanOrEqual(geraet.breite);
        }
      }

      await context.close();
    });
  }
});

// ============================================================================
// Tests: Lesbarkeit
// ============================================================================

test.describe('Text ist lesbar', () => {

  test('Schriftgröße auf Handy mindestens 16px', async ({ browser }) => {
    const { page, context } = await oeffneSeite(browser, GERAETE.iPhone14, '/index2.html');

    const schriftgroesse = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.body).fontSize);
    });

    expect(schriftgroesse, 'Basis-Schriftgröße sollte mindestens 16px sein')
      .toBeGreaterThanOrEqual(16);

    await context.close();
  });
});

// ============================================================================
// Tests: Alle Seiten erreichbar
// ============================================================================

test.describe('Alle Seiten laden', () => {

  for (const seite of SEITEN) {
    test(`${seite.name} ist erreichbar`, async ({ request }) => {
      const response = await request.get(`${BASE_URL}${seite.pfad}`);
      expect(response.status(), `${seite.name} sollte HTTP 200 zurückgeben`).toBe(200);
    });
  }
});

// ============================================================================
// Tests: Mobile-Optimierung
// ============================================================================

test.describe('Mobile-Optimierung', () => {

  for (const seite of SEITEN) {
    test(`${seite.name} hat korrekten Viewport-Meta-Tag`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${seite.pfad}`);

      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

      expect(viewport, 'Viewport sollte width=device-width haben').toContain('width=device-width');
      expect(viewport, 'Viewport sollte initial-scale=1 haben').toContain('initial-scale=1');
      expect(viewport, 'Zoom sollte erlaubt sein (Barrierefreiheit)').not.toContain('user-scalable=0');

      await context.close();
    });
  }
});
