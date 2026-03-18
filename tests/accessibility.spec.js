/**
 * Barrierefreiheit-Tests: Lesbarkeit, Viewport-Meta, Touch-Targets
 */

const { test, expect, SEITEN } = require('./fixtures');

test.describe('Barrierefreiheit', () => {

  test.describe('Lesbarkeit', () => {

    test('Schriftgröße ist mindestens 16px', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(!istMobil, 'Schriftgrößen-Test nur auf Mobile relevant');

      await oeffneSeite('/index2.html');

      const schriftgroesse = await page.evaluate(() => {
        return parseFloat(window.getComputedStyle(document.body).fontSize);
      });

      expect(schriftgroesse, 'Basis-Schriftgröße sollte ≥16px sein').toBeGreaterThanOrEqual(16);
    });
  });

  test.describe('Viewport-Meta-Tag', () => {

    for (const seite of SEITEN) {
      test(`${seite.name} hat korrekten Viewport-Tag`, async ({ page, oeffneSeite }) => {
        await oeffneSeite(seite.pfad);

        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

        expect(viewport).toContain('width=device-width');
        expect(viewport).toContain('initial-scale=1');
        expect(viewport, 'Zoom sollte nicht deaktiviert sein').not.toContain('user-scalable=0');
        expect(viewport, 'Zoom sollte nicht deaktiviert sein').not.toContain('maximum-scale=1');
      });
    }
  });

  test.describe('Touch-Targets', () => {

    test('Menü-Links haben ausreichende Tap-Größe', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(!istMobil, 'Touch-Target-Test nur auf Mobile');

      await oeffneSeite('/index2.html');

      // Menü öffnen
      await page.locator('.nav-toggle').click();

      const links = await page.locator('#header ul a').all();

      for (const link of links) {
        const box = await link.boundingBox();
        if (box) {
          // WCAG empfiehlt mindestens 44x44px
          expect(box.height, 'Link-Höhe sollte ≥44px sein').toBeGreaterThanOrEqual(40);
        }
      }
    });

    test('Footer-Links haben ausreichende Tap-Größe', async ({ page, oeffneSeite, istMobil }) => {
      test.skip(!istMobil, 'Touch-Target-Test nur auf Mobile');

      await oeffneSeite('/index2.html');

      const footerLinks = await page.locator('#footer_text a').all();

      for (const link of footerLinks) {
        const box = await link.boundingBox();
        if (box) {
          expect(box.height, 'Footer-Link sollte ≥44px hoch sein').toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Semantik', () => {

    for (const seite of SEITEN) {
      test(`${seite.name} hat eine H1-Überschrift`, async ({ page, oeffneSeite }) => {
        await oeffneSeite(seite.pfad);

        const h1 = page.locator('h1');
        await expect(h1, 'Seite sollte eine H1 haben').toHaveCount(1);
      });
    }

    test('HTML hat lang-Attribut', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');

      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, 'HTML sollte lang="de" haben').toBe('de');
    });

    test('Bilder haben Alt-Text', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');

      const bilder = await page.locator('img').all();

      for (const bild of bilder) {
        const alt = await bild.getAttribute('alt');
        expect(alt, 'Jedes Bild sollte alt-Attribut haben').toBeTruthy();
      }
    });
  });

  test.describe('HTML5-Struktur', () => {

    for (const seite of SEITEN) {
      test(`${seite.name} hat semantische HTML5-Elemente`, async ({ page, oeffneSeite }) => {
        await oeffneSeite(seite.pfad);

        // Prüfe semantische Elemente
        await expect(page.locator('header#header'), 'Seite braucht <header>').toHaveCount(1);
        await expect(page.locator('header nav'), 'Header braucht <nav>').toHaveCount(1);
        await expect(page.locator('main#real-content'), 'Seite braucht <main>').toHaveCount(1);
        await expect(page.locator('aside#sidebar-wrapper'), 'Seite braucht <aside>').toHaveCount(1);
        await expect(page.locator('footer#footer'), 'Seite braucht <footer>').toHaveCount(1);
      });
    }

    test('DOCTYPE ist HTML5', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');

      const doctype = await page.evaluate(() => {
        const node = document.doctype;
        return node ? node.name : null;
      });

      expect(doctype, 'DOCTYPE sollte html sein').toBe('html');
    });

    test('Navigation enthält alle Menüpunkte', async ({ page, oeffneSeite, istMobil }) => {
      await oeffneSeite('/index2.html');

      // Auf Mobile: Menü öffnen damit Links sichtbar werden
      if (istMobil) {
        await page.locator('.nav-toggle').click();
        await page.waitForTimeout(300);
      }

      const navLinks = page.locator('header nav ul li a');
      await expect(navLinks, 'Navigation sollte 6 Links haben').toHaveCount(6);

      // Prüfe Menüpunkte
      const erwarteteLinks = ['Start', 'Osteopathie', 'Kinesiologie', 'Über mich', 'Praxis', 'Kosten'];
      for (const text of erwarteteLinks) {
        await expect(page.locator(`header nav a:has-text("${text}")`), `Menüpunkt "${text}" fehlt`).toBeVisible();
      }
    });

    test('Kontaktbereich ist in aside', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');

      const sidebar = page.locator('aside#sidebar-wrapper');
      await expect(sidebar, 'Sidebar sollte existieren').toBeVisible();

      // Prüfe dass Kontaktdaten in der Sidebar sind
      await expect(sidebar.locator('text=Leipziger Strasse 43')).toBeVisible();
      await expect(sidebar.locator('text=04451')).toBeVisible();
    });

    test('Footer enthält Impressum und Datenschutz Links', async ({ page, oeffneSeite }) => {
      await oeffneSeite('/index2.html');

      const footer = page.locator('footer#footer');
      await expect(footer.locator('a[href="impressum.html"]'), 'Impressum-Link fehlt').toBeVisible();
      await expect(footer.locator('a[href="dsvgo.html"]'), 'Datenschutz-Link fehlt').toBeVisible();
    });
  });
});
