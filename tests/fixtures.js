/**
 * Test-Fixtures für Praxis Wabner
 *
 * Gemeinsame Daten und Hilfsfunktionen für alle Tests.
 */

const { test: base, expect } = require('@playwright/test');

// ============================================================================
// Seiten der Website
// ============================================================================

const SEITEN = [
  { pfad: '/',                  name: 'Startseite',       hatBild: true },
  { pfad: '/index2.html',       name: 'Startseite (Alt)', hatBild: true },
  { pfad: '/osteopathie.html',  name: 'Osteopathie',      hatBild: false },
  { pfad: '/kinesiologie.html', name: 'Kinesiologie',     hatBild: false },
  { pfad: '/about_me.html',     name: 'Über mich',        hatBild: true },
  { pfad: '/praxis.html',       name: 'Praxis & Anfahrt', hatBild: false },
  { pfad: '/kosten.html',       name: 'Kosten',           hatBild: false },
  { pfad: '/impressum.html',    name: 'Impressum',        hatBild: false },
  { pfad: '/dsvgo.html',        name: 'Datenschutz',      hatBild: false },
];

// ============================================================================
// Menüpunkte
// ============================================================================

const MENUEPUNKTE = [
  { text: 'Start',       link: 'index2.html' },
  { text: 'Osteopathie', link: 'osteopathie.html' },
  { text: 'Kinesiologie', link: 'kinesiologie.html' },
  { text: 'Über mich',   link: 'about_me.html' },
  { text: 'Praxis',      link: 'praxis.html' },
  { text: 'Kosten',      link: 'kosten.html' },
];

// ============================================================================
// Breakpoints
// ============================================================================

const BREAKPOINTS = {
  mobile: 768,   // Unter 768px = Mobile (Hamburger-Menü)
  tablet: 1024,  // 768-1024px = Tablet
  desktop: 1024, // Ab 1024px = Desktop
};

// ============================================================================
// Custom Test mit Fixtures
// ============================================================================

const test = base.extend({
  /**
   * Fixture: Gibt an ob das aktuelle Gerät "mobile" ist
   */
  istMobil: async ({ viewport }, use) => {
    await use(viewport && viewport.width < BREAKPOINTS.mobile);
  },

  /**
   * Fixture: Gibt an ob das aktuelle Gerät ein Tablet ist
   */
  istTablet: async ({ viewport }, use) => {
    const breite = viewport?.width || 1024;
    await use(breite >= BREAKPOINTS.mobile && breite < BREAKPOINTS.desktop);
  },

  /**
   * Fixture: Aktuelle Viewport-Breite
   */
  viewportBreite: async ({ viewport }, use) => {
    await use(viewport?.width || 1024);
  },

  /**
   * Fixture: Öffnet eine Seite und wartet auf vollständiges Laden
   */
  oeffneSeite: async ({ page, baseURL }, use) => {
    const oeffne = async (pfad) => {
      const url = pfad.startsWith('http') ? pfad : `${baseURL}${pfad}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(100); // CSS anwenden lassen
      return page;
    };
    await use(oeffne);
  },
});

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/**
 * Prüft ob eine Seite horizontalen Overflow hat
 */
async function hatHorizontalenOverflow(page) {
  const scrollBreite = await page.evaluate(() => document.documentElement.scrollWidth);
  const sichtbareBreite = await page.evaluate(() => document.documentElement.clientWidth);
  return scrollBreite > sichtbareBreite + 1;
}

/**
 * Prüft ob ein Element im sichtbaren Bereich liegt
 */
async function istImViewport(element, viewportHoehe) {
  const box = await element.boundingBox();
  if (!box) return false;
  return box.y >= 0 && (box.y + box.height) <= viewportHoehe;
}

/**
 * Öffnet das mobile Menü falls nötig
 */
async function oeffneMobileMenue(page) {
  const hamburger = page.locator('.nav-toggle');
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(100);
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  test,
  expect,
  SEITEN,
  MENUEPUNKTE,
  BREAKPOINTS,
  hatHorizontalenOverflow,
  istImViewport,
  oeffneMobileMenue,
};
