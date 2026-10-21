import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../../.artifacts/school-identity/', import.meta.url);
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
const contained = async () => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true
  );
};

try {
  await check('empty and populated layouts reflow across three widths in both themes', async () => {
    for (const state of ['empty', 'populated']) {
      for (const [width, height] of [
        [390, 844],
        [768, 1024],
        [1440, 900],
      ]) {
        await page.setViewportSize({ width, height });
        await page.goto(`http://127.0.0.1:4319/${state === 'empty' ? '?empty' : ''}`);
        const assets = page.getByRole('region', { name: 'Identity assets', exact: true });
        const layout = page.getByRole('region', { name: 'Document layout preview', exact: true });
        await expect(assets).toBeVisible();
        await expect(layout).toBeVisible();
        const toolbar = page.getByRole('group', { name: 'School identity toolbar', exact: true });
        const tabs = toolbar.getByRole('tablist');
        const actions = toolbar.getByRole('group', {
          name: 'School identity actions',
          exact: true,
        });
        await expect(
          actions.getByRole('button', { name: 'View history', exact: true })
        ).toBeVisible();
        await expect(
          actions.getByRole('button', { name: 'Edit school defaults', exact: true })
        ).toBeVisible();
        await expect(
          page.getByRole('heading', { name: 'School defaults', exact: true })
        ).toHaveCount(0);
        const tabBounds = await tabs.boundingBox();
        const actionBounds = await actions.boundingBox();
        if (width >= 1200) {
          expect(actionBounds.x).toBeGreaterThanOrEqual(tabBounds.x + tabBounds.width);
          expect(actionBounds.y).toBeLessThan(tabBounds.y + tabBounds.height);
        } else if (width === 390) {
          expect(actionBounds.y).toBeGreaterThanOrEqual(tabBounds.y + tabBounds.height);
        }
        if (state === 'empty') {
          await expect(assets.getByText('No image configured', { exact: true })).toHaveCount(3);
          await expect(layout.getByRole('img')).toHaveCount(0);
        } else {
          await expect(assets.getByRole('img')).toHaveCount(3);
          await expect(layout.getByRole('img')).toHaveCount(3);
        }
        for (const theme of ['light', 'dark']) {
          if (theme === 'dark')
            await page.getByRole('button', { name: 'Switch theme', exact: true }).click();
          await expect(
            page.getByRole('button', { name: 'Edit school defaults', exact: true })
          ).toHaveCSS(
            'background-color',
            theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(28, 37, 46)'
          );
          await contained();
          const left = await assets.boundingBox();
          const right = await layout.boundingBox();
          if (width >= 1200) expect(left.x + left.width).toBeLessThanOrEqual(right.x);
          else expect(left.y + left.height).toBeLessThanOrEqual(right.y);
          for (const label of ['Preview document', 'View history', 'Edit school defaults']) {
            const action = page.getByRole('button', { name: label, exact: true });
            await expect(action).toBeEnabled();
            const bounds = await action.boundingBox();
            expect(bounds.x).toBeGreaterThanOrEqual(0);
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
          }
          const audit = await new AxeBuilder({ page })
            .include('[role="tabpanel"]')
            .include('[role="tablist"]')
            .include('[aria-label="School identity toolbar"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          expect(
            audit.violations,
            `${width}px ${theme}: ${JSON.stringify(audit.violations)}`
          ).toEqual([]);
          await page.screenshot({
            path: fileURLToPath(new URL(`modern-${state}-${width}-${theme}.png`, output)),
            fullPage: true,
          });
        }
      }
    }
  });

  await check('tabs and history remain operable using the keyboard', async () => {
    await page.goto('http://127.0.0.1:4319/?empty');
    const defaults = page.getByRole('tab', { name: 'School defaults', exact: true });
    await defaults.focus();
    await defaults.press('ArrowRight');
    await expect(
      page.getByRole('tab', { name: 'Board, medium & organization overrides', exact: true })
    ).toHaveCSS('outline-style', 'solid');
    await page.getByRole('tab', { name: 'Board, medium & organization overrides', exact: true }).press('Enter');
    await expect(page.getByRole('combobox', { name: 'Board', exact: true })).toBeVisible();
    await page
      .getByRole('tab', { name: 'Board, medium & organization overrides', exact: true })
      .press('ArrowLeft');
    await defaults.press('Enter');
    const history = page.getByRole('button', { name: 'View history', exact: true });
    await history.focus();
    await history.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(history).toBeFocused();
  });

  await check(
    'read and thumbnail errors remain contained on mobile and recover using Retry',
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('http://127.0.0.1:4319/?empty&failReadOnce');
      await expect(
        page.getByRole('alert').filter({ hasText: 'School Identity could not be loaded' })
      ).toBeVisible();
      await page.getByRole('button', { name: 'Retry', exact: true }).click();
      await expect(
        page.getByRole('region', { name: 'Identity assets', exact: true })
      ).toBeVisible();
      await page.goto('http://127.0.0.1:4319/?failImageOnce');
      await expect(
        page.getByText('Image could not be loaded.', { exact: true }).first()
      ).toBeVisible();
      await contained();
      await page.getByRole('button', { name: 'Retry', exact: true }).first().click();
      await expect(page.getByText('Image could not be loaded.', { exact: true })).toHaveCount(0);
      await contained();
    }
  );

  await check(
    'restricted signatures stay absent from both assets and document layout',
    async () => {
      await page.goto('http://127.0.0.1:4319/?signatureRestricted');
      await expect(page.getByText('Signature access is restricted', { exact: true })).toBeVisible();
      const layout = page.getByRole('region', { name: 'Document layout preview', exact: true });
      await expect(layout.getByRole('img')).toHaveCount(2);
      await expect(layout.getByText('Signature hidden', { exact: true })).toBeVisible();
      await expect(page.getByText('Synthetic Principal', { exact: false })).toHaveCount(0);
    }
  );

  expect(errors).toEqual([]);
  await check('mobile content reflows with text enlarged to 200 percent', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:4319/?empty');
    await expect(
      page.getByRole('button', { name: 'Edit school defaults', exact: true })
    ).toBeEnabled();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await contained();
    await expect(page.getByText('Sample layout only', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Edit school defaults', exact: true })
    ).toBeVisible();
    await page.screenshot({
      path: fileURLToPath(new URL('modern-mobile-text-200.png', output)),
      fullPage: true,
    });
  });
  await writeFile(
    new URL('modern-layout-report.json', output),
    JSON.stringify({ results, errors }, null, 2)
  );
} finally {
  await browser.close();
}
