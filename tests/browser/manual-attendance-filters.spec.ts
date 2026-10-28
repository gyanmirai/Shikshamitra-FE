/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    test(`attendance filters align within their toolbar at ${viewport.width}px in ${theme}`, async ({
      page,
    }, info) => {
      await page.setViewportSize(viewport);
      await page.goto(`/?surface=manual-attendance&date=2026-10-28&theme=${theme}`);
      const group = page.getByRole('combobox', { name: 'Staff group', exact: true });
      await expect(group).toBeEnabled();
      const bounds = await group.evaluate((element) => {
        const groupRect = element.closest('.MuiFormControl-root')!.getBoundingClientRect();
        return { width: groupRect.width, x: groupRect.x, y: groupRect.y, height: groupRect.height };
      });
      if (viewport.width >= 1200) expect(bounds.width).toBeLessThan(260);
      const toolbar = page.getByRole('region', {
        name: 'Attendance filters and actions',
        exact: true,
      });
      await expect(toolbar).toBeVisible();
      const layout = await toolbar.evaluate((element) => {
        const outer = element.getBoundingClientRect();
        const fields = Array.from(element.querySelectorAll('.MuiFormControl-root')).map((field) => {
          const rect = field.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        });
        return { left: outer.left, right: outer.right, fields };
      });
      expect(layout.fields).toHaveLength(3);
      for (const field of layout.fields) {
        expect(field.left - layout.left).toBeGreaterThanOrEqual(7);
        expect(layout.right - field.right).toBeGreaterThanOrEqual(7);
      }
      if (viewport.width >= 1200) {
        expect(Math.abs(layout.fields[0].top - layout.fields[1].top)).toBeLessThan(1);
        expect(Math.abs(layout.fields[1].top - layout.fields[2].top)).toBeLessThan(1);
      } else if (viewport.width < 600) {
        expect(layout.fields[1].top).toBeGreaterThanOrEqual(layout.fields[0].bottom + 7);
        expect(layout.fields[2].top).toBeGreaterThanOrEqual(layout.fields[1].bottom + 7);
      }
      await Promise.all(
        ['Apply filters', 'Clear filters', 'Reset', 'Lock', 'Save'].map((action) =>
          expect(toolbar.getByRole('button', { name: action, exact: true })).toBeInViewport()
        )
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`attendance-filters-${theme}-${viewport.width}.png`),
      });
    });
  }
}

test('attendance filters preserve apply, clear and dirty-draft locks', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T06:00:00Z'));
  await page.goto('/?surface=manual-attendance&date=2026-10-28');
  const group = page.getByRole('combobox', { name: 'Staff group', exact: true });
  await expect(group).toBeEnabled();
  await group.click();
  await page.getByRole('option', { name: 'Non Teaching', exact: true }).click();
  await page.getByRole('textbox', { name: 'Department contains', exact: true }).fill(' Support ');
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await expect(page.getByText('Synthetic Support', { exact: false })).toBeVisible();
  await expect(page.getByText('Synthetic Teacher', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Applied filters:', { exact: false })).toContainText('Support');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByText('Synthetic Teacher', { exact: false })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Department contains', exact: true })).toHaveValue(
    ''
  );
  await page.getByRole('button', { name: 'Mark SYN-1 Absent', exact: true }).click();
  await expect(group).toBeDisabled();
  await expect(
    page.getByRole('textbox', { name: 'Department contains', exact: true })
  ).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Apply filters', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Clear filters', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
});
