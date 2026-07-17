import { expect, test } from '@playwright/test';

test.describe('WebGL recovery', () => {
  test('a lost context pauses rendering, reports recovery, and resumes', async ({ page }) => {
    await page.goto('/orbit');

    const canvas = page.locator('#canvas-container canvas');
    await expect(canvas).toBeVisible();

    const canSimulateLoss = await canvas.evaluate((element) => {
      const canvasElement = element as HTMLCanvasElement;
      const context = canvasElement.getContext('webgl2') || canvasElement.getContext('webgl');
      const extension = context?.getExtension('WEBGL_lose_context');
      if (!extension) return false;

      extension.loseContext();
      window.setTimeout(() => extension.restoreContext(), 1_500);
      return true;
    });

    test.skip(!canSimulateLoss, 'WEBGL_lose_context is unavailable in this browser');

    const recoveryNotice = page.getByText('WebGL Error: Connection lost. Attempting to restore...');
    await expect(recoveryNotice).toBeVisible();
    await expect(recoveryNotice).toBeHidden({ timeout: 8_000 });

    await expect(page.getByRole('application', { name: '3D spatial archive' })).toBeVisible();
    await expect(page).toHaveTitle('Orbit — Haig Papazian Archive');
  });
});
