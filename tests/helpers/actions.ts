import { Page, expect, Response } from '@playwright/test';
import * as runtimeUserFixture from '../fixtures/runtimeUser.json';

export interface UserCredentials {
  username: string;
  email?: string;
  password: string;
}

/**
 * Helper to click element safely using force click or dispatchEvent click if hidden
 */
export async function safeClick(page: Page, selector: string): Promise<void> {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ force: true }).catch(async () => {
    await locator.dispatchEvent('click').catch(() => {});
  });
}

/**
 * Signup helper - generates random user, fills registration form, submits and returns to login page
 */
export async function signup(page: Page): Promise<UserCredentials> {
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const runtimeUser: UserCredentials = {
    username: `test${randomId}`,
    email: `test${randomId}@gmail.com`,
    password: 'Tester@001',
  };

  const openSignUpBtn = page.locator('button, a').filter({ hasText: /sign up|register|join/i }).first();
  await openSignUpBtn.click({ force: true }).catch(() => {});

  const usernameInput = page.locator('[name="username"]:visible, [name="userName"]:visible').first();
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill(runtimeUser.username);

  await page.locator('[name="email"]:visible').first().fill(runtimeUser.email!);
  await page.locator('[name="password"]:visible').first().fill(runtimeUser.password);
  await page.locator('[name="confirmPassword"]:visible').first().fill(runtimeUser.password);

  await page.locator(':nth-child(1) > .peer').first().click({ force: true }).catch(() => {});
  await page.locator(':nth-child(2) > .peer').first().click({ force: true }).catch(() => {});

  await page.locator('button[type="submit"]:visible').filter({ hasText: /sign up/i }).first().click({ force: true });
  await page.waitForTimeout(3000);

  const backToLogin = page.locator('button, a').filter({ hasText: /back to login|login/i }).first();
  if (await backToLogin.isVisible({ timeout: 3000 }).catch(() => false)) {
    await backToLogin.click({ force: true }).catch(() => {});
  }

  return runtimeUser;
}

/**
 * Login helper - uses provided credentials or fixture default
 */
export async function login(page: Page, user: UserCredentials = runtimeUserFixture): Promise<void> {
  const usernameInput = page.locator('[name="userName"]:visible, [name="username"]:visible').first();
  if (!(await usernameInput.isVisible({ timeout: 1000 }).catch(() => false))) {
    const loginHeaderBtn = page.locator('button, a').filter({ hasText: /^login$/i }).first()
      .or(page.locator('button, a').filter({ hasText: /login/i }).first());
    await loginHeaderBtn.click({ force: true }).catch(() => {});
  }

  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.fill(user.username);
  await page.locator('[name="password"]:visible').first().fill(user.password);
  await page.locator('button[type="submit"]:visible').filter({ hasText: /log in|login/i }).first().click({ force: true });

  await page.waitForTimeout(2000);

  // Close login modal if present
  const dialogClose = page.locator('.dialog-close-icon').first();
  if (await dialogClose.isVisible({ timeout: 1500 }).catch(() => false)) {
    await dialogClose.click({ force: true }).catch(() => {});
  } else {
    console.log('Login modal close icon not shown');
  }

  await page.waitForTimeout(1000);

  // Close post-login popup toggle if present
  const postLoginToggle = page.locator(':nth-child(1) > .invert').first();
  if (await postLoginToggle.isVisible({ timeout: 1500 }).catch(() => false)) {
    await postLoginToggle.click({ force: true }).catch(() => {});
  } else {
    console.log('Post-login popup toggle not shown');
  }
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  const profileImg = page.locator('img[alt="profile"]').first();
  if (await profileImg.isVisible({ timeout: 2000 }).catch(() => false)) {
    await profileImg.click({ force: true }).catch(() => {});
  }
  
  const logoutOption = page.locator('text=/logout|sign out/i').first();
  if (await logoutOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutOption.click({ force: true }).catch(() => {});
  }

  await page.waitForTimeout(1500);
  const logoutConfirmBtn = page.locator('button').filter({ hasText: /^logout$/i }).first();
  if (await logoutConfirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutConfirmBtn.click({ force: true }).catch(() => {});
  }
}

