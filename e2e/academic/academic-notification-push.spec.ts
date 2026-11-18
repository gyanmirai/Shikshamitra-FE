import { test, expect } from '@playwright/test';

import { login, prepare, snapshot, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

const tag = ['@module-academic', '@submodule-notifications', '@regression', '@responsive', '@accessibility'];

test.describe('Website push on a registered device', { tag }, () => {
  test.beforeEach(async ({ page, request }) => {
    await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, pushEnabled: true } });
    await prepare(page, request);
    await page.addInitScript(() => {
      Object.defineProperty(Notification, 'permission', { configurable: true, value: 'default' });
      const subscriptionKey = 'fixture:browser-push-subscription';
      const endpoint = 'https://push.example.test/academic-registration';
      const subscription = {
        endpoint,
        unsubscribe: async () => { localStorage.removeItem(subscriptionKey); return true; },
        toJSON: () => ({ endpoint, keys: { p256dh: 'synthetic-key', auth: 'synthetic-auth' } }),
      };
      Object.defineProperty(PushManager.prototype, 'getSubscription', {
        configurable: true,
        value: async () => (localStorage.getItem(subscriptionKey) ? subscription : null),
      });
      Object.defineProperty(PushManager.prototype, 'subscribe', {
        configurable: true,
        value: async () => {
          localStorage.setItem(subscriptionKey, 'true');
          return subscription;
        },
      });
    });
  });

  test('explicit opt-in and opt-out use the same subscription on a desktop viewport', async ({ page, request }) => {
    await login(page);
    await page.goto('/academic/dashboard');
    await page.getByRole('button', { name: 'Open notifications' }).click();
    const enable = page.getByRole('button', { name: 'Enable browser notifications' });
    await expect(enable).toBeEnabled();
    expect(await page.evaluate(() => localStorage.getItem('fixture:browser-push-subscription'))).toBeNull();
    expect((await snapshot(request)).pushActions).toEqual([]);

    await enable.click();
    await expect(page.getByRole('status').filter({ hasText: 'Browser notifications are on' })).toBeVisible();
    const [registration] = (await snapshot(request)).pushActions;
    expect(registration).toMatchObject({ action: 'register', version: 'fixture-v1' });
    expect(await page.evaluate(() => caches.keys())).toEqual([]);

    await page.getByRole('button', { name: 'Turn off browser notifications' }).click();
    await expect(enable).toBeEnabled();
    const actions = (await snapshot(request)).pushActions;
    expect(actions[1]).toMatchObject({ action: 'disable', id: registration.id, user: registration.user });
    expect(await page.evaluate(() => localStorage.getItem('fixture:browser-push-subscription'))).toBeNull();
  });

  test('a mobile viewport opens the notification drawer from the same-origin launch URL', async ({ page, request }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await login(page);
    await page.goto('/dashboard?openNotifications=1');
    await expect(page.getByRole('button', { name: 'Enable browser notifications' })).toBeEnabled();
    await expect(page).not.toHaveURL(/openNotifications/);
    await expectHealthy(page);
    expect((await snapshot(request)).pushActions).toEqual([]);
  });
});
