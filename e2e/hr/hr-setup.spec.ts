/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { test, expect } from '@playwright/test';

test.describe.serial('HR setup wizard with disposable SQLite and real backend APIs', () => {
  test.beforeEach(async ({ request }) => {
    expect((await request.post('/fixture/reset')).ok()).toBe(true);
  });
  test('dismissal survives HR navigation and resets on refresh', async ({ page }) => {
    await page.goto('/');
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await expect(wizard).toBeVisible();
    await wizard.getByRole('button', { name: 'Close for now' }).click();
    await page.getByRole('button', { name: 'Leave HR', exact: true }).click();
    await page.getByRole('button', { name: 'Return to HR', exact: true }).click();
    await expect(wizard).toHaveCount(0);
    await page.reload();
    await expect(wizard).toBeVisible();
  });

  test('self-service users do not receive the reminder or request setup', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/hr/setup-readiness')) requests.push(request.url());
    });
    await page.goto('/?scenario=self-service');
    await expect(page.getByRole('heading', { name: 'HR Workspace' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test('failed readiness reads remain dismissible and distinguish failures', async ({ page }) => {
    await page.route('**/api/hr/setup-readiness?*', (route) =>
      route.fulfill({ status: 503, json: { error: { message: 'Synthetic service outage' } } })
    );
    await page.goto('/');
    await expect(
      page.getByText('Unable to check HR setup. Retry or close this window and continue working.')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Close for now' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('keeps actions reachable at supported viewports in light and dark themes', async ({
    page,
  }) => {
    for (const theme of ['light', 'dark']) {
      for (const viewport of [
        { width: 390, height: 844 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
        await page.goto(`/?theme=${theme}`);
        const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
        await expect(wizard).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
        await expect(wizard.getByRole('button', { name: 'Close for now' })).toBeInViewport();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        ).toBe(true);
        await page.keyboard.press('Tab');
        await expect(wizard.locator(':focus')).toHaveCount(1);
        await page.screenshot({ path: `.artifacts/hr-setup/${theme}-${viewport.width}.png` });
      }
    }
  });

  test('protects an unsaved step and preserves saved setup when dismissed', async ({ page }) => {
    await page.goto('/');
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await wizard
      .getByTestId('hr-setup-check-shift')
      .getByRole('button', { name: 'Set up' })
      .click();
    await wizard.getByLabel('Shift Name *', { exact: true }).fill('Unsaved shift');
    await wizard.getByRole('button', { name: 'Close for now' }).click();
    const confirmation = page.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
    await confirmation.getByRole('button', { name: 'Keep Editing' }).click();
    await expect(wizard.getByLabel('Shift Name *', { exact: true })).toHaveValue('Unsaved shift');
    await wizard.getByRole('button', { name: 'Close for now' }).click();
    await confirmation.getByRole('button', { name: 'Discard Changes' }).click();
    await expect(wizard).toHaveCount(0);
    await page.reload();
    await expect(
      wizard.getByTestId('hr-setup-check-shift').getByText('missing', { exact: true })
    ).toBeVisible();
  });

  test('protects an unsaved setup step during browser Back navigation', async ({ page }) => {
    await page.goto('/?entry=before-hr');
    await expect(
      page.getByRole('dialog', { name: 'Complete HR Setup', exact: true })
    ).toBeVisible();
    // Next.js route transitions create same-document history entries.
    await page.evaluate(() => window.history.pushState({}, '', '/'));
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await wizard
      .getByTestId('hr-setup-check-shift')
      .getByRole('button', { name: 'Set up' })
      .click();
    await wizard.getByLabel('Shift Name *', { exact: true }).fill('Navigation draft');
    await page.evaluate(() => window.history.back());
    const confirmation = page.getByRole('dialog', { name: 'Discard Unsaved Changes?' });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: 'Keep Editing' }).click();
    await expect(wizard.getByLabel('Shift Name *', { exact: true })).toHaveValue(
      'Navigation draft'
    );
    await page.evaluate(() => window.history.back());
    await confirmation.getByRole('button', { name: 'Discard Changes' }).click();
    await expect(page).toHaveURL(/entry=before-hr/);
  });

  test('reuses the policy editor inside the popup without treating review as completion', async ({
    page,
  }) => {
    await page.goto('/');
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await wizard.getByRole('button', { name: 'Policies and Calendar', exact: true }).click();
    await wizard
      .getByTestId('hr-setup-check-calendar')
      .getByRole('button', { name: 'Review setup' })
      .click();
    await wizard.getByRole('combobox', { name: /^Policy to configure/ }).click();
    await page
      .getByRole('option', { name: 'Starter School Calendar (editable)', exact: true })
      .click();
    await expect(wizard.getByRole('textbox', { name: 'Name *', exact: true })).toHaveValue(
      'Starter School Calendar (editable)'
    );
    await wizard.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(wizard.getByTestId('hr-setup-check-calendar')).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toHaveCount(0);
  });

  test('saves a shift, earning component and previewed salary template, then stops prompting', async ({
    page,
  }) => {
    await page.goto('/');
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
    await wizard.getByLabel('Shift Name *', { exact: true }).fill('Browser Morning Shift');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(
      wizard.getByRole('button', { name: 'Earning Components', exact: true })
    ).toHaveAttribute('aria-current', 'step');
    await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
    await wizard.getByLabel('Earning Name *', { exact: true }).fill('Browser Basic');
    await wizard.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Percentage Based', exact: true }).click();
    await wizard.getByRole('combobox', { name: 'Calculation base *', exact: true }).click();
    await page.getByRole('option', { name: /Gross Salary/ }).click();
    await wizard.getByRole('spinbutton', { name: /^Percentage/ }).fill('100');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(
      wizard.getByRole('button', { name: 'Salary Template', exact: true })
    ).toHaveAttribute('aria-current', 'step');
    await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
    await wizard.getByLabel(/^Template name/).fill('Browser Staff Salary');
    await wizard.getByRole('combobox', { name: /^ESIC management/ }).click();
    await page.getByRole('option', { name: 'Handled outside ShikshaMitra', exact: true }).click();
    await wizard
      .getByLabel(/reason/i)
      .fill('Synthetic browser fixture uses externally managed ESIC.');
    await wizard.getByRole('button', { name: 'Add Earning', exact: true }).click();
    const earningPicker = page.getByRole('dialog', { name: 'Add Earning Component', exact: true });
    await earningPicker
      .getByRole('combobox', { name: 'Payroll component', exact: true })
      .fill('Browser Basic');
    await page.getByRole('option', { name: 'Browser Basic', exact: true }).click();
    await earningPicker.getByRole('button', { name: 'Add Component', exact: true }).click();
    await wizard
      .getByRole('combobox', { name: 'Payroll purpose for Browser Basic', exact: true })
      .click();
    await page.getByRole('option', { name: 'Basic', exact: true }).click();
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    const deductionPicker = page.getByRole('dialog', {
      name: 'Add Deduction Component',
      exact: true,
    });
    await deductionPicker
      .getByRole('button', { name: 'Create deduction component', exact: true })
      .click();
    await wizard.getByLabel('Deduction Name *', { exact: true }).fill('Browser Optional Deduction');
    await wizard.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Amount Based', exact: true }).click();
    await wizard.getByLabel('Amount *', { exact: true }).fill('1');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Browser Staff Salary');
    await expect(wizard.getByLabel(/reason/i)).toHaveValue(
      'Synthetic browser fixture uses externally managed ESIC.'
    );
    await expect(
      wizard.getByRole('combobox', { name: 'Payroll purpose for Browser Basic', exact: true })
    ).toContainText('Basic');
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    await deductionPicker
      .getByRole('combobox', { name: 'Payroll component', exact: true })
      .fill('Browser Optional Deduction');
    await expect(
      page.getByRole('option', { name: 'Browser Optional Deduction', exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await deductionPicker.getByRole('button', { name: 'Cancel', exact: true }).click();
    await wizard.getByRole('button', { name: 'Preview salary', exact: true }).click();
    await expect(wizard.getByText('Preview ready', { exact: true }).first()).toBeVisible();
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(
      wizard.getByText(
        'HR setup is complete. Individual staff still need salary setup before activation.'
      )
    ).toBeVisible();
    await wizard.getByRole('button', { name: 'Finish setup', exact: true }).click();
    await expect(wizard).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'HR Workspace' })).toBeVisible();
    await expect(wizard).toHaveCount(0);
  });
});
