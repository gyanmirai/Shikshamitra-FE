/* eslint-disable import/no-extraneous-dependencies -- Playwright is a test dependency. */
import { test, expect } from '@playwright/test';

test('centers the empty fee heads and stretches the workspace divider', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByText('Fixture controls', { exact: true }).click();
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await page.getByRole('button', { name: 'Open full-screen workspace', exact: true }).click();
  const workspace = page.getByRole('dialog').filter({ hasText: 'Manage Fee Structure' });
  await expect(workspace.getByRole('tab', { selected: true })).toHaveCSS(
    'border-top-color',
    'rgb(0, 0, 0)'
  );
  await workspace.getByRole('button', { name: 'Add Structure', exact: true }).click();

  const stepper = workspace.locator('.MuiStepper-vertical:visible');
  const divider = await stepper.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    workspaceHeight: element.parentElement!.getBoundingClientRect().height,
    borderWidth: getComputedStyle(element).borderRightWidth,
  }));
  expect(divider.borderWidth).toBe('1px');
  expect(divider.height).toBeCloseTo(divider.workspaceHeight, 0);

  const empty = workspace.getByText('No fee heads added.', { exact: true });
  await expect(empty).toBeVisible();
  const center = await empty.evaluate((element) => {
    const illustration = element.previousElementSibling!.getBoundingClientRect();
    const label = element.getBoundingClientRect();
    const tableHeader = element.closest('table')!.tHead!.getBoundingClientRect();
    const viewport = element.closest('.simplebar-content-wrapper')!.getBoundingClientRect();
    return {
      content: (illustration.top + label.bottom) / 2,
      tableBody: (tableHeader.bottom + viewport.bottom) / 2,
    };
  });
  expect(Math.abs(center.content - center.tableBody)).toBeLessThan(4);
});

[
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
].forEach((viewport) => {
  (['light', 'dark'] as const).forEach((mode) => {
    test(`${viewport.width}px ${mode}: structure layout, navigation and help`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.getByText('Fixture controls', { exact: true }).click();
      await page
        .getByRole('button', { name: `${mode === 'light' ? 'Light' : 'Dark'} theme`, exact: true })
        .click();
      await page.getByRole('button', { name: 'Open full-screen workspace', exact: true }).click();
      const workspace = page.getByRole('dialog').filter({ hasText: 'Manage Fee Structure' });
      await expect(
        workspace.getByRole('button', { name: 'Step 1: Fee heads & terms' })
      ).toBeVisible();
      await expect(
        workspace.getByRole('columnheader', { name: 'Annual amount', exact: true })
      ).toHaveCSS('text-align', 'left');
      const amount = workspace.getByRole('group', {
        name: 'Annual amount for Tuition Fee',
        exact: true,
      });
      await expect(amount).toHaveText(/24,000/);
      const header = workspace.getByRole('columnheader', { name: 'Annual amount', exact: true });
      const headerBounds = await header.boundingBox();
      const cellBounds = await amount.locator('..').boundingBox();
      expect(Math.abs(headerBounds!.x - cellBounds!.x)).toBeLessThan(1);
      expect(Math.abs(headerBounds!.width - cellBounds!.width)).toBeLessThan(1);
      await expect(workspace.getByRole('columnheader', { name: 'Actions', exact: true })).toHaveCSS(
        'text-align',
        'center'
      );
      const stepper = workspace.locator('.MuiStepper-horizontal:visible');
      const stepMetrics = await stepper.evaluate((element) => ({
        width: element.clientWidth,
        scroll: element.scrollWidth,
        overflow: getComputedStyle(element).overflowX,
      }));
      expect(stepMetrics.scroll).toBeLessThanOrEqual(stepMetrics.width + 1);
      expect(stepMetrics.overflow).not.toBe('auto');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await expect(workspace.getByRole('button', { name: 'Edit Draft', exact: true })).toHaveCount(
        0
      );
      await expect(
        workspace.getByRole('button', { name: 'Edit Tuition Fee', exact: true })
      ).toBeVisible();
      await expect(
        workspace.getByRole('button', { name: 'Delete Tuition Fee', exact: true })
      ).toBeVisible();
      await expect(
        workspace
          .getByRole('heading', { name: 'Fee Heads', exact: true })
          .locator('xpath=ancestor::section')
          .getByRole('button', { name: 'Fee Head', exact: true })
      ).toBeVisible();
      const longName = '8th Fee Structure GSEB — Annual Tuition, Transport and Activities '
        .repeat(3)
        .trim();
      await workspace.getByRole('textbox', { name: 'Structure name', exact: true }).fill(longName);
      if (viewport.width < 1200)
        await workspace.getByRole('button', { name: /^Structures ·/ }).click();
      const list = page.getByRole('list', { name: 'Fee structures', exact: true });
      const selected = list.locator('[aria-current="true"]');
      await expect(selected).toContainText(longName);
      const nameMetrics = await selected.locator('.MuiTypography-root').evaluate((element) => ({
        wrapping: getComputedStyle(element).whiteSpace,
        width: element.clientWidth,
        scroll: element.scrollWidth,
      }));
      expect(nameMetrics.wrapping).not.toBe('nowrap');
      expect(nameMetrics.scroll).toBeLessThanOrEqual(nameMetrics.width + 1);
      await selected.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(selected).toBeFocused();
      await selected.hover();
      await expect(page.getByRole('tooltip').filter({ hasText: longName })).toHaveCount(0);
      await expect(list.getByRole('img', { name: 'Unsaved changes' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Add Structure', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Copy Structure', exact: true })).toBeVisible();
      if (viewport.width < 1200)
        await page.getByRole('button', { name: 'Close Structures', exact: true }).click();
      await workspace
        .getByRole('button', { name: 'General Information information', exact: true })
        .hover();
      await expect(
        page.getByRole('tooltip').filter({ hasText: "Name this class's fee structure" })
      ).toBeVisible();
      await workspace.getByRole('button', { name: 'Step 2: Policies', exact: true }).click();

      await expect(
        workspace.getByRole('button', { name: 'Collection Policy information', exact: true })
      ).toBeVisible();
      await workspace
        .getByRole('button', { name: 'Step 3: Review & publish', exact: true })
        .click();
      await expect(
        workspace.getByRole('button', { name: 'Check Readiness', exact: true })
      ).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('review.png') });
      await workspace
        .getByRole('button', { name: 'Step 1: Fee heads & terms', exact: true })
        .click();
      await expect(
        workspace.getByRole('textbox', { name: 'Structure name', exact: true })
      ).toHaveValue(longName);
      await page.screenshot({ path: testInfo.outputPath('fee-heads.png') });
    });
  });
});
