/* eslint-disable no-restricted-syntax -- Each theme uses the same synthetic school fixture sequentially. */
import { test, expect } from '@playwright/test';

import { login, prepare, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

for (const [theme, width, height] of [
  ['light', 1440, 900], ['dark', 1440, 900],
  ['light', 768, 1024], ['dark', 768, 1024],
  ['light', 390, 844], ['dark', 390, 844],
] as const) {
  test(`supplied student mascot fits empty sections at ${width} in ${theme}`, async ({ page, request }, testInfo) => {
    await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true, insights: { role: 'admin', populated: false } } });
    await prepare(page, request, theme);
    await page.setViewportSize({ width, height });
    await login(page);
    await page.goto('/academic/dashboard');
    await expect(page.locator('main section[aria-label]')).toHaveCount(13);
    const characters = page.locator('main section svg image[href$="shikshamitra-student-empty.webp"]');
    await expect(characters).toHaveCount(13);
    await expect(characters.first()).toBeVisible();
    const source = await characters.first().getAttribute('href');
    const asset = await request.get(source!);
    expect(asset.status()).toBe(200);
    expect(asset.headers()['content-type']).toContain('image/webp');
    const bounds = await characters.first().evaluate((image) => {
      const figure = image.getBoundingClientRect();
      const frame = image.closest('svg')!.getBoundingClientRect();
      return { left: figure.left >= frame.left, top: figure.top >= frame.top,
        right: figure.right <= frame.right + 1, bottom: figure.bottom <= frame.bottom + 1 };
    });
    expect(bounds).toEqual({ left: true, top: true, right: true, bottom: true });
    await expectHealthy(page);
    await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), fullPage: true });
  });
}
