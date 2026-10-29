import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
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
