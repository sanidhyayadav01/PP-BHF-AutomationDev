import { test as setup, expect } from '@playwright/test';
import { login } from './helpers/actions';
import * as fs from 'fs';
import * as path from 'path';

const authFile = '.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Ensure .auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto('/');
  await login(page);
  
  // Save storage state for reuse in authenticated tests
  await page.context().storageState({ path: authFile });
});
