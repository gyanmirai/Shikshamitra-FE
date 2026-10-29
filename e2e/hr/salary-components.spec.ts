/* eslint-disable no-restricted-syntax, no-await-in-loop */
import type { Page } from '@playwright/test';

import { test, expect } from '@playwright/test';

const wizardFor = (page: Page) =>
  page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
const pickerFor = (page: Page, kind: string) =>
  page.getByRole('dialog', { name: `Add ${kind} Component`, exact: true });

async function createDeduction(page: Page, name: string) {
  const wizard = wizardFor(page);
  await wizard.getByLabel('Deduction Name *', { exact: true }).fill(name);
  await wizard.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
  await page.getByRole('option', { name: 'Amount Based', exact: true }).click();
  await wizard.getByLabel('Amount *', { exact: true }).fill('1000');
}

async function openTemplate(page: Page) {
  const wizard = wizardFor(page);
  await wizard.getByRole('button', { name: 'Salary Template', exact: true }).click();
  await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
  await wizard.getByLabel(/^Template name/).fill('Retained salary draft');
}

test.describe('Bug 6484 with synthetic APIs and real setup editors', () => {
  test.beforeEach(async ({ request }) => {
    expect((await request.post('/fixture/reset')).ok()).toBe(true);
  });

  test('creates earnings and optional deductions, then adds both rules and completes the template', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    const wizard = wizardFor(page);
    await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
    await wizard.getByLabel('Earning Name *', { exact: true }).fill('Synthetic Basic');
    await wizard.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
    await page.getByRole('option', { name: 'Amount Based', exact: true }).click();
    await wizard.getByLabel('Amount *', { exact: true }).fill('50000');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await wizard.getByRole('button', { name: 'Earning Components', exact: true }).click();
    await wizard.getByRole('button', { name: 'Set up deductions', exact: true }).click();
    await createDeduction(page, 'Synthetic Recovery');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await openTemplate(page);
    await wizard.getByRole('combobox', { name: /^ESIC management/ }).click();
    await page.getByRole('option', { name: 'Handled outside ShikshaMitra', exact: true }).click();
    await wizard.getByLabel(/reason/i).fill('Synthetic external ESIC fixture.');
    for (const [kind, name] of [
      ['Earning', 'Synthetic Basic'],
      ['Deduction', 'Synthetic Recovery'],
    ]) {
      await wizard.getByRole('button', { name: `Add ${kind}`, exact: true }).click();
      const picker = pickerFor(page, kind);
      await expect(picker).toBeInViewport();
      const component = picker.getByRole('combobox', { name: 'Payroll component', exact: true });
      await expect(component).toBeEnabled();
      await component.click();
      await page.getByRole('option', { name, exact: true }).click();
      await expect(component).toHaveText(name);
      expect((await (await request.get('/fixture/state')).json()).templates).toHaveLength(0);
      await picker.getByRole('button', { name: 'Submit', exact: true }).click();
      await wizard
        .getByRole('textbox', { name: `${name} amount`, exact: true })
        .fill(kind === 'Earning' ? '50000' : '1000');
    }
    await wizard
      .getByRole('combobox', { name: 'Payroll purpose for Synthetic Basic', exact: true })
      .click();
    await page.getByRole('option', { name: 'Basic', exact: true }).click();
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    await expect(pickerFor(page, 'Deduction').getByRole('alert')).toContainText('already added');
    await pickerFor(page, 'Deduction').getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Retained salary draft');
    await wizard.getByRole('button', { name: 'Preview salary', exact: true }).click();
    await expect(wizard.getByText('Preview ready', { exact: true }).first()).toBeVisible();
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(wizard.getByRole('button', { name: 'Finish setup', exact: true })).toBeEnabled();
    await wizard.getByRole('button', { name: 'Finish setup', exact: true }).click();
    await expect(wizard).toHaveCount(0);
    const saved = await (await request.get('/fixture/state')).json();
    expect(saved.deductions).toHaveLength(1);
    expect(saved.deductions[0]).toMatchObject({
      deductionComponentName: 'Synthetic Recovery',
      calculationType: 'Amount',
      amount: 1000,
      visibleInPayslip: true,
    });
    expect(saved.templates).toHaveLength(1);
    expect(saved.templates[0].rules).toHaveLength(2);
  });

  test('returns from dependency cancellation and failed save without losing the template draft', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    await openTemplate(page);
    const wizard = wizardFor(page);
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    await expect(pickerFor(page, 'Deduction').getByRole('alert')).toContainText(
      'No active deduction components'
    );
    await pickerFor(page, 'Deduction')
      .getByRole('button', { name: 'Create deduction component', exact: true })
      .click();
    await createDeduction(page, 'Retained recovery');
    await wizard.getByRole('button', { name: 'Back', exact: true }).click();
    const discard = page.getByRole('dialog', { name: 'Discard Unsaved Changes?', exact: true });
    await discard.getByRole('button', { name: 'Keep Editing', exact: true }).click();
    await expect(wizard.getByLabel('Deduction Name *', { exact: true })).toHaveValue(
      'Retained recovery'
    );
    await wizard.getByRole('button', { name: 'Back', exact: true }).click();
    await discard.getByRole('button', { name: 'Discard Changes', exact: true }).click();
    await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Retained salary draft');
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    await pickerFor(page, 'Deduction')
      .getByRole('button', { name: 'Create deduction component', exact: true })
      .click();
    await createDeduction(page, 'Retained recovery');
    await request.post('/fixture/control', { data: { failDeduction: true } });
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(page.getByText('Synthetic deduction save failed. Retry.')).toBeVisible();
    await expect(wizard.getByLabel('Deduction Name *', { exact: true })).toHaveValue(
      'Retained recovery'
    );
    await request.post('/fixture/control', { data: { failDeduction: false } });
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Retained salary draft');
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    await pickerFor(page, 'Deduction')
      .getByRole('combobox', { name: 'Payroll component', exact: true })
      .click();
    await expect(
      page.getByRole('option', { name: 'Retained recovery', exact: true })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await pickerFor(page, 'Deduction').getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Retained salary draft');
    expect((await (await request.get('/fixture/state')).json()).deductions).toHaveLength(1);
  });

  test('explains missing create access without offering an unauthorized deduction action', async ({
    page,
  }) => {
    await page.goto('/?scenario=no-deduction-create');
    const wizard = wizardFor(page);
    await expect(
      wizard.getByRole('button', { name: 'Set up deductions', exact: true })
    ).toHaveCount(0);
    await expect(
      wizard.getByText('Ask your HR administrator to create deduction components if needed.')
    ).toBeVisible();
    await openTemplate(page);
    await wizard.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    const picker = pickerFor(page, 'Deduction');
    await expect(picker.getByRole('alert')).toContainText('Ask your HR administrator');
    await expect(
      picker.getByRole('button', { name: 'Create deduction component', exact: true })
    ).toHaveCount(0);
    await expect(picker.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
  });

  test('distinguishes a failed component catalogue from missing setup and retries', async ({
    page,
    request,
  }) => {
    await request.post('/fixture/control', { data: { failCatalog: true } });
    await page.goto('/');
    const wizard = wizardFor(page);
    await wizard.getByRole('button', { name: 'Salary Template', exact: true }).click();
    await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
    await expect(wizard.getByRole('alert')).toContainText(
      'Unable to load salary components. Retry to continue configuring the template.'
    );
    await expect(wizard.getByRole('button', { name: 'Add Deduction', exact: true })).toHaveCount(0);
    await request.post('/fixture/control', { data: { failCatalog: false } });
    await wizard.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(wizard.getByRole('button', { name: 'Add Deduction', exact: true })).toBeVisible();
  });

  test('reloads standalone choices after creating in a new tab without losing the selection or template draft', async ({
    page,
    request,
    context,
  }) => {
    await request.post('/fixture/seed', { data: { earnings: 1, deductions: 1 } });
    await page.goto('/?scenario=salary-template');
    await page.getByLabel(/^Template name/).fill('Standalone retained draft');
    await page.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    const picker = pickerFor(page, 'Deduction');
    const component = picker.getByRole('combobox', { name: 'Payroll component', exact: true });
    await expect(component).toBeEnabled();
    await component.click();
    await page.getByRole('option', { name: 'Deduction 1', exact: true }).click();
    const popupPromise = context.waitForEvent('page');
    await picker
      .getByRole('link', { name: 'Create deduction component (new tab)', exact: true })
      .click();
    const popup = await popupPromise;
    await popup.getByRole('button', { name: 'Add deduction', exact: true }).click();
    const create = pickerFor(popup, 'Deduction');
    await create.getByLabel('Deduction Name *', { exact: true }).fill('New tab recovery');
    await create.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
    await popup.getByRole('option', { name: 'Amount Based', exact: true }).click();
    await create.getByLabel('Amount *', { exact: true }).fill('1000');
    await create.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(create).toHaveCount(0);
    await popup.close();
    await page.bringToFront();
    // Headless Chromium does not consistently emit a native window-focus event on tab return.
    const refreshed = page.waitForResponse((response) =>
      response.url().endsWith('/component-catalog')
    );
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await refreshed;
    await expect(component).toBeEnabled();
    await expect(component).toHaveText('Deduction 1');
    await component.click();
    await page
      .getByRole('textbox', { name: 'Search Payroll component', exact: true })
      .fill('New tab');
    await expect(page.getByRole('option', { name: 'New tab recovery', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await picker.getByRole('button', { name: 'Cancel', exact: true }).click();
    await page.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(component).toHaveText('Deduction 1');
    await page.screenshot({
      path: '.artifacts/salary-components/standalone-picker.png',
      animations: 'disabled',
    });
    await picker.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(picker).toHaveCount(0);
    await expect(page.getByLabel(/^Template name/)).toHaveValue('Standalone retained draft');
    expect((await (await request.get('/fixture/state')).json()).templates).toHaveLength(0);
  });

  test('retains the standalone draft and selected component after refresh fails, then retries', async ({
    page,
    request,
  }) => {
    await request.post('/fixture/seed', { data: { earnings: 1, deductions: 1 } });
    await page.goto('/?scenario=salary-template');
    await page.getByLabel(/^Template name/).fill('Failed refresh retained draft');
    await page.getByRole('button', { name: 'Add Deduction', exact: true }).click();
    const picker = pickerFor(page, 'Deduction');
    const component = picker.getByRole('combobox', { name: 'Payroll component', exact: true });
    await expect(component).toBeEnabled();
    await component.click();
    await page.getByRole('option', { name: 'Deduction 1', exact: true }).click();
    await request.post('/fixture/control', { data: { failCatalog: true } });
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });
    await expect(picker.getByRole('alert')).toContainText('Unable to load payroll components');
    await expect(component).toHaveText('Deduction 1');
    await expect(picker.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled();
    await request.post('/fixture/control', { data: { failCatalog: false } });
    await picker.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(picker.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled();
    await expect(picker.getByText(/Setup refreshed/)).toHaveCount(0);
    await picker.getByRole('button', { name: 'Submit', exact: true }).press('Enter');
    await expect(page.getByLabel(/^Template name/)).toHaveValue('Failed refresh retained draft');
  });

  for (const theme of ['light', 'dark']) {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      test(`keeps both pickers reachable at ${viewport.width}px in ${theme}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/?theme=${theme}`);
        const wizard = wizardFor(page);
        if (viewport.width < 600) {
          await wizard.getByRole('button', { name: 'Next', exact: true }).click();
        } else {
          await wizard.getByRole('button', { name: 'Salary Template', exact: true }).click();
        }
        await wizard.getByRole('button', { name: 'Set up', exact: true }).click();
        await wizard.getByLabel(/^Template name/).fill('Responsive draft');
        for (const kind of ['Earning', 'Deduction']) {
          const launcher = wizard.getByRole('button', { name: `Add ${kind}`, exact: true });
          await launcher.click();
          const picker = pickerFor(page, kind);
          await expect(picker).toBeInViewport();
          await expect(
            picker.getByRole('button', { name: 'Refresh setup', exact: true })
          ).toHaveCount(0);
          await expect(picker.getByText('Component Details', { exact: true })).toBeVisible();
          await expect(
            picker.getByRole('combobox', { name: 'Payroll component', exact: true })
          ).toBeInViewport();
          await expect(
            picker.getByRole('button', { name: 'Cancel', exact: true })
          ).toBeInViewport();
          await picker.getByRole('button', { name: 'Cancel', exact: true }).focus();
          await page.keyboard.press('Tab');
          await expect(picker.locator(':focus')).toHaveCount(1);
          await expect(
            picker.getByRole('button', { name: `Add ${kind} Component information`, exact: true })
          ).toBeFocused();
          await page.screenshot({
            path: `.artifacts/salary-components/picker-${theme}-${viewport.width}-${kind}.png`,
            animations: 'disabled',
          });
          await page.keyboard.press('Escape');
          await expect(picker).toHaveCount(0);
          await expect(launcher).toBeFocused();
        }
        await expect(wizard.getByLabel(/^Template name/)).toHaveValue('Responsive draft');
        await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', theme);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        ).toBe(true);
        await page.screenshot({
          path: `.artifacts/salary-components/${theme}-${viewport.width}.png`,
        });
      });
    }
  }
});
