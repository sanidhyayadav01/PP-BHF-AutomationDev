import { test } from '@playwright/test';
import { verifyFooterLinks } from './helpers/actions';

test.describe('Footer Links Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('Validate Footer Links', async ({ page }) => {
    await verifyFooterLinks(page);
  });
});