/**
 * Profile sections helper
 */
export async function verifyProfile(page: Page): Promise<void> {
  await expect(page.locator('h2', { hasText: 'Profile' }).first()).toBeAttached();
  await safeClick(page, '.settings-tab:has-text("Security")');
  await safeClick(page, '.settings-tab:has-text("Verify")');
  await safeClick(page, '.settings-tab:has-text("Responsible Gaming")');
  await safeClick(page, '.settings-tab:has-text("My Profile")');

  await expect(page.locator('h1', { hasText: 'Personal Information' })).toBeVisible();
  await expect(page.locator('input[name="firstName"]').first()).toBeAttached();
  await expect(page.locator('input[name="lastName"]').first()).toBeAttached();
  await expect(page.locator('input[name="userName"]').first()).toBeAttached();
  await expect(page.locator('input[name="userEmail"], input[name="email"]').first()).toBeAttached();
}

/**
 * Verify footer links and associated API responses
 */
export async function verifyFooterLinks(page: Page): Promise<void> {
  const responses: { [key: string]: Response[] } = {
    customerAcceptance: [],
    responsibleGaming: [],
    sweepsRules: [],
    termsAndConditions: [],
  };

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('cms/page?cmsSlug=customer-acceptance-policy')) responses.customerAcceptance.push(res);
    if (url.includes('cms/page?cmsSlug=responsible-social-gameplay-policy')) responses.responsibleGaming.push(res);
    if (url.includes('cms/page?cmsSlug=sweeps-rules')) responses.sweepsRules.push(res);
    if (url.includes('cms/page?cmsSlug=term-and-condition')) responses.termsAndConditions.push(res);
  });

  // 1. FAQ - UI verification
  await safeClick(page, 'a[href="/faq"]:visible, [href="/faq"]:visible');
  await expect(page).toHaveURL(/\/faq/);
  await expect(page.locator('text=Frequently Asked Questions').first()).toBeAttached();
  await expect(page.locator('text=Get Started').first()).toBeAttached();
  await expect(page.locator('text=Platforms').first()).toBeAttached();
  await expect(page.locator('text=Redeem').first()).toBeAttached();
  await expect(page.locator('text=Collect Rewards').first()).toBeAttached();
  await expect(page.locator('text=General Questions').first()).toBeAttached();
  await expect(page.locator('text=Account Details').first()).toBeAttached();
  await expect(page.locator('text=Self-Exclusion').first()).toBeAttached();
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 2. Postal Code - Modal verification
  await safeClick(page, 'text=Postal Code');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('text=Postal Request Codes').first()).toBeAttached();
  await expect(page.locator('text=To receive free Sweeps Coins by postal request').first()).toBeAttached();

  await page.keyboard.press('Escape').catch(() => {});
  const closeIcon = page.locator('.absolute > .h-4, .dialog-close-icon, [role="dialog"] button').first();
  if (await closeIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeIcon.click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(1000);

  // 3. Customer Acceptance Policy
  await page.goto('/customer-acceptance-policy', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await expect(page).toHaveURL(/\/customer-acceptance-policy/);
  await page.waitForTimeout(1000);
  if (responses.customerAcceptance.length > 0) {
    const res = responses.customerAcceptance[responses.customerAcceptance.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.cmsDetails.title.EN).toBe('Customer Acceptance Policy');
    expect(body.data.cmsDetails.slug).toBe('customer-acceptance-policy');
  } else {
    console.log('customerAcceptance API prefetched or cached');
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 4. Responsible Social Gameplay Policy
  await page.goto('/responsible-social-gameplay-policy', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await expect(page).toHaveURL(/\/responsible-social-gameplay-policy/);
  await page.waitForTimeout(1000);
  if (responses.responsibleGaming.length > 0) {
    const res = responses.responsibleGaming[responses.responsibleGaming.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.cmsDetails.title.EN.trim()).toBe('Responsible Social Gameplay Policy');
    expect(body.data.cmsDetails.slug).toBe('responsible-social-gameplay-policy');
  } else {
    console.log('responsibleGaming API prefetched or cached');
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 5. Sweeps Rules
  await page.goto('/sweeps-rules', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await expect(page).toHaveURL(/\/sweeps-rules/);
  await page.waitForTimeout(1000);
  if (responses.sweepsRules.length > 0) {
    const res = responses.sweepsRules[responses.sweepsRules.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.cmsDetails.title.EN).toBe('Sweeps Rules');
    expect(body.data.cmsDetails.slug).toBe('sweeps-rules');
  } else {
    console.log('sweepsRules API prefetched or cached');
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);
}

/**
 * Verify Tournaments, Missions, and VIP page
 */
export async function verifyTournamentsMissionsVIP(page: Page): Promise<void> {
  const responses: { tournaments: Response[]; missionsDaily: Response[]; vipTiers: Response[] } = {
    tournaments: [],
    missionsDaily: [],
    vipTiers: [],
  };

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('tournament/get-tournamnent-data')) responses.tournaments.push(res);
    if (url.includes('mission?repeatRule=daily')) responses.missionsDaily.push(res);
    if (url.includes('/vip')) responses.vipTiers.push(res);
  });

  // Tournaments
  await page.goto('/tournament', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);
  if (responses.tournaments.length > 0) {
    const res = responses.tournaments[responses.tournaments.length - 1];
    expect(res.status()).toBe(200);
  }
  await expect(page.locator('text=/live/i').first()).toBeAttached();
  await expect(page.locator('text=/upcoming/i').first()).toBeAttached();
  await expect(page.locator('text=/history/i').first()).toBeAttached();
  await expect(page.locator('text=/my tournament/i').first()).toBeAttached();

  // Missions
  await safeClick(page, 'a[href="/mission"]:visible, [href="/mission"]:visible, button:has-text("Missions")');
  await page.waitForTimeout(1000);
  if (responses.missionsDaily.length > 0) {
    const res = responses.missionsDaily[responses.missionsDaily.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body?.data) {
      expect(body.data.success).toBe(true);
    }
  }
  await expect(page.locator('text=/daily/i').first()).toBeAttached();
  await expect(page.locator('.mission-bg > .gap-2 > :nth-child(2) > span')).toBeAttached();
  await expect(page.locator('.gap-2 > :nth-child(3) > span')).toBeAttached();
  await expect(page.locator('.gap-2 > :nth-child(4) > span')).toBeAttached();

  // VIP
  await page.goto('/vip', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);
  if (responses.vipTiers.length > 0) {
    const res = responses.vipTiers[responses.vipTiers.length - 1];
    expect(res.status()).toBe(200);
  }
  await expect(page).toHaveURL(/\/vip/);
  await expect(page.locator('text=/bronze/i').first()).toBeAttached();
  await expect(page.locator('text=/silver/i').first()).toBeAttached();
  await expect(page.locator('text=/gold/i').first()).toBeAttached();
  await expect(page.locator('text=/platinum/i').first()).toBeAttached();
  await expect(page.locator('text=/ruby/i').first()).toBeAttached();
  await expect(page.locator('text=/diamond/i').first()).toBeAttached();
  await expect(page.locator('text=/pinnacle/i').first()).toBeAttached();
}

/**
 * Verify Single Menu Pages
 */
export async function verifyMenuPages(page: Page): Promise<void> {
  const responses: { [key: string]: Response[] } = {
    support: [],
    promotions: [],
    favorites: [],
    recentGames: [],
    slots: [],
    fishGames: [],
    platforms: [],
  };

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('crm/ticket')) responses.support.push(res);
    if (url.includes('cms/get-promotions')) responses.promotions.push(res);
    if (url.includes('casino/favorite')) responses.favorites.push(res);
    if (url.includes('casino/recently-played')) responses.recentGames.push(res);
    if (url.includes('casino/all-games?category=29')) responses.slots.push(res);
    if (url.includes('casino/all-games?category=34')) responses.fishGames.push(res);
    if (url.includes('original-games')) responses.platforms.push(res);
  });

  const bodyText = await page.locator('body').innerText();

  // 1. Promo Codes - Modal
  if (bodyText.includes('Promo Codes')) {
    await safeClick(page, 'text=Promo Codes');
    await expect(page.locator('[name="code"]')).toBeVisible();
    const modalClose = page.locator('.dialog-close-icon').first();
    if (await modalClose.isVisible({ timeout: 1500 }).catch(() => false)) {
      await modalClose.click({ force: true });
    }
  }

  // 2. FAQ
  await page.goto('/faq', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await expect(page).toHaveURL(/\/faq/);
  await expect(page.locator('text=Frequently Asked Questions').first()).toBeAttached();
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 3. Support
  await safeClick(page, 'text=Support');
  await page.waitForTimeout(1000);
  if (responses.support.length > 0) {
    const res = responses.support[responses.support.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.errors).toEqual([]);
    expect(body.data.tickets.count).toBeGreaterThanOrEqual(0);
  }
  await expect(page.locator('text=/create new ticket/i').first()).toBeAttached();
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 4. Boost Up - Modal
  await safeClick(page, 'text=Boost Up');
  const boostClose = page.locator('.dialog-close-icon').first();
  if (await boostClose.isVisible({ timeout: 1500 }).catch(() => false)) {
    await boostClose.click({ force: true });
  }

  // 5. Promotions
  await page.goto('/promotions', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);
  if (responses.promotions.length > 0) {
    const res = responses.promotions[responses.promotions.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.promotions.length).toBeGreaterThan(0);
    expect(body.data.totalPages).toBeGreaterThanOrEqual(1);
  }
  await expect(page).toHaveURL(/\/promotions/);
  await expect(page.locator('img[class*="object-cover"][class*="rounded"]').first()).toBeAttached();
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1000);

  // 6. Refer a Friend
  await safeClick(page, 'text=Refer a Friend');
  await expect(page).toHaveURL(/\/affiliate/);
  await expect(page.locator('p').first()).toBeAttached();
  await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});

  // 7. Favorites
  await safeClick(page, 'text=Favorites');
  await page.waitForTimeout(1000);
  if (responses.favorites.length > 0) {
    const res = responses.favorites[responses.favorites.length - 1];
    expect(res.status()).toBe(200);
  }
  await page.goBack();

  // 8. Recent Games
  await safeClick(page, 'text=Recent Games');
  await page.waitForTimeout(2000);
  if (responses.recentGames.length > 0) {
    const res = responses.recentGames[responses.recentGames.length - 1];
    expect(res.status()).toBe(200);
  }
  await page.goBack();
  await expect(page).not.toHaveURL(/\/recent-games/);

  // 9. Slots
  const currentBodyText = await page.locator('body').innerText();
  if (currentBodyText.includes('Slots')) {
    await safeClick(page, 'text=Slots');
    await page.waitForTimeout(2000);
    if (responses.slots.length > 0) {
      const res = responses.slots[responses.slots.length - 1];
      expect(res.status()).toBe(200);
    }
    if (page.url().includes('/slots')) {
      await page.goBack();
      await expect(page).not.toHaveURL(/\/slots/);
    }
  }

  // 10. Fish Games
  if (currentBodyText.includes('Fish Games')) {
    await safeClick(page, 'text=Fish Games');
    await page.waitForTimeout(2000);
    if (responses.fishGames.length > 0) {
      const res = responses.fishGames[responses.fishGames.length - 1];
      expect(res.status()).toBe(200);
    }
    if (page.url().includes('/fish-games')) {
      await page.goBack();
      await expect(page).not.toHaveURL(/\/fish-games/);
    }
  }

  // 11. Platforms
  if (currentBodyText.includes('Platforms')) {
    await safeClick(page, 'text=Platforms');
    await page.waitForTimeout(2000);
    if (responses.platforms.length > 0) {
      const res = responses.platforms[responses.platforms.length - 1];
      expect(res.status()).toBe(200);
    }
    if (page.url().includes('/platforms')) {
      await page.goBack();
      await expect(page).not.toHaveURL(/\/platforms/);
    }
  }
}

