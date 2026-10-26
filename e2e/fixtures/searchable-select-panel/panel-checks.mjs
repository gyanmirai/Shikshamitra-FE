import assert from 'node:assert/strict';
import { expect } from '@playwright/test';

export async function panelGeometry(page, trigger) {
  const menu = page.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect
    .poll(() => menu.evaluate((element) => getComputedStyle(element.parentElement).transform))
    .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  const fieldWidth = await trigger.evaluate(
    (element) => element.closest('.MuiFormControl-root').getBoundingClientRect().width
  );
  const metrics = await menu.evaluate((element) => {
    const paper = element.parentElement;
    const header = element.querySelector('.MuiListSubheader-root');
    const field = header.querySelector('.MuiTextField-root');
    const option = element.querySelector('.MuiMenuItem-root');
    const headerStyle = getComputedStyle(header);
    const optionStyle = getComputedStyle(option);
    const paperStyle = getComputedStyle(paper);
    return {
      width: paper.getBoundingClientRect().width,
      left: paper.getBoundingClientRect().left,
      right: paper.getBoundingClientRect().right,
      headerPadding: [headerStyle.paddingLeft, headerStyle.paddingRight],
      optionPadding: [optionStyle.paddingLeft, optionStyle.paddingRight],
      lineHeight: headerStyle.lineHeight,
      bottomGap: header.getBoundingClientRect().bottom - field.getBoundingClientRect().bottom,
      role: header.getAttribute('role'),
      background: paperStyle.backgroundColor,
      backgroundImage: paperStyle.backgroundImage,
    };
  });
  assert.ok(Math.abs(metrics.width - fieldWidth) <= 1, JSON.stringify({ fieldWidth, ...metrics }));
  assert.deepEqual(metrics.headerPadding, metrics.optionPadding);
  assert.ok(metrics.lineHeight === 'normal' || parseFloat(metrics.lineHeight) < 48);
  assert.ok(Math.abs(metrics.bottomGap - 4) <= 1, `Search bottom gap: ${metrics.bottomGap}`);
  assert.equal(metrics.role, 'presentation');
  assert.equal(metrics.backgroundImage, 'none');
  assert.ok(!metrics.background.includes('rgba') || metrics.background.endsWith(', 1)'));
  assert.ok(metrics.left >= 15 && metrics.right <= page.viewportSize().width - 15);
  return metrics;
}

export async function stableWidth(page, trigger, search, query) {
  const initial = await panelGeometry(page, trigger);
  await search.fill(query);
  const filtered = await panelGeometry(page, trigger);
  assert.ok(Math.abs(initial.width - filtered.width) <= 1);
  await search.fill('zzzz-no-synthetic-match');
  const empty = page.getByRole('option', { name: 'No results found', exact: true });
  await expect(empty).toHaveAttribute('aria-disabled', 'true');
  const noResults = await panelGeometry(page, trigger);
  assert.ok(Math.abs(initial.width - noResults.width) <= 1);
  return { initial, filtered, noResults };
}

export async function noHorizontalOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}
