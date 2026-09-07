import { test } from '@playwright/test';
import { verifyTournamentsMissionsVIP } from './helpers/actions';

test.describe('Tournaments, Missions & VIP', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
  });

  test('Validate Tournaments, Missions & VIP', async ({ page }) => {
    await verifyTournamentsMissionsVIP(page);
  });
});
