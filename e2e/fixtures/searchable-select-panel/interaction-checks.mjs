import { expect } from '@playwright/test';

import { stableWidth, panelGeometry, noHorizontalOverflow } from './panel-checks.mjs';

export async function checkBoard(page, screenshotPath) {
  const trigger = page.getByRole('combobox', { name: 'Board', exact: true, includeHidden: true });
  await expect(page.getByText('Class name is required', { exact: true })).toBeVisible();
  await expect(page.getByText('Division name is required', { exact: true })).toBeVisible();
  await trigger.click();
  const search = page.getByRole('textbox', { name: 'Search Board', exact: true });
  await expect(search).toBeFocused();
  const geometry = await stableWidth(page, trigger, search, 'gse');
  await search.fill('');
  await page.screenshot({ path: screenshotPath });
  await page.getByRole('option', { name: 'CBSE', exact: true }).click();
  await expect(page.getByTestId('board-value')).toHaveText('Board value: 0');
  await trigger.click();
  await search.fill('gse');
  await expect(page.getByRole('option', { name: 'CBSE', exact: true })).toBeVisible();
  await page.getByRole('option', { name: 'GSEB', exact: true }).click();
  await expect(page.getByTestId('board-value')).toHaveText('Board value: 1');
  await trigger.click();
  await search.fill('cbs');
  await search.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('board-value')).toHaveText('Board value: 0');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await trigger.click();
  await search.fill('temporary query');
  await search.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(search).toHaveValue('');
  await search.press('Escape');
  await noHorizontalOverflow(page);
  return geometry;
}

export async function checkBoundaryCases(page) {
  const trigger = page.getByRole('combobox', {
    name: 'Long options',
    exact: true,
    includeHidden: true,
  });
  await trigger.click();
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-label', 'Long options results');
  const search = page.getByRole('textbox', { name: 'Search Long options', exact: true });
  const geometry = await stableWidth(page, trigger, search, 'gamma');
  await search.fill('gamma');
  await page.getByRole('option', { name: 'Gamma synthetic option', exact: true }).click();
  await expect(page.getByTestId('long-value')).toHaveText('Long value: gamma');
  const multiple = page.getByRole('combobox', {
    name: 'Multiple options',
    exact: true,
    includeHidden: true,
  });
  await multiple.press('ArrowDown');
  const multiSearch = page.getByRole('textbox', { name: 'Search Multiple options', exact: true });
  await panelGeometry(page, multiple);
  await multiSearch.fill('beta');
  await expect(page.getByRole('option', { name: /^Alpha synthetic/ })).toBeVisible();
  await page.getByRole('option', { name: /^Beta synthetic/ }).click();
  await expect(page.getByTestId('multiple-value')).toHaveText('Multiple value: alpha,beta');
  await multiSearch.fill('zzzz-no-synthetic-match');
  await expect(page.getByRole('option')).toHaveCount(2);
  await page.keyboard.press('Escape');
  const source = page.getByRole('combobox', {
    name: 'Empty source',
    exact: true,
    includeHidden: true,
  });
  await source.click();
  await expect(
    page.getByRole('option', { name: 'No data available', exact: true })
  ).toHaveAttribute('aria-disabled', 'true');
  const sourceSearch = page.getByRole('textbox', { name: 'Search Empty source', exact: true });
  await stableWidth(page, source, sourceSearch, 'missing');
  await sourceSearch.fill('');
  await expect(page.getByRole('option', { name: 'No data available', exact: true })).toBeVisible();
  await sourceSearch.press('Escape');
  await noHorizontalOverflow(page);
  return geometry;
}
