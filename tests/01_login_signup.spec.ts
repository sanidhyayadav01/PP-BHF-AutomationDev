import { test, expect } from '@playwright/test';
import { signup, login, logout } from './helpers/actions';

test.describe('PrizePlanet signup + login happy flow', () => {
  const baseUrl = 'https://dev.prizeplanet.com/';

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(baseUrl);
  });

  test('signs up, logs out, and logs in with same runtime user', async ({ page }) => {
    const newUser = await signup(page);
    await page.waitForTimeout(2000);

    await login(page, newUser);
    await page.waitForTimeout(2000);
    await logout(page);

    await expect(page.locator('body')).toBeVisible();
  });
});
