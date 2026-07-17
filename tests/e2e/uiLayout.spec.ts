import { test, expect } from '@playwright/test';

test.describe('UI Layout & Bio Tests', () => {
  test('biography and contact console renders cleanly with correct layouts and headings', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Validate the home screen Biography overlay (HomeOrbitPanel Studio Profile)
    const studioProfileButton = page.locator('button:has-text("View Studio Profile")');
    await expect(studioProfileButton).toBeVisible();
    await studioProfileButton.click();

    // Verify the Beirut/New York biography text is displayed
    const homeBioText = page.locator('p:has-text("Born in Beirut and based in New York")');
    await expect(homeBioText).toBeVisible();

    // Close the home bio
    const backToIndexButton = page.locator('button:has-text("Back to Index")');
    await backToIndexButton.click();
    await expect(homeBioText).not.toBeVisible();

    // 2. Open the HUD Information Console modal dialog
    const infoButton = page.locator('button[aria-label="Open information"]');
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    const infoConsole = page.locator('#archive-info-console');
    await expect(infoConsole).toBeVisible();

    // 3. Validate Biography (About) tab
    const aboutTab = infoConsole.locator('button:has-text("About")');
    await aboutTab.click();

    // Verify practice biography content is displayed
    const practiceBioText = page.locator('p:has-text("works across music, architecture, software")');
    await expect(practiceBioText).toBeVisible();

    // 4. Explicitly assert that "haigpapazian" is not rendered in any large header text (h1 or h2)
    const h1s = await page.locator('h1').allTextContents();
    const h2s = await page.locator('h2').allTextContents();
    const allHeaders = [...h1s, ...h2s];

    for (const header of allHeaders) {
      // Check for lowercase concatenated "haigpapazian"
      expect(header.toLowerCase().replace(/\s+/g, '')).not.toEqual('haigpapazian');
    }

    // 5. Verify contact section sits below the biography tab or matches the relative layout
    const contactTab = infoConsole.locator('button:has-text("Contact")');
    await contactTab.click();

    // Verify contact content is displayed
    const contactTitle = infoConsole.locator('h2:has-text("Contact / Collaboration")');
    await expect(contactTitle).toBeVisible();

    const emailLink = infoConsole.locator('a:has-text("Email")');
    await expect(emailLink).toBeVisible();

    // Assert link placement is below the tab titles/header inside the console scroll container
    const contactTitleBox = await contactTitle.boundingBox();
    const emailLinkBox = await emailLink.boundingBox();

    if (contactTitleBox && emailLinkBox) {
      expect(emailLinkBox.y).toBeGreaterThan(contactTitleBox.y);
    }

    // 6. Check that no technical UI text (such as raw template syntax, variables, or brackets) is bleeding into headers
    for (const header of allHeaders) {
      expect(header).not.toContain('{');
      expect(header).not.toContain('}');
      expect(header).not.toContain('[');
      expect(header).not.toContain(']');
      expect(header).not.toContain('undefined');
      expect(header).not.toContain('null');
    }
  });
});
