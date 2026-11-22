import { test, expect } from '@playwright/test';

import { login, prepare, snapshot, fixtureApi, submitLogin, expectHealthy } from './academic-module-setup.helpers';

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

  test('a signed-out notification launch opens the drawer after school sign-in', async ({ page, request }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/dashboard?openNotifications=1');
    await expect(page).toHaveURL(/\/login\?openNotifications=1$/);
    await submitLogin(page);

    await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect((await snapshot(request)).pushActions).toEqual([]);
  });

  test('the bell checks saved enrollment and recovers an expired subscription', async ({ page, request }) => {
    let status = 200;
    let isEnabled = true;
    await page.route('**/api/communication/notifications/me/push/subscriptions/*', async (route) => {
      if (route.request().method() !== 'GET') { await route.continue(); return; }
      await route.fulfill({ status, json: { isEnabled } });
    });
    await login(page);
    await page.goto('/academic/dashboard');
    const open = page.getByRole('button', { name: 'Open notifications' });
    const close = page.getByRole('button', { name: 'Close notifications' });
    const enabled = page.getByRole('status').filter({ hasText: 'Browser notifications are on' });
    await open.click();
    await page.getByRole('button', { name: 'Enable browser notifications', exact: true }).click();
    await expect(enabled).toBeVisible();
    const [registration] = (await snapshot(request)).pushActions;

    await close.click();
    await open.click();
    await expect(enabled).toBeVisible();

    status = 503;
    await close.click();
    await open.click();
    await expect(page.getByText('Notification settings could not be loaded.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('fixture:browser-push-subscription'))).toBe('true');

    status = 200;
    isEnabled = false;
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByText('Browser notifications expired on this device.')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('fixture:browser-push-subscription'))).toBeNull();

    await page.getByRole('button', { name: 'Enable browser notifications again', exact: true }).click();
    await expect(enabled).toBeVisible();
    const actions = (await snapshot(request)).pushActions;
    expect(actions).toHaveLength(2);
    expect(actions[1]).toMatchObject({ action: 'register', user: registration.user });
    expect(actions[1].id).not.toBe(registration.id);
  });

  test('session expiry during push enrollment cleans up and returns to sign-in', async ({ page, request }) => {
    const enrollment = '**/api/communication/notifications/me/push/subscriptions';
    await page.route(enrollment, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 401, json: { message: 'Fixture session expired' } });
    });
    await login(page);
    await page.goto('/academic/dashboard');
    await page.getByRole('button', { name: 'Open notifications' }).click();
    const rejected = page.waitForResponse((response) =>
      response.url().endsWith('/push/subscriptions') && response.status() === 401
    );
    await page.getByRole('button', { name: 'Enable browser notifications', exact: true }).click();
    await rejected;
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    expect(await page.evaluate(() => ({
      subscription: localStorage.getItem('fixture:browser-push-subscription'),
      registration: localStorage.getItem('shikshamitra:website-push:device'),
    }))).toEqual({ subscription: null, registration: null });
    expect((await snapshot(request)).pushActions).toEqual([]);
  });
});

test('an iPad browser tab explains how to enable notifications from the Home Screen', { tag }, async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, pushEnabled: true } });
  await prepare(page, request);
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'PushManager');
    Object.defineProperty(navigator, 'platform', { configurable: true, value: 'MacIntel' });
    Object.defineProperty(navigator, 'maxTouchPoints', { configurable: true, value: 5 });
  });
  await login(page);
  await page.goto('/academic/dashboard');
  await page.getByRole('button', { name: 'Open notifications' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Add to Home Screen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable browser notifications', exact: true })).toHaveCount(0);
  expect((await snapshot(request)).pushActions).toEqual([]);
});
