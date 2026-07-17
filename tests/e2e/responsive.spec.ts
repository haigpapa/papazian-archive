import { expect, test } from '@playwright/test';

const MOBILE_VIEWPORTS = [320, 375, 390, 430];
const MOBILE_ROUTES = ['/orbit', '/works', '/index', '/map', '/essays', '/case-studies/mashrou-leila'];

test.describe('Mobile release widths', () => {
  for (const width of MOBILE_VIEWPORTS) {
    test(`${width}px stays contained with usable archive controls`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });

      for (const route of MOBILE_ROUTES) {
        await page.goto(route);
        await expect(page.getByRole('application', { name: '3D spatial archive' })).toBeVisible();

        const overflow = await page.evaluate(() => ({
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
        }));

        expect(overflow.documentWidth, `${route} document overflow at ${width}px`).toBeLessThanOrEqual(overflow.viewportWidth + 1);
        expect(overflow.bodyWidth, `${route} body overflow at ${width}px`).toBeLessThanOrEqual(overflow.viewportWidth + 1);

        if (!route.startsWith('/case-studies/')) {
          const viewControls = page.getByRole('navigation', { name: 'Archive views' });
          await expect(viewControls).toBeVisible();

          const controlSizes = await viewControls.getByRole('button').evaluateAll((controls) => (
            controls.map((control) => {
              const rect = control.getBoundingClientRect();
              return { width: rect.width, height: rect.height };
            })
          ));

          for (const size of controlSizes) {
            expect(size.width).toBeGreaterThanOrEqual(44);
            expect(size.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  }
});
