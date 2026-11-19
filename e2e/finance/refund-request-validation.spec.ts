/* eslint-disable no-await-in-loop, no-restricted-syntax -- Browser interactions must run in sequence. */
import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`only collected late fees remain refundable after a waiver at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/?waivedLateFee=1');
    await page.getByRole('button', { name: 'Load test student' }).click();
    await page.getByRole('radio', { name: 'Full refund', exact: true }).check();
    const lateFees = page.getByRole('checkbox', {
      name: 'Select refundable installments for Paid late fees',
      exact: true,
    });
    await expect(lateFees).toBeVisible();
    await lateFees.check();
    const lateTable = page.getByRole('table', { name: 'Paid late fees table' });
    await expect(lateTable).toBeVisible();
    await expect(lateTable.getByRole('textbox', { name: /^Refund amount for/ })).toHaveValue(
      '₹ 1,500'
    );
    await expect(
      page.getByRole('checkbox', { name: 'Select refundable installments for Paid charges' })
    ).not.toBeChecked();
    await expect(
      page.getByRole('checkbox', { name: 'Select refundable installments for Tuition' })
    ).not.toBeChecked();
    await page.screenshot({ path: testInfo.outputPath('paid-after-waiver.png'), fullPage: true });
    await page
      .getByRole('textbox', { name: /Refund reason/ })
      .fill('Refund the settled late-fee payment after the remaining late fees were waived');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Submit and Approve Refund?' });
    await expect(confirmation).toContainText('₹ 1,500');
    await expect(confirmation).not.toContainText('9,500');
    await confirmation.getByRole('button', { name: 'Submit and pay cash', exact: true }).click();
    await expect(page.getByText('Synthetic cash refund completed.')).toBeVisible();
    const payload = JSON.parse(await page.getByLabel('Submitted refund payload').innerText());
    expect(payload.lines).toEqual([
      {
        lateFeeDueFeeId: 'late-fee-due',
        sourceAllocationId: 'late-fee-allocation',
        sourceReceiptId: 'receipt-paid-sources',
        amount: 1500,
      },
    ]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test(`paid sources keep payment accounts separate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/?paidSources=1&mixedPayers=1');
    await page.getByRole('button', { name: 'Load test student' }).click();
    await page.getByRole('radio', { name: 'Full refund', exact: true }).check();
    const tuition = page.getByRole('checkbox', {
      name: 'Select refundable installments for Tuition',
      exact: true,
    });
    const charges = page.getByRole('checkbox', {
      name: 'Select refundable installments for Paid charges',
      exact: true,
    });
    const lateFees = page.getByRole('checkbox', {
      name: 'Select refundable installments for Paid late fees',
      exact: true,
    });
    await tuition.check();
    await expect(charges).toBeDisabled();
    await expect(lateFees).toBeDisabled();
    await tuition.uncheck();
    await charges.check();
    await expect(tuition).toBeDisabled();
    await expect(lateFees).toBeEnabled();
    await lateFees.check();
    await page
      .getByRole('textbox', { name: /Refund reason/ })
      .fill('Refund the account-linked paid charges and late fees');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Submit and Approve Refund?' });
    await expect(confirmation).toContainText('₹ 750');
    await confirmation.getByRole('button', { name: 'Submit and pay cash', exact: true }).click();
    await expect(page.getByText('Synthetic cash refund completed.')).toBeVisible();
    const payload = JSON.parse(await page.getByLabel('Submitted refund payload').innerText());
    expect(payload.lines).toHaveLength(2);
    expect(payload.lines.map((line: any) => line.sourceReceiptId).sort()).toEqual([
      'receipt-account-charge',
      'receipt-account-late',
    ]);
  });

  test(`paid charges and late fees can be selected and submitted at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/?paidSources=1');
    await page.getByRole('button', { name: 'Load test student' }).click();
    for (const [name, amount] of [
      ['Tuition', '1000'],
      ['Paid charges', '500'],
      ['Paid late fees', '250'],
    ]) {
      await page
        .getByRole('checkbox', { name: `Select refundable installments for ${name}` })
        .check();
      const amountField = page.getByRole('textbox', {
        name: `Amount for selected installments in ${name}`,
      });
      await amountField.fill(amount);
      const group = amountField.locator('xpath=ancestor::section[1]');
      await group.getByRole('button', { name: 'Apply', exact: true }).click();
      await expect(group.getByRole('textbox', { name: /^Refund amount for/ })).toHaveValue(
        `₹ ${Number(amount).toLocaleString('en-IN')}`
      );
    }
    await page
      .getByRole('textbox', { name: /Refund reason/ })
      .fill('Refund paid fees, charges and late fees');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Submit and Approve Refund?' });
    await expect(confirmation).toContainText('₹ 1,750');
    await confirmation.getByRole('button', { name: 'Submit and pay cash', exact: true }).click();
    await expect(page.getByText('Synthetic cash refund completed.')).toBeVisible();
    const payload = JSON.parse(await page.getByLabel('Submitted refund payload').innerText());
    expect(payload.lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dueFeeId: 'tuition-due',
          sourceAllocationId: 'tuition-allocation',
          amount: 1000,
        }),
        expect.objectContaining({
          chargeId: 'paid-charge',
          sourceAllocationId: 'charge-allocation',
          amount: 500,
        }),
        expect.objectContaining({
          lateFeeDueFeeId: 'late-fee-due',
          sourceAllocationId: 'late-fee-allocation',
          amount: 250,
        }),
      ])
    );
    expect(payload.lines).toHaveLength(3);
    expect(
      payload.lines.every((line: any) => line.sourceReceiptId === 'receipt-paid-sources')
    ).toBe(true);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test(`refund amounts preserve repeated Apply and gate confirmation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Load test student' }).click();
    await page.getByRole('checkbox', { name: 'Select refundable installments for FH1' }).check();
    const amount1 = page.getByRole('textbox', { name: 'Amount for selected installments in FH1' });
    await amount1.fill('500');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('input[name="refund-FH1-allocation-6"]')).toHaveValue('₹ 500');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.locator('input[name="refund-FH1-allocation-6"]')).toHaveValue('₹ 500');
    await page.getByRole('checkbox', { name: 'Select refundable installments for FH2' }).check();
    await expect(page.getByText('Required', { exact: true })).toHaveCount(3);
    await expect(page.getByRole('status')).toContainText(
      '3 selected installments need a refund amount'
    );
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const amount2 = page.getByRole('textbox', { name: 'Amount for selected installments in FH2' });
    await amount2.fill('200');
    await page.getByRole('button', { name: 'Apply', exact: true }).nth(1).click();
    await expect(page.getByText('Required', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    if (width === 390) {
      for (const input of [amount1, amount2]) {
        const bounds = await input.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
    }
    const reason = page.getByRole('textbox', { name: /Refund reason/ });
    await expect(reason).toHaveAttribute('required', '');
    await reason.focus();
    await reason.press('Tab');
    await expect(page.getByText('Refund reason is required')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await reason.fill('   ');
    await reason.press('Tab');
    await expect(page.getByText('Refund reason is required')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await reason.fill('Excess fee payment');
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Submit and Approve Refund?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('₹ 2,100');
    await dialog.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.locator('input[name="refund-FH1-allocation-6"]')).toHaveValue('₹ 500');
  });

  test(`refund detail metadata and outflow chips remain aligned at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await page.getByRole('button', { name: 'View synthetic refund request' }).click();
    const drawer = page.getByRole('dialog', { name: 'View Refund Request' });
    await expect(drawer).toBeVisible();
    const methods = drawer.getByText('Policy payment methods').locator('..');
    await expect(methods).toHaveCSS('grid-column', '1 / -1');
    await expect(methods).toContainText(
      'Cash, Cheque, Demand Draft (DD), Bank Transfer (NEFT/RTGS/IMPS), UPI'
    );
    const refundSection = drawer
      .locator('section')
      .filter({ has: page.getByText('Refund Information', { exact: true }) });
    await expect(refundSection.locator('.MuiDivider-vertical')).toHaveCount(0);
    const amountChip = drawer.getByText('Refunded : ₹ 10,829', { exact: true }).locator('..');
    await expect(amountChip).toHaveClass(/MuiChip-colorInfo/);
    await expect(amountChip).not.toHaveClass(/MuiChip-colorSuccess|MuiChip-colorPrimary/);
    await expect(drawer.getByRole('region', { name: 'FH1 installments' })).toBeVisible();
    const bounds = await methods.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await drawer.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(drawer).toHaveCount(0);
  });
}
