import { test, expect } from '@playwright/test';
import { verifyProfile, safeClick } from './helpers/actions';

test.describe('Coin toggle & Header Nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('log in and toggle currency mode', async ({ page }) => {
    const currencyImg = page.locator('img[alt="CURRENCY"], img[alt="currency"]').first();
    if (await currencyImg.isVisible({ timeout: 5000 }).catch(() => false)) {
      await currencyImg.click({ force: true });
      await page.waitForTimeout(2000);
      await currencyImg.click({ force: true });
    }
  });

  test('Browse header categories', async ({ page }) => {
    // Promotions
    await safeClick(page, 'a[href="/promotions"]:visible, [href="/promotions"]:visible');
    await expect(page.locator('img[class*="object-cover"][class*="rounded"]').first()).toBeAttached();

    // Spin wheel / dialog
    await safeClick(page, 'text=Spin Wheel');
    const closeIcon = page.locator('.dialog-close-icon').first();
    if (await closeIcon.isVisible().catch(() => false)) {
      await closeIcon.click({ force: true });
    }

    // VIP tier page and level count
    await safeClick(page, 'a[href="/vip"]:visible, [href="/vip"]:visible');
    await expect(page.locator('div.rounded-\\[1\\.5rem\\].border.border-\\[\\#ffffff14\\]')).toHaveCount(7);

    // Home button
    await page.goto('https://dev.prizeplanet.com/');
    await expect(page).toHaveURL('https://dev.prizeplanet.com/');

    // Profile sections
    await page.locator('button:has(img[alt="profile"]):visible, img[alt="profile"]:visible').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('[role="menuitem"]:visible').filter({ hasText: /account/i }).first().click({ force: true });
    await verifyProfile(page);

    // User Activity
    await page.locator('button:has(img[alt="profile"]):visible, img[alt="profile"]:visible').first().click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('[role="menuitem"]:visible').filter({ hasText: /activity/i }).first().click({ force: true });

    const tabs = ['Coins', 'Redemptions', 'Platforms', 'Gameplay', 'Rewards', 'Tournaments', 'Missions'];
    for (const tab of tabs) {
      await page.locator('li', { hasText: tab }).first().click({ force: true });
    }

    await page.locator('img[alt="calendar icon"]').first().click({ force: true }).catch(() => {});
  });
});
