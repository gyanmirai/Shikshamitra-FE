import { test, expect } from '@playwright/test';

import { login, prepare, openGuide, fixtureApi, expectHealthy } from './academic-module-setup.helpers';

const subjects = Array.from({ length: 35 }, (_, index) => ({
  id: `subject-${index}`, name: `Subject ${index + 1}`, displayName: `Subject ${index + 1}`,
  category: 'Scholastic', color: '#1565c0', status: 'Active', canDelete: true,
  usedInClassesCount: 0, lastUpdatedAt: '2026-10-29T00:00:00Z',
}));
const groups = subjects.map((subject, index) => ({
  id: `group-${index}`, name: `Elective ${index + 1}`, description: 'Language options',
  color: '#1565c0', status: 'Active', subjects: [subject], canDelete: true,
  usedInClassesCount: 0, lastUpdatedAt: '2026-10-29T00:00:00Z',
}));

test.beforeEach(async ({ page, request }) => {
  await request.post(`${fixtureApi}/fixture/reset`, { data: { visited: true } });
  await prepare(page, request);
  await page.route('**/academic-mediums/*/subjects?*', (route) => route.fulfill({ json: subjects }));
  await page.route('**/academic-mediums/*/subjects/lookup?*', (route) => route.fulfill({ json: subjects }));
  await page.route('**/academic-mediums/*/elective-groups?*', (route) => route.fulfill({ json: groups }));
  await login(page);
});

test('curriculum replaces old content immediately during delayed tab saves and recovers failures', async ({ page, request }) => {
  await openGuide(page, 'stage=curriculum&setting=subjects');
  await expect(page.getByRole('table', { name: 'Subjects table', exact: true })).toBeVisible();
  await request.post(`${fixtureApi}/fixture/failure`, { data: { saveDelay: 1800 } });
  await page.getByRole('tab', { name: 'Elective Group Creation', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Loading setting' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Subjects table', exact: true })).toBeHidden();
  await expect(page.getByRole('table', { name: 'Elective Groups table', exact: true })).toBeVisible();
  await request.post(`${fixtureApi}/fixture/failure`, { data: { failNext: 'progress', saveDelay: 0 } });
  await page.getByRole('tab', { name: 'Subjects Creation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reload', exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading setting' })).toHaveCount(0);
  await expect(page.getByRole('table', { name: 'Elective Groups table', exact: true })).toBeVisible();
  await expectHealthy(page);
});

[{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 768, height: 1024 }, { width: 390, height: 844 }].forEach((viewport) => {
  test(`curriculum contains large tables and form scrolling at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openGuide(page, 'stage=curriculum&setting=subjects');
    const table = page.getByRole('table', { name: 'Subjects table', exact: true });
    await expect(table).toBeVisible();
    const scroll = table.locator('xpath=ancestor::*[contains(@class,"simplebar-content-wrapper")][1]');
    expect(await scroll.evaluate((element) => element.clientHeight)).toBeGreaterThan(80);
    await expect.poll(() => scroll.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('button', { name: 'Save & exit', exact: true })).toBeInViewport();
    expect(await footer.getByRole('button', { name: 'Save & exit', exact: true }).evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe('solid');
    await page.getByRole('button', { name: 'Add subject', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('tab', { name: 'Elective Group Creation', exact: true }).click();
    const elective = page.getByRole('table', { name: 'Elective Groups table', exact: true });
    await expect(elective).toBeVisible();
    await expect.poll(() => elective.locator('xpath=ancestor::*[contains(@class,"simplebar-content-wrapper")][1]').evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await page.getByRole('button', { name: 'Add Elective Group', exact: true }).click();
    await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
    await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport();
    await expectHealthy(page);
  });
});

test('curriculum data failures show a persistent retry action and recover the requested tab', async ({ page }) => {
  let failed = true;
  await page.route('**/academic-mediums/*/elective-groups?*', async (route) => {
    if (failed) await route.fulfill({ status: 503, json: { error: { message: 'Curriculum data unavailable' } } });
    else await route.fulfill({ json: groups });
  });
  await openGuide(page, 'stage=curriculum&setting=subjects');
  await page.getByRole('tab', { name: 'Elective Group Creation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Subjects table', exact: true })).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('row', { name: 'View elective group Elective 1', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toHaveCount(0);
  await expectHealthy(page);
});

test('curriculum dialogs keep actions visible and scroll their body in a short dark viewport', async ({ page, request }) => {
  await prepare(page, request, 'dark');
  await page.setViewportSize({ width: 844, height: 390 });
  await openGuide(page, 'stage=curriculum&setting=subjects');
  await page.getByRole('button', { name: 'Add subject', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
  await expect.poll(() => dialog.locator('.simplebar-content-wrapper').evaluate((element) => element.scrollHeight > element.clientHeight && element.clientHeight > 0)).toBe(true);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('tab', { name: 'Elective Group Creation', exact: true }).click();
  await page.getByRole('button', { name: 'Add Elective Group', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
  await expect.poll(() => dialog.locator('.simplebar-content-wrapper').evaluate((element) => element.scrollHeight > element.clientHeight && element.clientHeight > 0)).toBe(true);
  await expectHealthy(page);
});
