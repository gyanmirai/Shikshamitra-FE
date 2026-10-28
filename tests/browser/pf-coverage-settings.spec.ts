/* eslint-disable no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const coveragePath = /\/api\/payroll\/pf-rules\/coverage(?:\?|$)/;
const currentCoverage = {
  hasSchoolWideScope: true,
  history: [
    {
      id: 'coverage-1',
      effectiveMonth: '2026-10-01',
      isCovered: true,
      evidenceReference: 'Synthetic registration',
      isCancelled: false,
    },
  ],
};
const panel = (page: Page) =>
  page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'School PF Coverage', exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T06:00:00Z'));
});

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`PF coverage uses an aligned section and compact action at ${viewport.width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize(viewport);
      await page.goto(`/?surface=pf&theme=${theme}`);
      const card = panel(page);
      await expect(
        card.getByText(/No PF coverage record is effective for October 2026/)
      ).toBeVisible();
      await expect(
        card.getByRole('button', { name: 'School PF Coverage information', exact: true })
      ).toBeVisible();
      const save = card.getByRole('button', { name: 'Save PF coverage', exact: true });
      await expect(save).toBeInViewport();
      const bounds = await card.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const fields = Array.from(element.querySelectorAll('form > fieldset > div')).map(
          (field) => {
            const inner = field.getBoundingClientRect();
            return { left: inner.left, right: inner.right, top: inner.top, bottom: inner.bottom };
          }
        );
        const button = element.querySelector('button[type="submit"]')!.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          fields,
          buttonWidth: button.width,
          buttonRight: button.right,
        };
      });
      expect(bounds.fields).toHaveLength(3);
      expect(bounds.buttonWidth).toBeLessThan(260);
      expect(Math.abs(bounds.buttonRight - bounds.fields[2].right)).toBeLessThan(1);
      for (const field of bounds.fields) {
        expect(field.left - bounds.left).toBeGreaterThanOrEqual(11);
        expect(bounds.right - field.right).toBeGreaterThanOrEqual(11);
      }
      if (viewport.width >= 600) {
        expect(bounds.fields[0].top).toBe(bounds.fields[1].top);
        expect(bounds.fields[1].left).toBeGreaterThan(bounds.fields[0].right);
      } else {
        expect(bounds.fields[1].top).toBeGreaterThan(bounds.fields[0].bottom);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`pf-coverage-${theme}-${viewport.width}.png`),
      });
    });
  }
}

test('PF coverage distinguishes pending, failed and configured states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route(coveragePath, async (route) => {
    requests += 1;
    if (requests === 1) {
      await pending;
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentCoverage),
    });
  });
  await page.goto('/?surface=pf');
  try {
    await expect(page.getByRole('progressbar', { name: 'Loading PF coverage' })).toBeVisible();
    await expect(page.getByText(/No PF coverage record/)).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.getByText('PF coverage could not be loaded.', { exact: true })).toBeVisible();
  await expect(page.getByText(/No PF coverage record/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(panel(page).getByText('Covered under PF', { exact: true })).toBeVisible();
  await expect(panel(page).getByRole('status')).toHaveText('Effective from October 2026.');
  await expect(page.getByText(/No PF coverage record/)).toHaveCount(0);
});

test('PF coverage retains failed-save values and retries with the same request key', async ({
  page,
}) => {
  const writes: Array<Record<string, unknown>> = [];
  await page.route(coveragePath, async (route) => {
    if (route.request().method() !== 'PUT') return route.continue();
    writes.push(route.request().postDataJSON());
    return route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Synthetic coverage save failed.' }),
    });
  });
  await page.goto('/?surface=pf');
  const card = panel(page);
  await card.getByRole('button', { name: 'Save PF coverage', exact: true }).click();
  await expect(card.getByText('Select school coverage.', { exact: true })).toBeVisible();
  expect(writes).toHaveLength(0);
  await card.getByRole('combobox', { name: 'School establishment coverage', exact: true }).click();
  await page.getByRole('option', { name: 'Covered under PF', exact: true }).click();
  await card
    .getByRole('textbox', { name: /^PF coverage evidence reference/ })
    .fill('Synthetic registration');
  await card.getByRole('button', { name: 'Save PF coverage', exact: true }).click();
  await expect(card.getByText('Synthetic coverage save failed.', { exact: true })).toBeVisible();
  await expect(card.getByRole('textbox', { name: /^PF coverage evidence reference/ })).toHaveValue(
    'Synthetic registration'
  );
  await card.getByRole('button', { name: 'Save PF coverage', exact: true }).click();
  await expect.poll(() => writes.length).toBe(2);
  expect(writes[1]).toEqual(writes[0]);
});
