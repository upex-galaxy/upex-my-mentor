// Script to capture bug evidence for Jira
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🚀 Capturando evidencias de bugs en staging...');

  try {
    const mentorUrl = 'https://staging-upexmymentor.vercel.app/mentors/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

    // Navigate to mentor profile
    console.log('\n📍 Navegando al perfil de mentor...');
    await page.goto(mentorUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for reviews section
    await page.waitForSelector('[data-testid="reviews_section"]', { timeout: 10000 });

    // Bug #1: Rating Breakdown sin porcentaje
    console.log('\n📸 Bug #1: Capturando Rating Breakdown (sin porcentaje visible)');
    const ratingBreakdown = await page.$('[data-testid="rating-breakdown"]');
    if (ratingBreakdown) {
      await ratingBreakdown.screenshot({
        path: 'scripts/screenshots/bug-1-rating-breakdown-no-percentage.png'
      });
      console.log('✓ Screenshot guardado: bug-1-rating-breakdown-no-percentage.png');
    }

    // Bug #2: Select component (HTML nativo)
    console.log('\n📸 Bug #2: Capturando Sort Dropdown (select HTML nativo)');
    const reviewsList = await page.$('[data-testid="reviews-list"]');
    if (reviewsList) {
      // Highlight the select elements
      await page.evaluate(() => {
        const selects = document.querySelectorAll('[data-testid="reviews-list"] select');
        selects.forEach(select => {
          select.style.border = '2px solid red';
        });
      });

      await reviewsList.screenshot({
        path: 'scripts/screenshots/bug-2-select-html-native.png'
      });
      console.log('✓ Screenshot guardado: bug-2-select-html-native.png');
    }

    // Bug #3: Flag button (sin funcionalidad)
    console.log('\n📸 Bug #3: Capturando Review Card con Flag button');
    const reviewCard = await page.$('[data-testid="review-card"]');
    if (reviewCard) {
      // Highlight flag button
      await page.evaluate(() => {
        const flagButton = document.querySelector('[data-testid="review-card"] button[aria-label="Reportar review"]');
        if (flagButton) {
          flagButton.style.border = '2px solid red';
          flagButton.style.borderRadius = '4px';
        }
      });

      await reviewCard.screenshot({
        path: 'scripts/screenshots/bug-3-flag-button-no-functionality.png'
      });
      console.log('✓ Screenshot guardado: bug-3-flag-button-no-functionality.png');
    }

    // Full page screenshot for context
    console.log('\n📸 Capturando página completa para contexto...');
    await page.screenshot({
      path: 'scripts/screenshots/full-page-context.png',
      fullPage: true
    });
    console.log('✓ Screenshot guardado: full-page-context.png');

    console.log('\n✅ Todas las evidencias capturadas exitosamente');
    console.log('📁 Screenshots guardados en: scripts/screenshots/');

  } catch (error) {
    console.error('❌ Error capturando evidencias:', error.message);
  } finally {
    await browser.close();
  }
})();
