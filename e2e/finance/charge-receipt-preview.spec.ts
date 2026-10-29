import type { Page } from '@playwright/test';

import fs from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const receiptFailure =
  'Payment was collected, but the receipt could not be generated. Please retry or contact support.';

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
  await page.getByRole('button', { name: /^Filters(?: \(\d+\))?$/ }).click();
  await page.getByRole('checkbox', { name: 'All Charges', exact: true }).check();
  await expect(page.getByRole('textbox', { name: 'Amount to collect', exact: false })).toHaveValue(
    '₹ 1,000'
  );
  await page.getByRole('button', { name: 'Collect Payment', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Review Payment', exact: true })
    .getByRole('button', { name: /^Collect / })
    .click();
  await page
    .getByRole('dialog', { name: 'Review Cash Payment', exact: true })
    .getByRole('button', { name: 'Collect & issue receipt', exact: true })
    .click();
  return page.getByRole('dialog', { name: 'Payment Receipts', exact: true });
}

async function evidence(page: Page) {
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Request evidence', exact: true }).click();
  return JSON.parse(await page.locator('pre').innerText()) as Array<{
    url: string;
    method: string;
    body: any;
  }>;
}

test('charge-only collection previews and downloads the canonical PDF and refreshes balances', async ({
  page,
}) => {
  const receipts = await collectCharge(page);
  await expect(
    receipts.getByRole('img', { name: 'Charge Receipt, page 1', exact: true })
  ).toBeVisible({ timeout: 30000 });
  await expect(receipts).toContainText('CHG-REC-2026-000004');
  await expect(receipts.getByText(receiptFailure, { exact: true })).toHaveCount(0);
  await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Synthetic receipt rendering failure.', { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    receipts.getByRole('button', { name: 'Download', exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('Receipt-CHG-REC-2026-000004.pdf');
  const file = await download.path();
  expect(file).not.toBeNull();
  expect((await fs.readFile(file!)).subarray(0, 8).toString()).toBe('%PDF-1.4');
  const requests = await evidence(page);
  expect(requests.filter((request) => request.method === 'POST')).toHaveLength(1);
  expect(
    requests.filter((request) => request.url.endsWith('/pdf')).map((request) => request.url)
  ).toEqual(['/v1/fee-receipts/fixture-receipt-4-charges/pdf']);
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
  await expect(
    page.getByRole('checkbox', { name: 'Select Receipt Regression Charge', exact: false })
  ).toBeDisabled();
  await expect(page.getByRole('heading', { name: '₹ 0', exact: true }).first()).toBeVisible();
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
});

test('receipt failure explains payment success and retries only the PDF', async ({ page }) => {
  const receipts = await collectCharge(page, true);
  await expect(receipts.getByText(receiptFailure, { exact: true })).toBeVisible();
  await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Synthetic receipt rendering failure.', { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByText(/exceeds the payable amount/)).toHaveCount(0);
  await receipts.getByRole('button', { name: 'Retry receipt', exact: true }).click();
  await expect(
    receipts.getByRole('img', { name: 'Charge Receipt, page 1', exact: true })
  ).toBeVisible({ timeout: 30000 });
  await expect(receipts.getByText(receiptFailure, { exact: true })).toHaveCount(0);
  const requests = await evidence(page);
  expect(requests.filter((request) => request.method === 'POST')).toHaveLength(1);
  expect(
    requests.filter((request) => request.url.endsWith('/pdf')).map((request) => request.url)
  ).toEqual([
    '/v1/fee-receipts/fixture-receipt-4-charges/pdf',
    '/v1/fee-receipts/fixture-receipt-4-charges/pdf',
  ]);
});
