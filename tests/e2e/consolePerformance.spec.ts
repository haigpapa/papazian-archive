import { test, expect } from '@playwright/test';

const CANONICAL_PROJECT_SLUGS = [
  "systems-choreography",
  "fictive-environments",
  "tebr",
  "sometimes-i-wake-up-elsewhere",
  "meaning-stack",
  "mekena-nyc",
  "mashrou-leila",
  "cartography-of-absence",
  "hah-was",
  "architecture-in-low-res",
  "space-time-tuning-machine",
  "why-were-like-this",
  "localization-gap",
  "the-weather-rehearsal",
  "chronocumulator",
  "storylines",
  "derive",
  "maqamai",
  "99-nodes",
  "codeverse-explorer"
];

const PAGES_TO_TEST = [
  '/',
  '/orbit',
  '/works',
  '/index',
  '/map',
  '/essays',
  ...CANONICAL_PROJECT_SLUGS.map(slug => `/case-studies/${slug}`)
];

test.describe('Console & Performance Initialization Tests', () => {
  for (const route of PAGES_TO_TEST) {
    test(`route "${route}" loads without console errors or failed network requests`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const pageErrors: Error[] = [];

      // Set up listeners to collect errors and failures
      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();

        // Treat console errors or clear missing asset warnings as failures
        if (type === 'error') {
          consoleErrors.push(`Console Error: ${text}`);
        } else if (type === 'warning' && (text.toLowerCase().includes('404') || text.toLowerCase().includes('failed to load'))) {
          consoleErrors.push(`Console Warning (Asset): ${text}`);
        }
      });

      page.on('pageerror', err => {
        pageErrors.push(err);
      });

      page.on('requestfailed', request => {
        const failure = request.failure();
        // Ignore aborts as they are normal browser behavior during transitions
        if (failure && failure.errorText !== 'net::ERR_ABORTED') {
          failedRequests.push(`Request failed: ${request.url()} (${failure.errorText})`);
        }
      });

      // Visit the page and wait until domcontentloaded
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Let the page settle for a brief moment to catch any async mounting errors
      await page.waitForTimeout(300);

      // Assertions
      if (pageErrors.length > 0) {
        throw new Error(`Page threw uncaught exceptions on initialization:\n${pageErrors.map(e => e.stack).join('\n')}`);
      }

      if (consoleErrors.length > 0) {
        throw new Error(`Page logged console errors or missing asset warnings:\n${consoleErrors.join('\n')}`);
      }

      if (failedRequests.length > 0) {
        throw new Error(`Page failed to load resources or API calls:\n${failedRequests.join('\n')}`);
      }
    });
  }
});
