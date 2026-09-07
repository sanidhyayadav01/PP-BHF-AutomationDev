import { test } from '@playwright/test';
import { verifyMenuPages } from './helpers/actions';

test.describe('Menu Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('Validate all menu pages', async ({ page }) => {
    await verifyMenuPages(page);
  });
});