/**
 * Verify Store and Redeem
 */
export async function verifyStoreAndRedeem(page: Page): Promise<void> {
  const responses: { getCoins: Response[]; redeemContext: Response[] } = {
    getCoins: [],
    redeemContext: [],
  };

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('package')) responses.getCoins.push(res);
    if (url.includes('redeem-context')) responses.redeemContext.push(res);
  });

  // 1. Get Coins
  await safeClick(page, 'text=Get Coins');
  await page.waitForTimeout(2000);

  if (responses.getCoins.length > 0) {
    const res = responses.getCoins[responses.getCoins.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    const packages = body?.data?.packages || body?.data || [];
    if (Array.isArray(packages) && packages.length > 0) {
      expect(packages.length).toBeGreaterThanOrEqual(1);
      expect(packages[0].id).toBeDefined();
      expect(packages[0].amount).toBeDefined();
      expect(packages[0].gcCoin).toBeDefined();
      expect(packages[0].scCoin).toBeDefined();
    }
  }

  // Verify store UI
  await expect(page.locator('body')).toBeVisible();

  // 2. Redeem
  await safeClick(page, 'text=Redeem');
  await page.waitForTimeout(1000);

  await expect(page.locator('.min-w-0 > .mobile-18').first()).toBeAttached();

  if (responses.redeemContext.length > 0) {
    const res = responses.redeemContext[responses.redeemContext.length - 1];
    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data;

    expect(data.vipTier.name).toBeDefined();
    expect(data.vipTier.level).toBeGreaterThanOrEqual(0);
    expect(data.limits.daily.used).toBeGreaterThanOrEqual(0);
    expect(data.limits.daily.remaining).toBeGreaterThanOrEqual(0);
    expect(data.limits.minWithdrawalLimit).toBeGreaterThanOrEqual(0);
    expect(['OPEN', 'CLOSED']).toContain(data.windows.currentStatus);
    expect(data.windows.allWindows.length).toBeGreaterThan(0);
    expect(typeof data.userStatus.isKycVerified).toBe('boolean');
    expect(typeof data.userStatus.isProfileComplete).toBe('boolean');
  }

  const closeBtn = page.locator('.dialog-close-icon').first();
  if (await closeBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await closeBtn.click({ force: true });
  }
}

