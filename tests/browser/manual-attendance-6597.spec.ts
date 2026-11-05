import { test, expect } from '@playwright/test';

[390, 768, 1440].forEach((width) => {
  ['light', 'dark'].forEach((theme) => {
    test(`filters and aligned controls at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const calls: URL[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/take-attendance/day')) calls.push(new URL(request.url()));
      });
      await page.goto(`/?date=2026-10-24&theme=${theme}`);
      const present = page.getByRole('button', { name: 'Mark SYN-1 Present', exact: true });
      await expect(present).toBeVisible();
      const region = page.getByRole('region', { name: 'Attendance filters and actions' });
      await expect(region.getByRole('combobox', { name: 'Staff group' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Filter status', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Sort by status', exact: true })).toHaveCount(
        0
      );
      const header = await page
        .getByRole('button', { name: 'Mark all as Present', exact: true })
        .boundingBox();
      const row = await present.boundingBox();
      expect(Math.abs(header!.x - row!.x)).toBeLessThan(1);
      expect(Math.abs(header!.width - row!.width)).toBeLessThan(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      if (width === 1440) {
        const group = await region.getByRole('combobox', { name: 'Staff group' }).boundingBox();
        const department = await region
          .getByRole('textbox', { name: 'Department contains' })
          .boundingBox();
        expect(Math.abs(group!.y - department!.y)).toBeLessThan(2);
      }
      // Draft fields alone do not change the active query. Apply preserves false and trims department.
      await region.getByRole('combobox', { name: 'Staff group' }).click();
      await page.getByRole('option', { name: 'Non Teaching', exact: true }).click();
      await region.getByRole('textbox', { name: 'Department contains' }).fill(' Support ');
      await expect(present).toBeVisible();
      await region.getByRole('button', { name: 'Apply filters' }).click();
      await expect(
        page.getByRole('button', { name: 'Mark SYN-2 Present', exact: true })
      ).toBeVisible();
      await expect(present).toHaveCount(0);
      expect(calls.at(-1)!.searchParams.get('isTeaching')).toBe('false');
      expect(calls.at(-1)!.searchParams.get('department')).toBe('Support');
      expect(calls.at(-1)!.searchParams.get('skipCount')).toBe('0');
      await region.getByRole('textbox', { name: 'Department contains' }).fill('missing department');
      await region.getByRole('button', { name: 'Apply filters' }).click();
      await expect(
        page.getByText('No staff found for the selected date', { exact: true })
      ).toBeVisible();
      await region.getByRole('button', { name: 'Clear filters' }).click();
      await expect(present).toBeVisible();
      // Table criteria are cleared too, rather than silently leaving the screen filtered.
      await page.getByRole('button', { name: 'Filter Name', exact: true }).click();
      await page.getByRole('combobox', { name: 'Filter Type *' }).click();
      await page.getByRole('option', { name: 'Contains', exact: true }).click();
      await page.getByRole('textbox', { name: 'Name *', exact: true }).fill('no matching staff');
      await page.getByRole('button', { name: 'Apply', exact: true }).click();
      await expect(present).toHaveCount(0);
      await region.getByRole('button', { name: 'Clear filters' }).click();
      await expect(present).toBeVisible();
      await page.getByRole('button', { name: 'Mark SYN-1 Absent', exact: true }).click();
      await expect(region.getByRole('button', { name: 'Apply filters' })).toBeDisabled();
      await region.getByRole('button', { name: 'Reset', exact: true }).click();
      await page.getByRole('button', { name: 'Yes, Reset', exact: true }).click();
      await expect(region.getByRole('button', { name: 'Apply filters' })).toBeEnabled();
      await page.screenshot({
        path: `.artifacts/manual-attendance/${width}-${theme}.png`,
        fullPage: true,
      });
    });
  });
});

test('date changes reset pagination and late day responses cannot restore obsolete rows', async ({
  page,
}) => {
  await page.goto('/?date=2026-10-24');
  await expect(page.getByRole('button', { name: 'Mark SYN-1 Present', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go to next page' }).click();
  await expect(
    page.getByRole('button', { name: 'Mark SYN-51 Present', exact: true })
  ).toBeVisible();
  // MUI's segmented accessible date field supports keyboard day editing.
  const day = page.getByRole('spinbutton', { name: 'Day' });
  await day.fill('23');
  await day.press('Tab');
  await day.fill('22');
  await day.press('Tab');
  await expect(page.getByRole('button', { name: 'Mark SYN-1 Present', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '22/10/2026', exact: true }).first()).toBeVisible();
  await page.waitForTimeout(900);
  await expect(page.getByRole('cell', { name: '23/10/2026', exact: true })).toHaveCount(0);
});
