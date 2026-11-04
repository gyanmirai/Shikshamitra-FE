import { test, expect } from '@playwright/test';

import { login, prepare, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

([['light', 1440, 900], ['dark', 390, 844]] as const).forEach(([theme, width, height]) => {
  test(`dashboard loading and cached return at ${width} in ${theme}`, {
    tag: ['@module-academic', '@submodule-dashboard', '@regression', '@responsive', '@accessibility'],
  }, async ({ page, request }, testInfo) => {
    await request.post(`${fixtureApi}/fixture/reset`, {
      data: { visited: true, insights: { populated: true } },
    });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await prepare(page, request, theme);
    await login(page);
    let release!: () => void;
    let pending = new Promise<void>((resolve) => { release = resolve; });
    let requests = 0;
    await page.route('**/api/academic/dashboard/insights*', async (route) => {
      requests += 1;
      await pending;
      await route.continue();
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/academic/dashboard');
    const loading = page.getByRole('status', { name: 'Loading academic insights', exact: true });
    await expect(loading).toBeVisible();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(loading.locator('.MuiCard-root')).toHaveCount(8);
    await expect(loading.locator('.MuiSkeleton-root').first()).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('heading', { name: 'Academic Dashboard', exact: true })).toHaveCount(1);
    await expectHealthy(page);
    await page.screenshot({ path: testInfo.outputPath(`loading-${theme}-${width}.png`), fullPage: true });
    release();
    await expect(loading).toHaveCount(0);
    const overview = page.getByRole('group', { name: 'Academic overview', exact: true });
    await expect(overview).toBeVisible();
    expect(requests).toBe(1);

    pending = new Promise<void>((resolve) => { release = resolve; });
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(page.getByRole('progressbar', { name: 'Refreshing academic insights' })).toBeVisible();
    await expect(overview).toBeVisible();
    await expect(loading).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Refreshing', exact: true })).toBeDisabled();
    release();
    await expect(page.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled();
    expect(requests).toBe(2);

    await page.getByRole('link', { name: 'Timetable management', exact: true }).click();
    await expect(page).toHaveURL(/\/academic\/newTimetable/);
    await page.goBack();
    await expect(overview).toBeVisible();
    await expect(loading).toHaveCount(0);
    expect(requests).toBe(2);
    await expectHealthy(page);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`loaded-${theme}-${width}.png`), fullPage: true });
  });
});
