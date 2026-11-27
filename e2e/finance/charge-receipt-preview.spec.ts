import type { Page } from '@playwright/test';

import { test, expect } from '@playwright/test';

async function collectCharge(page: Page, retry = false) {
  await page.clock.setFixedTime(new Date('2026-10-28T10:00:00+05:30'));
  await page.goto('/');
  await page
    .getByRole('button', {
      name: retry ? 'Charge receipt retry regression' : 'Charge receipt regression',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: 'Collect fee for Diya Sweta Badgujar (10092)', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Class 3 Tuition Fee', exact: true })).toHaveCSS(
    'text-decoration-line',
    'line-through'
  );
  const filters = page.getByRole('button', { name: /^Filters(?: \(\d+\))?$/ });
  await expect(filters).toBeVisible();
  const allCharges = page.getByRole('checkbox', { name: 'All Charges', exact: true });
  if (!(await allCharges.isVisible())) await filters.click();
  await allCharges.check();
  await expect(page.getByRole('textbox', { name: 'Amount to collect', exact: false })).toHaveValue(
    '₹ 1,000'
  );
  const summaryCharges = page.getByRole('button', { name: /^Charges \(1\)/ });
  await summaryCharges.click();
  await expect(summaryCharges).toHaveAttribute('aria-expanded', 'true');
  const amount = page.getByRole('textbox', { name: 'Amount to collect' });
  await amount.fill('999');
  await expect(summaryCharges).toHaveAttribute('aria-expanded', 'false');
  await amount.fill('1000');
  await page.getByRole('button', { name: 'Collect Payment', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Review Payment', exact: true })
    .getByRole('button', { name: /^Collect / })
    .click();
  await expect(page.getByText('Receipt generated.', { exact: true })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Review Payment', exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: /^Collect Fees/ })).toHaveCount(0);
}

async function evidence(page: Page) {
  await page.getByRole('button', { name: 'Request evidence', exact: true }).click();
  return JSON.parse(await page.locator('pre').innerText()) as Array<{
    url: string;
    method: string;
    body: any;
  }>;
}

test('charge-only collection announces its receipt, closes, and refreshes balances', async ({
  page,
}) => {
  await collectCharge(page);
  await expect(page.getByRole('dialog', { name: 'Payment Receipts', exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Review Cash Payment', exact: true })).toHaveCount(0);
  await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Synthetic receipt rendering failure.', { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
  const requests = await evidence(page);
  expect(requests.filter((request) => request.method === 'POST')).toHaveLength(1);
  expect(requests.filter((request) => request.url.endsWith('/pdf'))).toHaveLength(0);
  await expect(page.getByRole('row').filter({ hasText: 'Diya Sweta Badgujar' })).toContainText(
    'Paid'
  );
  await page
    .getByRole('button', { name: 'Collect fee for Diya Sweta Badgujar (10092)', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'Amount to collect', exact: false })).toHaveValue(
    ''
  );
  await expect(page.getByRole('button', { name: 'Collect Payment', exact: true })).toBeDisabled();
  const chargesGroup = page
    .getByRole('region', { name: 'Fee ledger', exact: true })
    .getByRole('button', { name: /^Additional Charges/ });
  if ((await chargesGroup.getAttribute('aria-expanded')) !== 'true') await chargesGroup.click();
  await expect(page.getByRole('checkbox', { name: /Select Receipt Regression Charge/ })).toBeDisabled();
  await expect(page.getByRole('heading', { name: '₹ 0', exact: true }).first()).toBeVisible();
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
  const chargeRow = page.getByRole('row', { name: 'Open Receipt Regression Charge, 2026-11-28' });
  await expect(chargeRow.getByRole('cell', { name: '28 Nov 2026' })).toBeVisible();
  await chargeRow.getByText('Receipt Regression Charge', { exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Receipt Regression Charge', exact: true })
      .getByText('28 November 2026', { exact: true })
  ).toBeVisible();
});

test('receipt PDF availability does not affect a successful collection', async ({ page }) => {
  await collectCharge(page, true);
  await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Synthetic receipt rendering failure.', { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
  const requests = await evidence(page);
  expect(requests.filter((request) => request.method === 'POST')).toHaveLength(1);
  expect(requests.filter((request) => request.url.endsWith('/pdf'))).toHaveLength(0);
});
