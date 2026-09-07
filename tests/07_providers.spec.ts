import { test } from '@playwright/test';
import { verifyProviders } from './helpers/actions';

test.describe('Dropdown Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('Validate Game Categories dropdown', async ({ page }) => {
    await verifyProviders(page);
  });
});
