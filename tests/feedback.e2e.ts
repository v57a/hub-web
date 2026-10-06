import { expect, test } from '@playwright/test';

/**
 * Feedback page. Two known defects are documented in qa/Hub-QA-documentation.md and
 * are asserted here so the failure is visible instead of silent:
 *   BUG-07 — filter chips and sort options change only the highlight, the list never changes
 *   BUG-06 — the round "+" does not submit the typed text
 * Until they are fixed these two tests fail on purpose; they are the reproduction.
 */

const CARD_TITLES = /About this platform|User Feedback|Bug Reports|User Tutorials|Community Guidelines|Platform Updates/g;

test.describe('feedback page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feedback');
  });

  test('renders the composer, the filter chips and the card list', async ({ page }) => {
    await expect(page.getByPlaceholder('Describe your issue or suggestion')).toBeVisible();
    await expect(page.locator('.filtersearch button')).toHaveText(['All', 'New features', 'Improvements', 'Questions', 'Bugs']);
    await expect(page.locator('.card-count')).toHaveText('38832 CARDS');
    expect((await page.locator('body').innerText()).match(CARD_TITLES)?.length).toBe(8);
  });

  test('"All" is the active filter on load', async ({ page }) => {
    await expect(page.locator('.filtersearch button', { hasText: 'All' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('selecting a tag marks it and shows the clear icon', async ({ page }) => {
    const firstTag = page.locator('.tags button').first();
    await expect(firstTag).toHaveAttribute('aria-pressed', 'false');

    await firstTag.click();
    await expect(firstTag).toHaveAttribute('aria-pressed', 'true');
    await expect(firstTag.locator('.clear-icon')).toBeVisible();

    await firstTag.click();
    await expect(firstTag).toHaveAttribute('aria-pressed', 'false');
    await expect(firstTag.locator('.clear-icon')).toHaveCount(0);
  });

  test('typing in the composer keeps the text', async ({ page }) => {
    const input = page.getByPlaceholder('Describe your issue or suggestion');
    await input.fill('sample text');
    await expect(input).toHaveValue('sample text');
  });

  test('KNOWN BUG BUG-07: the Bugs filter does not change the card list', async ({ page }) => {
    const before = (await page.locator('body').innerText()).match(CARD_TITLES);

    await page.locator('.filtersearch button', { hasText: 'Bugs' }).click();

    await expect(page.locator('.filtersearch button', { hasText: 'Bugs' })).toHaveAttribute('aria-pressed', 'true');
    const after = (await page.locator('body').innerText()).match(CARD_TITLES);

    // Expected behaviour: a different, shorter list. Actual behaviour: identical list.
    expect(after, 'the list should change after filtering').not.toEqual(before);
  });

  test('KNOWN BUG BUG-07: the "best" sort does not change the card order', async ({ page }) => {
    const before = (await page.locator('body').innerText()).match(CARD_TITLES);

    await page.locator('.sort-options button', { hasText: 'best' }).click();

    await expect(page.locator('.sort-options button', { hasText: 'best' })).toHaveAttribute('aria-pressed', 'true');
    const after = (await page.locator('body').innerText()).match(CARD_TITLES);

    expect(after, 'the order should change after sorting').not.toEqual(before);
  });

  test('KNOWN BUG BUG-06: the "+" button does not submit the typed text', async ({ page }) => {
    const input = page.getByPlaceholder('Describe your issue or suggestion');
    await input.fill('sample text');

    await page.locator('.buttonicon').click();

    // Expected behaviour: the entry is submitted and the field is cleared.
    await expect(input).toHaveValue('');
  });
});