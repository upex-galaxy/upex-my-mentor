import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage before each test to ensure a clean state
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });

    // 1. Check initial theme (assuming default is light)
    await expect(html).not.toHaveClass(/dark/);

    // 2. Toggle to dark mode
    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);

    // 3. Verify persistence in local storage
    const themeInStorage = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeInStorage).toBe('dark');

    // 4. Toggle back to light mode
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
    const themeInStorage2 = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeInStorage2).toBe('light');
  });

  test('should load the saved theme from local storage on navigation', async ({ page }) => {
    // 1. Set theme to dark and verify
    await page.goto('/');
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    const html = page.locator('html');

    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);
    
    // 2. Navigate to another page and check if theme persists
    await page.getByRole('link', { name: 'Explorar Mentores' }).click();
    await page.waitForURL('**/mentors');
    
    // 3. Verify the theme is still dark
    await expect(html).toHaveClass(/dark/);
  });
});
