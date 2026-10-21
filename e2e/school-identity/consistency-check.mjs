import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/school-identity/consistency/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const results = [];
const check = async (name, action) => {
  await action();
  results.push({ name, status: 'passed' });
  console.log(`PASS ${name}`);
};
const choose = async (label, option) => {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
const safeWidth = async () =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

try {
  await check(
    'both scopes have contained accessible layouts across three widths and both themes',
    async () => {
      for (const [name, query] of [
        ['defaults', 'empty'],
        ['choose-board', 'empty&scope=overrides'],
        [
          'override',
          'empty&scope=overrides&academicYearId=year-26&boardId=year-26-CBSE&mediumId=year-26-CBSE-en',
        ],
      ]) {
        for (const [width, height] of [
          [390, 844],
          [768, 1024],
          [1440, 900],
        ]) {
          await page.setViewportSize({ width, height });
          await page.goto(`http://127.0.0.1:4319/?${query}`);
          if (name === 'choose-board')
            await expect(
              page.getByText('Select a board to review its images', { exact: true })
            ).toBeVisible();
          else
            await expect(
              page.getByRole('region', { name: 'Identity assets', exact: true })
            ).toBeVisible();
          for (const theme of ['light', 'dark']) {
            if (theme === 'dark')
              await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
            if (name !== 'choose-board')
              await expect(
                page.getByRole('button', {
                  name: name === 'defaults' ? 'Edit school defaults' : 'Edit override',
                  exact: true,
                })
              ).toHaveCSS(
                'background-color',
                theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(28, 37, 46)'
              );
            await safeWidth();
            if (width === 390) {
              const row = await page
                .getByRole('tablist', { name: 'School identity scope', exact: true })
                .boundingBox();
              for (const label of ['School defaults', 'Board, medium & organization overrides']) {
                const tab = await page.getByRole('tab', { name: label, exact: true }).boundingBox();
                expect(tab.x).toBeGreaterThanOrEqual(row.x);
                expect(tab.x + tab.width).toBeLessThanOrEqual(row.x + row.width);
              }
            }
            const audit = await new AxeBuilder({ page })
              .include('[role="tablist"]')
              .include('[role="tabpanel"]')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze();
            expect(
              audit.violations,
              `${name} ${width}px ${theme}: ${JSON.stringify(audit.violations)}`
            ).toEqual([]);
            await page.screenshot({
              path: fileURLToPath(new URL(`${name}-${width}-${theme}.png`, output)),
              fullPage: true,
            });
          }
        }
      }
    }
  );
  await check(
    'current context, reload, and back/forward preserve the selected scope and filters',
    async () => {
      await page.goto('http://127.0.0.1:4319/?empty&scope=overrides');
      await page.getByRole('button', { name: 'Use current context', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Board', exact: true })).toContainText(
        'CBSE'
      );
      await expect(page.getByRole('combobox', { name: 'Medium', exact: true })).toContainText(
        'English'
      );
      await expect(page).toHaveURL(/boardId=year-26-CBSE/);
      await page.reload();
      await expect(page.getByRole('button', { name: 'Edit override', exact: true })).toBeEnabled();
      await page.getByRole('tab', { name: 'School defaults', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'Edit school defaults', exact: true })
      ).toBeEnabled();
      await page.goBack();
      await expect(page.getByRole('combobox', { name: 'Medium', exact: true })).toContainText(
        'English'
      );
      await page.goForward();
      await expect(page.getByRole('tab', { name: 'School defaults', exact: true })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await page.getByRole('tab', { name: 'Board, medium & organization overrides', exact: true }).click();
      await expect(page.getByRole('combobox', { name: 'Board', exact: true })).toContainText(
        'CBSE'
      );
      await choose('Academic year', '2025-2026');
      await expect(page.getByRole('combobox', { name: 'Board', exact: true })).toContainText(
        'Select board'
      );
      await expect(page.getByRole('combobox', { name: 'Medium', exact: true })).toBeDisabled();
      expect(new URL(page.url()).searchParams.has('mediumId')).toBe(false);
    }
  );
  await check('empty academic options and load errors provide an actionable state', async () => {
    await page.goto('http://127.0.0.1:4319/?scope=overrides&noYears');
    await expect(
      page.getByRole('region', { name: 'Document context', exact: true }).getByRole('alert')
    ).toContainText('No academic years are available for your access');
    await page.goto('http://127.0.0.1:4319/?scope=overrides&noBoards');
    await expect(page.getByText('No boards in this academic year', { exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'School defaults', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Edit school defaults', exact: true })
    ).toBeEnabled();
    await page.goto('http://127.0.0.1:4319/?scope=overrides&failOptionsOnce');
    await expect(
      page.getByRole('region', { name: 'Document context', exact: true }).getByRole('alert')
    ).toContainText('Academic options could not be loaded');
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Board', exact: true })).toBeEnabled();
  });
  await check(
    'restricted and read-only scopes do not expose unavailable menu actions',
    async () => {
      await page.goto(
        'http://127.0.0.1:4319/?scope=overrides&boardId=year-26-CBSE&signatureRestricted'
      );
      await page.getByRole('button', { name: 'More actions', exact: true }).click();
      await expect(
        page.getByRole('menuitem', { name: 'Copy from another year', exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByRole('menuitem', { name: 'Reset to inherited', exact: true })
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await page.goto('http://127.0.0.1:4319/?scope=overrides&boardId=year-26-CBSE&readOnly');
      await expect(page.getByRole('button', { name: 'View history', exact: true })).toBeEnabled();
      await expect(page.getByRole('button', { name: 'More actions', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Edit override', exact: true })).toHaveCount(0);
    }
  );
  expect(errors).toEqual([]);
  await check('browser back preserves an open unsaved identity draft', async () => {
    await page.goto('http://127.0.0.1:4319/?scope=overrides');
    await page.getByRole('button', { name: 'Use current context', exact: true }).click();
    await page.getByRole('button', { name: 'Edit override', exact: true }).click();
    const editor = page.getByRole('dialog', { name: 'Edit School Identity Override', exact: true });
    const banner = editor.getByRole('combobox', { name: 'School banner / letterhead setting' });
    await banner.click();
    await page.getByRole('option', { name: 'Do not display', exact: true }).click();
    const location = page.url();
    await page.evaluate(() => window.history.back());
    const confirmation = page.getByRole('dialog', {
      name: 'Discard School Identity Changes?',
      exact: true,
    });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(banner).toContainText('Do not display');
    await expect(page).toHaveURL(location);
    page.once('dialog', (dialog) => dialog.accept());
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(editor).not.toBeVisible();
  });
  await check(
    'card explanations are available through keyboard-accessible info icons',
    async () => {
      await page.goto('http://127.0.0.1:4319/');
      await expect(
        page.getByText('Used when no board or medium override is configured.', { exact: true })
      ).not.toBeVisible();
      for (const [name, explanation] of [
        ['Identity assets information', 'Review the effective school images'],
        ['Document layout preview information', 'Use Preview document'],
      ]) {
        await page.keyboard.press('Tab');
        const info = page.getByRole('button', { name, exact: true });
        await info.focus();
        await expect(page.getByRole('tooltip')).toContainText(explanation);
        await info.press('Escape');
        await page.getByRole('button', { name: 'View history', exact: true }).focus();
        await expect(page.getByRole('tooltip')).not.toBeVisible();
      }
      const document = page.getByRole('region', { name: 'Document layout preview', exact: true });
      await expect(
        document.getByRole('button', { name: 'Preview document', exact: true })
      ).toBeEnabled();
      await page.getByRole('button', { name: 'Edit school defaults', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await page.keyboard.press('Tab');
      await dialog.getByRole('button', { name: 'School logo information', exact: true }).focus();
      await expect(page.getByRole('tooltip')).toContainText(
        'Set the logo used on school documents.'
      );
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(dialog).not.toBeVisible();
    }
  );
  expect(errors).toEqual([]);
  await writeFile(new URL('report.json', output), JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
