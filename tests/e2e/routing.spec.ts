import { test, expect } from '@playwright/test';

// Define the chronological worlds/eras rank mapping
const PROJECT_ERA_RANK: Record<string, number> = {
  // Method Layer / Frameworks (Rank 0)
  'systems-choreography': 0,
  'fictive-environments': 0,
  'meaning-stack': 0,
  '99-nodes': 0,

  // Era 1: Foundation
  'architecture-in-low-res': 1,
  'cartography-of-absence': 2, // chronological sub-order inside Foundation

  // Era 2: Public Culture
  'mashrou-leila': 3,
  'why-were-like-this': 4,

  // Era 3: Exile Machines
  'space-time-tuning-machine': 5,
  'tebr': 6,
  'chronocumulator': 7,
  'the-weather-rehearsal': 8,

  // Era 4: Memory Interfaces
  'sometimes-i-wake-up-elsewhere': 9,
  'derive': 10,
  'storylines': 11,

  // Era 5: Sonic Intelligence
  'hah-was': 12,
  'localization-gap': 13,
  'maqamai': 14,

  // Era 6: Spatial Futures
  'mekena-nyc': 15,
  'codeverse-explorer': 16,
};

test.describe('Routing & Architecture Tests', () => {
  test('the five public modes expose canonical paths, titles, and active navigation state', async ({ page }) => {
    const publicModes = [
      { button: 'Home: Orbit intro', path: '/orbit', title: 'Orbit — Haig Papazian Archive', announcement: 'Orbit mode.' },
      { button: 'Works: 20-project spine', path: '/works', title: 'Works — Haig Papazian Archive', announcement: 'Works mode.' },
      { button: 'Index: Unwrapped grid', path: '/index', title: 'Asset Index — Haig Papazian Archive', announcement: 'Index mode.' },
      { button: 'Maps: Relations', path: '/map', title: 'Constellation Map — Haig Papazian Archive', announcement: 'Map mode.' },
      { button: 'Essays: Writing panel', path: '/essays', title: 'Essays — Haig Papazian Archive', announcement: 'Essays mode.' },
    ];

    await page.goto('/orbit');
    await page.getByRole('navigation', { name: 'Archive views' }).waitFor();

    for (const mode of publicModes) {
      const control = page.getByRole('button', { name: mode.button });
      await control.click();

      await expect(page).toHaveURL(new RegExp(`${mode.path.replace('/', '\\/')}(?:#.*)?$`));
      await expect(page).toHaveTitle(mode.title);
      await expect(control).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('.sr-only[aria-live="polite"]').filter({ hasText: mode.announcement })).toBeAttached();
    }
  });

  test('Back and Forward restore public and case-study state', async ({ page }) => {
    await page.goto('/works');
    await expect(page).toHaveTitle('Works — Haig Papazian Archive');

    await page.goto('/case-studies/mashrou-leila');
    await expect(page).toHaveTitle("Mashrou' Leila — Haig Papazian Archive");
    await expect(page.locator('.sr-only[aria-live="polite"]')).toContainText("Project case study mode. Mashrou' Leila selected.");

    await page.goBack();
    await expect(page).toHaveURL(/\/works(?:#.*)?$/);
    await expect(page).toHaveTitle('Works — Haig Papazian Archive');
    await expect(page.locator('.sr-only[aria-live="polite"]')).toContainText('Works mode.');

    await page.goForward();
    await expect(page).toHaveURL(/\/case-studies\/mashrou-leila(?:#.*)?$/);
    await expect(page).toHaveTitle("Mashrou' Leila — Haig Papazian Archive");
    await expect(page.locator('.sr-only[aria-live="polite"]')).toContainText("Project case study mode. Mashrou' Leila selected.");
  });

  test('curated project spine loads in chronological order across eras', async ({ page }) => {
    // Navigate to works / text index fallback mode to easily inspect listed canonical projects
    await page.goto('/?view=text');

    // Wait for the list of projects to be visible
    await page.waitForSelector('ol li a');

    // Extract all project slugs from the list anchors
    const anchors = await page.locator('ol li a').all();
    const slugs: string[] = [];

    for (const anchor of anchors) {
      const href = await anchor.getAttribute('href');
      if (href && href.startsWith('/case-studies/')) {
        slugs.push(href.replace('/case-studies/', ''));
      }
    }

    // Verify we have canonical projects in the list
    expect(slugs.length).toBeGreaterThan(0);

    // Filter projects that are mapped to our chronology and assert their order is monotonically increasing
    let lastRank = -1;
    for (const slug of slugs) {
      if (slug in PROJECT_ERA_RANK) {
        const currentRank = PROJECT_ERA_RANK[slug];
        expect(currentRank).toBeGreaterThanOrEqual(lastRank);
        lastRank = currentRank;
      }
    }
  });

  test('structural containers like 99nodes and p5js are not indexed or routed as standalone projects', async ({ page }) => {
    // 1. Verify not in text archive index list
    await page.goto('/?view=text');
    await page.waitForSelector('ol li');

    const content = await page.textContent('body');
    // Assert 99nodes (no hyphen) and p5js are not in text
    expect(content).not.toContain('/case-studies/99nodes');
    expect(content).not.toContain('/case-studies/p5js');

    // 2. Verify visiting their standalone routes falls back or redirects to Home/Orbit
    for (const slug of ['99nodes', 'p5js']) {
      await page.goto(`/case-studies/${slug}`);
      // Wait for the routing fallback to trigger and URL to transition to /orbit
      await page.waitForURL('**/orbit', { timeout: 10000 });
      const pathname = await page.evaluate(() => window.location.pathname);
      expect(pathname).toBe('/orbit');
    }
  });

  test('core projects load state deep links', async ({ page }) => {
    const coreProjects = [
      { slug: 'lede-nyc', title: 'LEDE.NYC' },
      { slug: 'why-were-like-this', title: "WHY WE'RE LIKE THIS" },
      { slug: 'sometimes-i-wake-up-elsewhere', title: 'SOMETIMES I WAKE UP ELSEWHERE' }
    ];

    for (const project of coreProjects) {
      await page.goto(`/case-studies/${project.slug}`);

      // Wait for the async router/mounting logic to finish and update page title
      await page.waitForFunction(
        (expectedTitle) => document.title.toUpperCase().includes(expectedTitle.toUpperCase()),
        project.title,
        { timeout: 10000 }
      );

      const pageTitle = await page.title();
      expect(pageTitle.toUpperCase()).toContain(project.title.replace("’", "'").toUpperCase());
    }
  });
});
