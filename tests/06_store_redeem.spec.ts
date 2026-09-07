import { test } from '@playwright/test';
import { verifyStoreAndRedeem } from './helpers/actions';

test.describe('Store and Redeem', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('Validate Get Coins and Redeem', async ({ page }) => {
    await verifyStoreAndRedeem(page);
  });
});
