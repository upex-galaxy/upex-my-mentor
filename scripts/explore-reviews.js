// Playwright exploration script for MYM-35
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('🚀 Iniciando exploración de MYM-35...');

  try {
    // 1. Navigate to mentors list
    console.log('\n📍 Navegando a /mentors...');
    await page.goto('http://localhost:3000/mentors', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'scripts/screenshots/01-mentors-list.png', fullPage: true });
    console.log('✓ Screenshot: mentors-list.png');

    // 2. Get first mentor link
    const mentorLinks = await page.$$eval('a[href^="/mentors/"]', links =>
      links.map(l => l.getAttribute('href')).filter(href => href && href !== '/mentors')
    );

    if (mentorLinks.length === 0) {
      console.log('❌ No se encontraron mentores');
      await browser.close();
      return;
    }

    const firstMentorUrl = mentorLinks[0];
    console.log(`\n📍 Navegando a perfil de mentor: ${firstMentorUrl}`);

    // 3. Navigate to mentor profile
    await page.goto(`http://localhost:3000${firstMentorUrl}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'scripts/screenshots/02-mentor-profile-full.png', fullPage: true });
    console.log('✓ Screenshot: mentor-profile-full.png');

    // 4. Check if reviews section exists
    const reviewsSection = await page.$('[data-testid="reviews_section"]');
    if (reviewsSection) {
      console.log('✅ Sección de reviews encontrada');

      // Screenshot of reviews section specifically
      await reviewsSection.screenshot({ path: 'scripts/screenshots/03-reviews-section.png' });
      console.log('✓ Screenshot: reviews-section.png');

      // Check rating display
      const ratingDisplay = await page.$('[data-testid="rating-display"]');
      if (ratingDisplay) {
        const ratingText = await ratingDisplay.textContent();
        console.log(`✅ Rating display: ${ratingText.trim()}`);
        await ratingDisplay.screenshot({ path: 'scripts/screenshots/04-rating-display.png' });
      }

      // Check rating breakdown
      const ratingBreakdown = await page.$('[data-testid="rating-breakdown"]');
      if (ratingBreakdown) {
        console.log('✅ Rating breakdown encontrado');
        await ratingBreakdown.screenshot({ path: 'scripts/screenshots/05-rating-breakdown.png' });
      }

      // Check review cards
      const reviewCards = await page.$$('[data-testid="review-card"]');
      console.log(`✅ Reviews encontrados: ${reviewCards.length}`);
      if (reviewCards.length > 0) {
        await reviewCards[0].screenshot({ path: 'scripts/screenshots/06-review-card-example.png' });
      }

      // Check pagination
      const pagination = await page.$('[data-testid="reviews-pagination"]');
      if (pagination) {
        console.log('✅ Paginación encontrada');
        await pagination.screenshot({ path: 'scripts/screenshots/07-pagination.png' });
      } else {
        console.log('ℹ️  No hay paginación (menos de 10 reviews)');
      }

    } else {
      // Check for empty state
      const emptyState = await page.$('[data-testid="reviews-empty-state"]');
      if (emptyState) {
        console.log('✅ Empty state encontrado');
        await emptyState.screenshot({ path: 'scripts/screenshots/03-empty-state.png' });
      }
    }

    // 5. Mobile responsive test
    console.log('\n📱 Probando responsive mobile...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'scripts/screenshots/08-mobile-full.png', fullPage: true });
    console.log('✓ Screenshot: mobile-full.png');

    if (reviewsSection) {
      await reviewsSection.screenshot({ path: 'scripts/screenshots/09-mobile-reviews.png' });
      console.log('✓ Screenshot: mobile-reviews.png');
    }

    console.log('\n✅ Exploración completada');
    console.log('📁 Screenshots guardados en: scripts/screenshots/');

  } catch (error) {
    console.error('❌ Error durante exploración:', error);
  } finally {
    await browser.close();
  }
})();
