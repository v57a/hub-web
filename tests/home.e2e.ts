import { expect, test } from '@playwright/test';

/**
 * Navigation between the three pages via the toolbar.
 * BUG-01 (known, still open): "Download" and "Open" are <div> elements without a
 * handler or href, so they are deliberately NOT asserted here — they fail on click.
 * This suite covers what is supposed to work.
 */

test.describe('toolbar navigation', () => {
  test('wordmark returns to the home page from /pricing', async ({ page }) => {
    await page.goto('/pricing');
    await page.locator('[data-testid="toolbar"] .toolbar__wordmark').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Get started in seconds')).toBeVisible();
  });

  test('Pricing and Feedback links open their pages and show the page name', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-testid="toolbar"]').getByText('Pricing', { exact: true }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator('.toolbar__page-name')).toHaveText('Pricing');

    await page.locator('[data-testid="toolbar"]').getByText('Feedback', { exact: true }).click();
    await expect(page).toHaveURL(/\/feedback$/);
    await expect(page.locator('.toolbar__page-name')).toHaveText('Feedback');
  });

  test('every page answers 200 and renders the toolbar', async ({ page }) => {
    for (const path of ['/', '/pricing', '/feedback']) {
      const response = await page.goto(path);
      expect(response?.status(), `status for ${path}`).toBe(200);
      await expect(page.locator('[data-testid="toolbar"]')).toBeVisible();
    }
  });
});

test.describe('home page content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero lists the eight supported platforms', async ({ page }) => {
    const labels = page.locator('.platforms .platform .platform-name');
    await expect(labels).toHaveText(['macOS', 'iOS', 'tvOS', 'visionOS', 'watchOS', 'Windows', 'Linux', 'Web']);
  });

  test('every platform icon matches its own label', async ({ page }) => {
    // Guards the mapping in src/lib/components/home/content.ts. The asset files are
    // named differently from what they draw (see qa/Hub-QA-documentation.md, BUG-09),
    // so this test pins the *behaviour* (right picture next to the right label).
    const rows = page.locator('.platforms .platform');
    const expected: Record<string, RegExp> = {
      macOS: /ios\.svg$/,
      iOS: /watchos\.svg$/,
      tvOS: /tvos\.svg$/,
      visionOS: /web\.svg$/,
      watchOS: /linux\.svg$/,
      Windows: /windows\.svg$/,
      Linux: /macos\.svg$/,
      Web: /visionos\.svg$/
    };

    const count = await rows.count();
    expect(count).toBe(8);

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const label = (await row.locator('.platform-name').innerText()).trim();
      const src = await row.locator('img').getAttribute('src');
      expect(src, `icon for ${label}`).toMatch(expected[label]);
    }
  });

  test('Get started switches the instructions per platform', async ({ page }) => {
    // Scope to the visible instruction stack: the component also renders hidden
    // measurement markup (aria-hidden) for every platform, so the whole section
    // always contains all three sets of commands.
    const instructions = page.locator('.instructions');

    await expect(instructions).toContainText('curl -fsSL https://bun.sh/install | bash');
    await expect(instructions).toContainText('Terminal');

    await page.locator('button.chip', { hasText: 'Docker' }).click();
    await expect(instructions).toContainText('docker pull v57dev/hub');
    await expect(instructions).toContainText('Docker allows to run Hub server on a virtual machine');
    await expect(instructions).not.toContainText('curl -fsSL');

    await page.locator('button.chip', { hasText: 'Windows' }).click();
    await expect(instructions).toContainText('powershell -c "irm bun.sh/install.ps1 | iex"');
    await expect(instructions).toContainText('Powershell');
    await expect(instructions).not.toContainText('docker pull');
  });

  test('the copy button next to a command is a real button and reports the result', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');

    const context = page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const step = page.locator('.instructions .step-container').first();
    const copyButton = step.locator('button[aria-label^="Copy"]');

    await expect(copyButton).toHaveAttribute('type', 'button');
    await copyButton.click();

    await expect(step.locator('.platform-name.copied-label')).toHaveText('Copied');
    await expect(copyButton).toHaveAttribute('aria-label', /Copy .* command/);
  });

  test('the selected chip is the only highlighted one', async ({ page }) => {
    await page.locator('button.chip', { hasText: 'Docker' }).click();

    const selected = page.locator('button.chip.selected');
    await expect(selected).toHaveCount(1);
    await expect(selected).toHaveText('Docker');
  });

  test('feature grid and How Hub works grid have the expected counts', async ({ page }) => {
    await expect(page.getByText('Keep exploring Hub')).toBeVisible();
    await expect(page.getByText('How Hub works')).toBeVisible();
    // titles rendered from featureCards (6) and buildCards (5)
    for (const title of ['Channel', 'Hub Lite', 'Hub Pro', 'Hub Service', 'Hub Launcher', 'Hub Web']) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }
    for (const title of ['Worker SDK', 'Production control', 'Services SDK', 'Transport', 'Operations']) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }
  });
});