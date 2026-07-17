import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Design System & Typography Tests', () => {
  const breakpoints = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  for (const bp of breakpoints) {
    test(`typography and dark mode audit on ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 1. Monospace typography enforcement audit
      // Select elements that represent monospace interface panels, HUDs, or technical buttons
      const fontMonospaceElements = await page.locator('.font-mono, [class*="hud-"], [class*="footer"], button').all();

      for (const element of fontMonospaceElements) {
        const isVisible = await element.isVisible();
        if (!isVisible) continue;

        let computedFontFamily = await element.evaluate((el) => {
          let currentEl: HTMLElement | null = el as HTMLElement;
          let font = '';
          while (currentEl && !font) {
            font = window.getComputedStyle(currentEl).fontFamily;
            currentEl = currentEl.parentElement;
          }
          return font;
        });

        // Normalize spaces and quotes
        computedFontFamily = computedFontFamily.replace(/['"]/g, '').trim();

        const text = await element.textContent();
        if (text && text.trim().length > 0 && computedFontFamily) {
          // If it's a technical button/text, verify it enforces JetBrains Mono, Cabinet Grotesk, Outfit, or Satoshi
          // We flag fallbacks like Arial, Helvetica, Times, Georgia, etc. as bureaucratic/brutalist violations
          const isMonospace = computedFontFamily.toLowerCase().includes('mono') || computedFontFamily.toLowerCase().includes('monospace');
          const isDisplayOrBody =
            computedFontFamily.includes('Cabinet Grotesk') ||
            computedFontFamily.includes('Satoshi') ||
            computedFontFamily.includes('Inter') ||
            computedFontFamily.includes('Outfit') ||
            computedFontFamily.includes('sans-serif');

          if (!isMonospace && !isDisplayOrBody) {
            throw new Error(
              `Typography violation: Element containing "${text.trim().slice(0, 30)}" renders with unauthorized font family "${computedFontFamily}".`
            );
          }
        }
      }

      // 2. Spatial Dark Mode: check for monochromatic high-contrast dark backgrounds
      const bgColors = await page.evaluate(() => {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const rootBg = window.getComputedStyle(document.getElementById('root')!).backgroundColor;
        return { bodyBg, rootBg };
      });

      // Assert that background is pitch black
      expect(bgColors.bodyBg === 'rgb(0, 0, 0)' || bgColors.bodyBg === '#000000').toBe(true);

      // 3. Confirm imagery is properly desaturated
      // Check if three.js shader source contains the grayscale Xerox shader formula
      const indexCssPath = path.resolve(process.cwd(), 'src/core/NodeManager.ts');
      const nodeManagerSrc = fs.readFileSync(indexCssPath, 'utf8');

      const containsGrayscaleXerox = nodeManagerSrc.includes('vec3(0.299, 0.587, 0.114)');
      expect(containsGrayscaleXerox).toBe(true);
    });
  }
});
