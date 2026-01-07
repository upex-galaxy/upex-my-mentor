import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Upex/);
});

test('landing page has a call to action button', async ({ page }) => {
  await page.goto('/');

  // Expect the main call to action button to be visible
  const ctaButton = page.getByRole('button', { name: /Encuentra tu mentor/i });
  await expect(ctaButton).toBeVisible();
});
