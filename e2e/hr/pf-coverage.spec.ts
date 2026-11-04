import { test, expect } from '@playwright/test';

test('loading does not claim school configuration is missing', async ({ page }) => {
  await page.goto('/?scenario=loading');
  await expect(page.getByRole('status')).toContainText('Loading school PF coverage');
  await expect(page.getByText(/not configured/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Set up PF coverage' })).toHaveCount(0);
});

test('failed reads show Retry and only prompt setup after a successful retry', async ({ page }) => {
  await page.goto('/?scenario=error');
  await expect(page.getByRole('alert')).toContainText('PF coverage could not be loaded');
  await expect(page.getByText(/not configured/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('button', { name: 'Set up PF coverage' })).toBeVisible();
});

test('missing coverage guides read-only users to an administrator', async ({ page }) => {
  await page.goto('/?access=readonly');
  await expect(page.getByText(/Ask an authorized school-wide HR administrator/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Set up PF coverage' })).toHaveCount(0);
});

test('configured coverage stays compact until configuration is requested', async ({ page }) => {
  await page.goto('/?scenario=configured');
  await expect(page.getByText('Covered under PF. Effective 2026-01.')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Configure coverage' }).click();
  await expect(page.getByRole('dialog', { name: 'Configure PF Coverage' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Configure coverage' })).toBeFocused();
});

test('failed saves preserve entries and dirty close supports keep-editing and discard', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Set up PF coverage' }).click();
  const dialog = page.getByRole('dialog', { name: 'Configure PF Coverage' });
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog.getByText('Select school coverage.')).toBeVisible();
  await dialog.getByRole('combobox', { name: /School establishment coverage/ }).click();
  await page.getByRole('option', { name: 'Covered under PF', exact: true }).click();
  await dialog
    .getByRole('textbox', { name: /PF coverage evidence reference/ })
    .fill('Synthetic evidence');
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: /PF coverage evidence reference/ })).toHaveValue(
    'Synthetic evidence'
  );
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(dialog.getByRole('textbox', { name: /PF coverage evidence reference/ })).toHaveValue(
    'Synthetic evidence'
  );
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Discard changes' }).click();
  await expect(dialog).toHaveCount(0);
});

['light', 'dark'].forEach((theme) => {
  [390, 768, 1440].forEach((width) => {
    test(`coverage setup spacing and controls at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/?theme=${theme}`);
      await page.getByRole('button', { name: 'Set up PF coverage' }).click();
      const dialog = page.getByRole('dialog', { name: 'Configure PF Coverage' });
      await expect(dialog.getByRole('button', { name: 'Submit', exact: true })).toBeInViewport();
      await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeInViewport();
      const month = await dialog.getByLabel(/PF coverage effective month/).boundingBox();
      const select = await dialog
        .getByRole('combobox', { name: /School establishment coverage/ })
        .boundingBox();
      expect(select!.y - (month!.y + month!.height)).toBeGreaterThanOrEqual(16);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({ path: `.artifacts/pf-coverage/${theme}-${width}.png` });
    });
  });
});
