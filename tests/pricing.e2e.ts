import { expect, test } from '@playwright/test';

/**
 * Pricing page and cross-page checks.
 * KNOWN BUG BUG-02: "Download Lite" / "Download Pro" are <div> elements with no
 * handler and no href — the tests below assert the markup, which fails until fixed.
 * KNOWN BUG BUG-08: no <title>, no headings, empty alt on every image.
 */

test.describe('pricing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('shows both plans and their feature lists', async ({ page }) => {
    await expect(page.getByText('Hub Lite', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Hub Pro', { exact: true }).first()).toBeVisible();

    for (const feature of ['Authorization', 'Permission Groups', 'Whitelist Mode', 'Advanced Load Balancing', 'Proxy to Another Hub', 'Merge Hubs']) {
      await expect(page.getByText(feature, { exact: true }).first()).toBeVisible();
    }
  });

  test('support links point at their own destinations', async ({ page }) => {
    const expected: Record<string, RegExp> = {
      Discord: /discord\.com/,
      Patreon: /patreon\.com/,
      Boosty: /boosty\.to/,
      GitHub: /github\.com/,
      'Buy Me a Coffee': /buymeacoffee\.com/,
      'Ko-Fi': /ko-fi\.com/
    };

    for (const [label, pattern] of Object.entries(expected)) {
      await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', pattern);
    }
  });

  test('KNOWN BUG BUG-02: the download CTAs are real links or buttons', async ({ page }) => {
    // Expected: <a href> or <button>. Actual: <div class="buttonget2/4">.
    await expect(page.getByText('Download Lite', { exact: true }).first()).toHaveRole('link');
    await expect(page.getByText('Download Pro', { exact: true }).first()).toHaveRole('link');
  });
});

test.describe('cross-page basics', () => {
  test('KNOWN BUG BUG-08: each page has a non-empty document title', async ({ page }) => {
    for (const path of ['/', '/pricing', '/feedback']) {
      await page.goto(path);
      await expect(page).toHaveTitle(/\S/);
    }
  });

  test('KNOWN BUG BUG-08: each page has an h1', async ({ page }) => {
    for (const path of ['/', '/pricing', '/feedback']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('no horizontal scroll at the project viewport', async ({ page }, testInfo) => {
    for (const path of ['/', '/pricing', '/feedback']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow on ${path} (${testInfo.project.name})`).toBeLessThanOrEqual(1);
    }
  });

  test('KNOWN BUG BUG-05: the primary CTA stays in the toolbar on mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only check');

    await page.goto('/');
    await expect(page.locator('[data-testid="toolbar"]').getByText('Download', { exact: true })).toBeVisible();
  });
});