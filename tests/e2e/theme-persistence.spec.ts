import { test, expect } from '@playwright/test'

test.describe('MYM-71 Theme Persistence', () => {
  test('applies saved dark theme before paint (no FOUC)', async ({ page, baseURL }) => {
    // Seed theme before any script runs
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('theme', 'dark')
      } catch {}
    })

    const res = await page.goto(baseURL || '/')
    expect(res?.ok()).toBeTruthy()

    // Check html class contains dark very early
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(hasDark).toBe(true)

    // Ensure no console errors related to hydration/theme
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    // A small interaction to allow potential hydration to happen
    await page.waitForTimeout(100)
    expect(errors.join('\n')).not.toMatch(/hydration|theme|next-themes/i)
  })

  test('persists across navigation', async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      try { window.localStorage.setItem('theme', 'dark') } catch {}
    })
    await page.goto(baseURL || '/')
    await page.goto((baseURL || '') + '/mentors')
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(true)
  })

  test('clearing localStorage resets to system/default', async ({ page, baseURL }) => {
    // Start dark
    await page.addInitScript(() => {
      try { window.localStorage.setItem('theme', 'dark') } catch {}
    })
    await page.goto(baseURL || '/')

    // Emulate system light and clear storage, then reload
    await page.emulateMedia({ colorScheme: 'light' })
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(false)
  })

  test('toggle saves theme and applies across reload + nav', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/')

    // Click Dark
    await page.getByTestId('set-dark').click()

    // Validate storage and class
    const stored = await page.evaluate(() => window.localStorage.getItem('theme'))
    expect(stored).toBe('dark')
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)

    // Reload and verify persistence
    await page.reload()
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)

    // Navigate and verify persistence
    await page.goto((baseURL || '') + '/mentors')
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true)
  })
})
