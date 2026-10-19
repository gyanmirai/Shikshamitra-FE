/* eslint-disable no-await-in-loop, no-restricted-syntax -- Browser interactions must run sequentially. */
import type { Page, Locator } from '@playwright/test';

import { test, expect } from '@playwright/test';

// Actual collection UI and RTK clients, with only the base API replaced by the
// isolated fixture. Every amount, identifier, bank and payment reference is synthetic.
const collectAction = (page: Page) =>
  page.getByRole('button', { name: 'Collect Payment', exact: true });
const ledger = (page: Page) => page.getByRole('region', { name: 'Fee ledger', exact: true });
const amount = (page: Page) =>
  page.getByRole('textbox', { name: 'Amount to collect', exact: false });
const summary = (page: Page) =>
  page
    .getByRole('heading', { name: 'Payment summary', exact: true })
    .locator('xpath=ancestor::section[1]');

async function openCollection(page: Page, scenario?: 'Mixed statuses' | 'Selection regression') {
  await page.clock.setFixedTime(new Date('2026-10-18T10:00:00+05:30'));
  await page.goto('/');
  if (scenario) await page.getByRole('button', { name: scenario, exact: true }).click();
  await page
    .getByRole('button', { name: 'Collect fee for Diya Sweta Badgujar (10092)', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Payment summary', exact: true })).toBeVisible();
  await expect(ledger(page)).toContainText('Showing');
}

async function filters(page: Page) {
  const toggle = page.getByRole('button', { name: /^Filters(?: \(\d+\))?$/ });
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

async function choose(page: Page, label: string | RegExp, option: string) {
  await page.getByRole('combobox', { name: label, exact: typeof label === 'string' }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

async function expandGroups(page: Page) {
  const collapsed = ledger(page).getByRole('button', { expanded: false });
  while (await collapsed.count()) await collapsed.first().click();
}

async function expectTotal(page: Page, expected: number) {
  await expect(amount(page)).toHaveValue(expected ? `₹ ${expected.toLocaleString('en-IN')}` : '');
  await expect(
    summary(page).getByText(`₹ ${expected.toLocaleString('en-IN')}`, { exact: true }).last()
  ).toBeVisible();
}

async function selectTransport(page: Page) {
  await ledger(page)
    .getByRole('checkbox', {
      name: 'Select Class 3 Student Transport Fee, August 2026',
      exact: true,
    })
    .check();
  await expectTotal(page, 2400);
}

async function requests(page: Page): Promise<Array<{ url: string; method: string; body: any }>> {
  if (await page.getByRole('button', { name: 'Done', exact: true }).isVisible())
    await page.getByRole('button', { name: 'Done', exact: true }).click();
  const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
  if (await cancel.isVisible()) await cancel.click();
  await page.getByRole('button', { name: 'Request evidence', exact: true }).click();
  return JSON.parse(await page.locator('pre').innerText());
}

test('all twelve month options, both fee heads, combined empty state, and Clear filters', async ({
  page,
}) => {
  await openCollection(page);
  await filters(page);
  const months: Array<[string, number]> = [
    ['June-2026', 2],
    ['July-2026', 2],
    ['August-2026', 4],
    ['September-2026', 1],
    ['October-2026', 1],
    ['November-2026', 2],
    ['December-2026', 1],
    ['January-2027', 1],
    ['February-2027', 2],
    ['March-2027', 1],
    ['April-2027', 1],
    ['May-2027', 2],
  ];
  for (const [month, count] of months) {
    await choose(page, 'Month', month);
    await expect(ledger(page)).toContainText(`Showing ${count} ${count === 1 ? 'fee' : 'fees'} in`);
  }
  await choose(page, 'Month', 'All');
  await choose(page, 'Fee Head', 'Class 3 Student Transport Fee');
  await expect(ledger(page)).toContainText('Showing 5 fees in 2 groups');
  await choose(page, 'Fee Head', 'Class 3 Tuition Fee');
  await expect(ledger(page)).toContainText('Showing 15 fees in 2 groups');
  await choose(page, 'Month', 'June-2026');
  await choose(page, 'Fee Head', 'Class 3 Student Transport Fee');
  await expect(ledger(page)).toContainText('No entries found for selected filters');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(ledger(page)).toContainText('Showing 20 fees in 3 groups');
});

test('all six status filters use real fee and charge statuses', async ({ page }) => {
  await openCollection(page, 'Mixed statuses');
  await filters(page);
  for (const [status, count] of [
    ['Pending', 13],
    ['Paid', 2],
    ['Overdue', 4],
    ['Reversed', 1],
    ['Partial Pending', 2],
    ['In Reconciliation', 1],
  ] as const) {
    await choose(page, 'Status', status);
    await expect(ledger(page)).toContainText(`Showing ${count} ${count === 1 ? 'fee' : 'fees'} in`);
    await expandGroups(page);
    if (status === 'Paid' || status === 'In Reconciliation') {
      for (const checkbox of await ledger(page).locator('tbody input[type="checkbox"]').all())
        await expect(checkbox).toBeDisabled();
    }
  }
  await choose(page, 'Status', 'All');
  await expect(ledger(page)).toContainText('Showing 23 fees');
});

test('grouping and hidden display filters retain selection and an edited partial amount', async ({
  page,
}) => {
  await openCollection(page);
  await selectTransport(page);
  await amount(page).fill('500');
  await filters(page);
  await choose(page, 'Month', 'June-2026');
  await expect(page.getByText('1 selected item is outside the current filters.')).toBeVisible();
  await expect(amount(page)).toHaveValue('₹ 500');
  await expect(
    summary(page).getByRole('table', { name: 'Selected collection items' }).getByRole('cell', {
      name: '₹ 2,400',
      exact: true,
    })
  ).toBeVisible();
  await choose(page, 'Month', 'All');
  await choose(page, 'Group by', 'By Month');
  await expect(ledger(page)).toContainText('Showing 20 fees in 13 groups');
  await choose(page, 'Group by', 'By Fee Head');
  await expect(
    ledger(page).getByRole('checkbox', {
      name: 'Select Class 3 Student Transport Fee, August 2026',
      exact: true,
    })
  ).toBeChecked();
  await expect(amount(page)).toHaveValue('₹ 500');
});

test('all selection presets, overlapping ownership, manual selection, and Clear All', async ({
  page,
}) => {
  await openCollection(page);
  await filters(page);
  for (const [label, expected] of [
    ['All Pending', 33609],
    ['All Charges', 400],
    ['First 6 Month', 16800],
    ['Last 6 Month', 16809],
  ] as const) {
    await page.getByRole('checkbox', { name: label, exact: true }).check();
    await expectTotal(page, expected);
    await page.getByRole('checkbox', { name: label, exact: true }).uncheck();
    await expectTotal(page, 0);
  }
  await page.getByRole('checkbox', { name: 'All Pending', exact: true }).check();
  await page.getByRole('checkbox', { name: 'First 6 Month', exact: true }).check();
  await expectTotal(page, 33609);
  await page.getByRole('checkbox', { name: 'All Pending', exact: true }).uncheck();
  await expectTotal(page, 16800);
  await page.getByRole('checkbox', { name: 'All Charges', exact: true }).check();
  await expectTotal(page, 17200);
  await page.getByRole('button', { name: 'Clear All', exact: true }).click();
  await expectTotal(page, 0);
  for (const name of ['All Pending', 'All Charges', 'First 6 Month', 'Last 6 Month'])
    await expect(page.getByRole('checkbox', { name, exact: true })).not.toBeChecked();
  await expect(collectAction(page)).toBeDisabled();
  await expect(summary(page).getByText(/\d+ items? selected/)).toHaveCount(0);
});

test('refresh reconciles paid and reduced balances while retaining preset ownership', async ({
  page,
}) => {
  await openCollection(page, 'Selection regression');
  await filters(page);
  await page.getByRole('checkbox', { name: 'All Pending', exact: true }).check();
  await expectTotal(page, 21209);
  await page.getByRole('checkbox', { name: 'All Charges', exact: true }).check();
  await expectTotal(page, 22720);
  await page.getByRole('button', { name: 'Refresh selection balances', exact: true }).click();
  await expectTotal(page, 18109);
  await expect(page.getByRole('checkbox', { name: 'All Pending', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'All Charges', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'All Pending', exact: true }).uncheck();
  await expectTotal(page, 400);
  await page.getByRole('checkbox', { name: 'All Charges', exact: true }).uncheck();
  await expectTotal(page, 0);
});

test('cash validation blocks empty, zero, excess collection and insufficient tender; preview Cancel retains the draft', async ({
  page,
}) => {
  await openCollection(page);
  await selectTransport(page);
  for (const invalid of ['', '0', '2401']) {
    await amount(page).fill(invalid);
    await collectAction(page).click();
    await expect(page.getByRole('dialog', { name: 'Payment Details', exact: true })).toHaveCount(0);
    await expect(summary(page).locator('.MuiFormHelperText-root.Mui-error')).not.toHaveCount(0);
  }
  await amount(page).fill('500');
  await page.getByRole('textbox', { name: 'Cash Received', exact: true }).fill('499');
  await expect(collectAction(page)).toBeDisabled();
  await page.getByRole('textbox', { name: 'Cash Received', exact: true }).fill('1000');
  await expect(page.getByText('Change to return').locator('..')).toContainText('₹ 500');
  await collectAction(page).click();
  const review = page.getByRole('dialog', { name: 'Payment Details', exact: true });
  await expect(review).toBeVisible();
  await review.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(amount(page)).toHaveValue('₹ 500');
  await expect(page.getByRole('textbox', { name: 'Cash Received', exact: true })).toHaveValue(
    '₹ 1,000'
  );
});

async function today(page: Page) {
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await page.getByRole('gridcell', { name: '18', exact: true }).click();
}

async function moveDownWithKeyboard(handle: Locator) {
  const before = await bounds(handle);
  await handle.press('Space');
  await handle.press('ArrowDown');
  await expect.poll(async () => (await bounds(handle)).y).toBeGreaterThan(before.y + 5);
  await handle.press('Space');
}

async function confirmCash(page: Page) {
  await collectAction(page).click();
  await page
    .getByRole('dialog', { name: 'Payment Details', exact: true })
    .getByRole('button', { name: 'Confirm & Collect Fee', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Confirm Cash Payment', exact: true })
    .getByRole('button', { name: 'Final Submit & Generate Receipt', exact: true })
    .click();
  await expect(page.getByRole('dialog', { name: 'Payment Receipts', exact: true })).toBeVisible();
}

test('selected fees are visible, pointer and keyboard dragging change the partial-payment allocation order', async ({
  page,
}) => {
  await openCollection(page);
  await selectTransport(page);
  await ledger(page)
    .getByRole('checkbox', {
      name: 'Select Class 3 Student Transport Fee, November 2026',
      exact: true,
    })
    .check();
  const selected = page.getByRole('table', { name: 'Selected collection items', exact: true });
  const rows = selected
    .getByRole('rowgroup', { name: 'Selected fees', exact: true })
    .getByRole('row');
  const august = selected.getByRole('button', {
    name: 'Reorder Class 3 Student Transport Fee, Aug 2026',
    exact: true,
  });
  const november = selected.getByRole('button', {
    name: 'Reorder Class 3 Student Transport Fee, Nov 2026',
    exact: true,
  });
  const from = await bounds(august);
  const to = await bounds(november);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await expect.poll(async () => (await bounds(august)).y).toBeGreaterThan(from.y + 5);
  await page.mouse.up();
  await expect(rows.first()).toHaveAttribute(
    'aria-label',
    'Class 3 Student Transport Fee, Nov 2026'
  );
  await moveDownWithKeyboard(november);
  await expect(rows.first()).toHaveAttribute(
    'aria-label',
    'Class 3 Student Transport Fee, Aug 2026'
  );
  await moveDownWithKeyboard(august);
  await expect(rows.first()).toHaveAttribute(
    'aria-label',
    'Class 3 Student Transport Fee, Nov 2026'
  );
  await amount(page).fill('500');
  await confirmCash(page);
  const sent = (await requests(page)).find((item) => item.url === '/fee-collections');
  expect(sent?.body.dueFeePayments).toEqual([
    { dueFeeId: 'transport-2', feeHeadId: 'transport', amount: 500 },
  ]);
});

test('charge ordering and the trailing remove icon update the ledger and outgoing charge allocation', async ({
  page,
}) => {
  await openCollection(page);
  await filters(page);
  await page.getByRole('checkbox', { name: 'All Charges', exact: true }).check();
  const selected = page.getByRole('table', { name: 'Selected collection items', exact: true });
  const rows = selected
    .getByRole('rowgroup', { name: 'Selected charges', exact: true })
    .getByRole('row');
  const second = await rows.nth(1).getAttribute('aria-label');
  await moveDownWithKeyboard(rows.first().getByRole('button', { name: /^Reorder / }));
  await expect(rows.first()).toHaveAttribute('aria-label', second!);
  await rows
    .last()
    .getByRole('button', { name: /^Remove / })
    .click();
  await expect(rows).toHaveCount(3);
  await expectTotal(page, 300);
  await amount(page).fill('50');
  await confirmCash(page);
  const sent = (await requests(page)).find((item) => item.url === '/fee-collections');
  expect(sent?.body.lateFeePayments).toEqual([{ dueFeeId: 'tuition-1', amount: 50 }]);
  expect(sent?.body.dueFeePayments).toEqual([]);
});

test('one payment method dropdown switches fields and preserves the partial amount and cash tender', async ({
  page,
}) => {
  await openCollection(page);
  await selectTransport(page);
  await amount(page).fill('500');
  await page.getByRole('textbox', { name: 'Cash Received', exact: true }).fill('1000');
  await choose(page, /^Payment Method/, 'UPI');
  await expect(page.getByRole('textbox', { name: /^UPI ID/ })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Cash Received', exact: true })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: /^Payment Method/ })).toHaveText('UPI');
  await choose(page, /^Payment Method/, 'Bank Transfer (NEFT/RTGS/IMPS)');
  await expect(page.getByRole('combobox', { name: /^Payment Method/ })).toHaveText('Bank Transfer');
  await expect(page.getByRole('textbox', { name: /^Account Holder Name/ })).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^UPI ID/ })).toHaveCount(0);
  await choose(page, /^Payment Method/, 'Cash');
  await expect(page.getByRole('textbox', { name: 'Cash Received', exact: true })).toHaveValue(
    '₹ 1,000'
  );
  await expect(amount(page)).toHaveValue('₹ 500');
  await expect(page.getByText('Change to return').locator('..')).toContainText('₹ 500');
});

test('keyboard group selection and Clear All clear rows, amount and tender without clearing display filters', async ({
  page,
}) => {
  await openCollection(page);
  await filters(page);
  await choose(page, 'Fee Head', 'Class 3 Student Transport Fee');
  const group = ledger(page).getByRole('checkbox', {
    name: 'Select all Class 3 Student Transport Fee',
    exact: true,
  });
  await group.press('Space');
  await expectTotal(page, 9600);
  await page.getByRole('textbox', { name: 'Cash Received', exact: true }).fill('10000');
  await page.getByRole('button', { name: 'Clear All', exact: true }).press('Enter');
  await expectTotal(page, 0);
  await expect(group).not.toBeChecked();
  await expect(page.getByRole('textbox', { name: 'Cash Received', exact: true })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Fee Head', exact: true })).toHaveText(
    'Class 3 Student Transport Fee'
  );
  await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toBeDisabled();
  await expect(collectAction(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Cancel', exact: true }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Payment summary', exact: true })).toHaveCount(0);
});

async function fillMethod(page: Page, method: string) {
  if (method === 'Cash') return;
  await choose(page, /^Payment Method/, method);
  await collectAction(page).click();
  await expect(page.getByRole('dialog', { name: 'Payment Details', exact: true })).toHaveCount(0);
  await expect(summary(page).locator('.MuiFormHelperText-root.Mui-error')).not.toHaveCount(0);
  await choose(page, /Receiving School Bank Account/, 'SBI');
  const text = async (label: RegExp, value: string) =>
    page.getByRole('textbox', { name: label }).fill(value);
  if (method === 'Cheque') {
    await text(/^Cheque Number/, '123456');
    await text(/^Bank Name/, 'Synthetic Bank');
    await text(/^Cheque Holder Name/, 'Test Cashier');
    await today(page);
  } else if (method === 'Demand Draft (DD)') {
    await choose(page, /^Currency/, 'INR');
    await text(/^DD Number/, '1234567');
    await text(/^Bank Name/, 'Synthetic Bank');
    await text(/^Branch Name/, 'Main Branch');
    await text(/^Payee Name/, 'Test Cashier');
    await text(/^Remarks/, 'Isolated browser validation');
    await today(page);
  } else if (method.startsWith('Bank Transfer')) {
    await text(/^Transaction ID/, 'TEST12345678');
    await text(/^Account Holder Name/, 'Test Cashier');
  } else if (method.endsWith('Card')) {
    await text(/^Card Holder Name/, 'Test Cashier');
    await text(/^Last 4 Digits/, '1234');
    await text(/^Transaction ID/, 'TEST123456');
  } else {
    await text(/^UPI ID/, 'cashier@testbank');
    await text(/^Transaction ID/, 'TEST123456');
  }
}

for (const [method, methodId] of [
  ['Cash', 0],
  ['Cheque', 1],
  ['Demand Draft (DD)', 2],
  ['Bank Transfer (NEFT/RTGS/IMPS)', 3],
  ['Credit Card', 4],
  ['Debit Card', 5],
  ['UPI', 6],
] as const) {
  test(`${method}: required details, both review stages, and canonical payment request`, async ({
    page,
  }) => {
    await openCollection(page);
    await selectTransport(page);
    await amount(page).fill('500');
    if (method === 'Cash')
      await page.getByRole('textbox', { name: 'Cash Received', exact: true }).fill('1000');
    await fillMethod(page, method);
    await collectAction(page).click();
    const preview = page.getByRole('dialog', { name: 'Payment Details', exact: true });
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('Class 3 · Div A');
    await expect(preview).toContainText('2026-2027');
    await preview.getByRole('button', { name: 'Confirm & Collect Fee', exact: true }).click();
    const final = page.getByRole('dialog', {
      name: method === 'Cash' ? 'Confirm Cash Payment' : 'Payment Verification',
      exact: true,
    });
    await expect(final).toBeVisible();
    await final
      .getByRole('button', {
        name:
          method === 'Cash'
            ? 'Final Submit & Generate Receipt'
            : methodId <= 2
              ? 'Move to Reconciliation'
              : 'Accept & Confirm',
        exact: true,
      })
      .click();
    if (methodId === 0 || methodId >= 3) {
      await expect(
        page.getByRole('dialog', { name: 'Payment Receipts', exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole('dialog', { name: 'Payment Receipts', exact: true })
      ).toContainText('500');
    } else {
      await expect(page.getByRole('heading', { name: 'Payment summary', exact: true })).toHaveCount(
        0
      );
      await expect(page.getByRole('dialog', { name: 'Payment Receipts', exact: true })).toHaveCount(
        0
      );
    }
    const sent = (await requests(page)).filter(
      (item) => item.url === '/fee-collections' && item.method === 'POST'
    );
    expect(sent).toHaveLength(1);
    expect(sent[0].body).toMatchObject({
      studentId: 'diya-10092',
      academicYearId: 'year-2026',
      dueFeePayments: [{ dueFeeId: 'transport-1', feeHeadId: 'transport', amount: 500 }],
      lateFeePayments: [],
      chargePayments: [],
      payments: [{ paymentMethod: methodId, amount: 500 }],
    });
    expect(sent[0].body.idempotencyKey).toBeTruthy();
    if (methodId >= 3) expect(sent[0].body.paymentConfirmed).toBe(true);
    if (methodId !== 0) expect(sent[0].body.payments[0].bankAccountId).toBe('sbi-account');
  });
}

test('UPI can be sent for later reconciliation without confirming payment', async ({ page }) => {
  await openCollection(page);
  await selectTransport(page);
  await fillMethod(page, 'UPI');
  await collectAction(page).click();
  await page
    .getByRole('dialog', { name: 'Payment Details', exact: true })
    .getByRole('button', { name: 'Confirm & Collect Fee', exact: true })
    .click();
  await page
    .getByRole('dialog', { name: 'Payment Verification', exact: true })
    .getByRole('button', { name: 'Move to Reconciliation', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Payment summary', exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'Payment Receipts', exact: true })).toHaveCount(0);
  const sent = (await requests(page)).filter(
    (item) => item.url === '/fee-collections' && item.method === 'POST'
  );
  expect(sent).toHaveLength(1);
  expect(sent[0].body.paymentConfirmed).toBe(false);
});

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

for (const size of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  for (const mode of ['Light', 'Dark'] as const) {
    test(`${size.width}px ${mode}: sticky summary/footer, independent scrollbar, no document overflow`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await openCollection(page);
      if (mode === 'Dark') {
        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
        await page.getByRole('button', { name: 'Dark', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', 'dark');
        await page.getByRole('button', { name: /^Collect fee for Diya/ }).click();
      }
      await filters(page);
      await page.getByRole('checkbox', { name: 'All Pending', exact: true }).check();
      await page.getByRole('button', { name: /^Filters/ }).click();
      await summary(page).scrollIntoViewIfNeeded();
      const body = page.getByRole('region', { name: 'Payment details' });
      const scroll = body.locator('.simplebar-content-wrapper');
      await expect
        .poll(() => scroll.evaluate((el) => el.scrollHeight - el.clientHeight))
        .toBeGreaterThan(50);
      await body.hover();
      const before = {
        heading: await bounds(page.getByRole('heading', { name: 'Payment summary', exact: true })),
        collect: await bounds(collectAction(page)),
        cancel: await bounds(page.getByRole('button', { name: 'Cancel', exact: true })),
      };
      const toolbar = await bounds(
        page.getByRole('button', { name: 'Refresh selection balances', exact: true })
      );
      expect(before.heading.y).toBeGreaterThanOrEqual(toolbar.y + toolbar.height);
      expect(before.collect.y + before.collect.height).toBeLessThanOrEqual(size.height);
      expect(before.cancel.y + before.cancel.height).toBeLessThanOrEqual(size.height);
      await page.mouse.wheel(0, 10000);
      await expect.poll(() => scroll.evaluate((el) => el.scrollTop)).toBeGreaterThan(50);
      expect(
        Math.abs(
          (await bounds(page.getByRole('heading', { name: 'Payment summary', exact: true }))).y -
            before.heading.y
        )
      ).toBeLessThan(1);
      expect(Math.abs((await bounds(collectAction(page))).y - before.collect.y)).toBeLessThan(1);
      expect(
        Math.abs(
          (await bounds(page.getByRole('button', { name: 'Cancel', exact: true }))).y -
            before.cancel.y
        )
      ).toBeLessThan(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await expect(page.getByRole('button', { name: 'Clear All', exact: true })).toBeVisible();
      await expect(collectAction(page)).toHaveClass(/MuiButton-colorInherit/);
      await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toHaveClass(
        /MuiButton-outlined/
      );
    });
  }
}
