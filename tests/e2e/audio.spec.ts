import { expect, test } from '@playwright/test';

test.describe('Audio lifecycle', () => {
  test('sound initializes from a user gesture and can be muted and resumed', async ({ page }) => {
    await page.goto('/orbit');

    const enableSound = page.getByRole('button', { name: 'Unmute sound' });
    await expect(enableSound).toBeVisible();
    await enableSound.click();

    const muteSound = page.getByRole('button', { name: 'Mute sound' });
    await expect(muteSound).toBeVisible({ timeout: 12_000 });
    await expect(page.locator('#audio-announce-alert')).toHaveText('Audio playback unmuted.');

    await muteSound.click();
    await expect(page.getByRole('button', { name: 'Unmute sound' })).toBeVisible();
    await expect(page.locator('#audio-announce-alert')).toHaveText('Audio playback muted.');

    await page.getByRole('button', { name: 'Unmute sound' }).click();
    await expect(page.getByRole('button', { name: 'Mute sound' })).toBeVisible();
    await expect(page.locator('#audio-announce-alert')).toHaveText('Audio playback unmuted.');
  });
});
