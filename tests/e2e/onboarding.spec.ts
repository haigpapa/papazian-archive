import { expect, test } from '@playwright/test';

test.describe('First-visit guidance', () => {
  test('introduces all five projections once and persists dismissal', async ({ page }) => {
    await page.goto('/orbit');

    const guide = page.getByLabel('Archive navigation guide');
    await expect(guide).toBeVisible({ timeout: 15_000 });
    await expect(guide).toContainText('One archive, five projections.');

    await guide.getByRole('button', { name: 'See the modes' }).click();
    for (const mode of ['Orbit', 'Works', 'Index', 'Map', 'Essays']) {
      await expect(guide.getByText(mode, { exact: true })).toBeVisible();
    }

    await guide.getByRole('button', { name: 'Begin exploring' }).click();
    await expect(guide).toBeHidden();

    await page.reload();
    await expect(guide).toBeHidden();
  });

  test('does not interrupt a direct case-study deep link', async ({ page }) => {
    await page.goto('/case-studies/mashrou-leila');

    await expect(page).toHaveTitle("Mashrou' Leila — Haig Papazian Archive", { timeout: 12_000 });
    await expect(page.locator('.sr-only[aria-live="polite"]')).toContainText("Project case study mode. Mashrou' Leila selected.");
    await expect(page.getByLabel('Archive navigation guide')).toBeHidden();
  });

  test('skip link moves keyboard focus to archive navigation', async ({ page }) => {
    await page.goto('/orbit');

    const skipLink = page.getByRole('link', { name: 'Skip to archive navigation' });
    await expect(skipLink).toBeAttached({ timeout: 15_000 });

    const firstTabStop = await page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
      ));

      return candidates.find((element) => {
        const styles = window.getComputedStyle(element);
        return element.tabIndex >= 0 && styles.display !== 'none' && styles.visibility !== 'hidden';
      })?.textContent?.trim();
    });

    expect(firstTabStop).toBe('Skip to archive navigation');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    await expect.poll(async () => page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      label: document.activeElement?.getAttribute('aria-label'),
      text: document.activeElement?.textContent?.trim(),
    }))).toEqual({ tag: 'BUTTON', label: 'Home: Orbit intro', text: '' });
  });
});