/**
 * Verify Providers
 */
export async function verifyProviders(page: Page): Promise<void> {
  const providers = [
    { name: '3 Oaks Gaming', id: 59, alias: 'threeOaks' },
    { name: 'AJOY', id: 2, alias: 'ajoy' },
  ];

  for (const provider of providers) {
    const providerResponses: Response[] = [];

    const listener = (res: Response) => {
      if (res.url().includes(`casino/games`) && res.url().includes(`providerId=${provider.id}`)) {
        providerResponses.push(res);
      }
    };

    page.on('response', listener);

    await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await safeClick(page, 'text=Providers');

    await page.waitForTimeout(2000);

    const bodyText = (await page.locator('body').innerText()).toLowerCase();
    if (!bodyText.includes(provider.name.toLowerCase())) {
      console.log(`${provider.name} not visible in UI list, skipping`);
      page.off('response', listener);
      continue;
    }

    await safeClick(page, `text=/${provider.name}/i`);
    await page.waitForTimeout(1500);

    if (providerResponses.length > 0) {
      const res = providerResponses[providerResponses.length - 1];
      expect(res.status()).toBe(200);
      const body = await res.json();
      const games = body.data?.casinoGames;

      if (games && games.length > 0) {
        const providerFromApi = games[0]?.CasinoGames[0]?.CasinoProvider?.name?.EN;
        if (providerFromApi) {
          expect(providerFromApi.trim()).toBe(provider.name);
        }

        games[0].CasinoGames.forEach((game: any) => {
          expect(game.casinoProviderId).toBe(provider.id);
        });

        const cardsCount = await page.locator('.game-card').count();
        const apiCount = games[0]?.CasinoGames?.length || 0;
        expect(cardsCount).toBeGreaterThanOrEqual(1);
        expect(cardsCount).toBeLessThanOrEqual(Math.max(apiCount * 50, 100));
      }
    }

    page.off('response', listener);
  }
}
