/* eslint-disable no-restricted-syntax, no-await-in-loop */
import { test, expect } from '@playwright/test';

test.describe('Adjacent salary component recovery with synthetic APIs', () => {
  test.beforeEach(async ({ request }) => {
    expect((await request.post('/fixture/reset')).ok()).toBe(true);
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const events: unknown[] = [];
      (window as any).__hrInteractionEvents = events;
      for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
        document.addEventListener(
          type,
          (event) => {
            const button = event.target instanceof Element ? event.target.closest('button') : null;
            if (button?.getAttribute('aria-label') === 'Edit') {
              events.push({
                type,
                at: performance.now(),
                addDisabled: [...document.querySelectorAll('button')]
                  .filter((item) => item.textContent?.includes('Add'))
                  .map((item) => item.disabled),
              });
            }
          },
          true
        );
      }
      let dialogCount = 0;
      new MutationObserver(() => {
        const count = document.querySelectorAll('[role="dialog"]').length;
        if (count !== dialogCount) {
          events.push({ type: 'dialog-count', count, at: performance.now() });
          dialogCount = count;
        }
      }).observe(document, { childList: true, subtree: true });
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('interaction-events', {
        body: JSON.stringify(await page.evaluate(() => (window as any).__hrInteractionEvents)),
        contentType: 'application/json',
      });
    }
  });

  for (const kind of ['earning', 'deduction']) {
    const title = kind === 'earning' ? 'Earning' : 'Deduction';
    test(`${kind} edit-save and dirty-discard each reopen Add as a fresh create session`, async ({
      page,
      request,
    }) => {
      await request.post('/fixture/seed', {
        data: { [kind === 'earning' ? 'earnings' : 'deductions']: 1 },
      });
      await page.goto(`/?scenario=${kind}-components`);
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      const edit = page.getByRole('dialog', { name: `Edit ${title} Component`, exact: true });
      await edit.getByLabel('Amount *', { exact: true }).fill('150');
      await edit.getByRole('button', { name: 'Update', exact: true }).click();
      const impact = page.getByRole('dialog', { name: 'Payroll Impact Preview', exact: true });
      await expect(impact).toBeVisible();
      await impact.getByRole('button', { name: 'Save synced only', exact: true }).click();
      await expect(edit).toHaveCount(0);
      await page.getByRole('button', { name: `Add ${kind}`, exact: true }).click();
      const create = page.getByRole('dialog', { name: `Add ${title} Component`, exact: true });
      const name = create.getByLabel(`${title} Name *`, { exact: true });
      await expect(name).toHaveValue('');
      await name.fill(`Created ${kind}`);
      await create.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
      await page.getByRole('option', { name: 'Amount Based', exact: true }).click();
      await create.getByLabel('Amount *', { exact: true }).fill('250');
      await create.getByRole('button', { name: 'Submit', exact: true }).click();
      await expect(create).toHaveCount(0);
      await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
      await edit.getByLabel(`${title} Name *`, { exact: true }).fill('Discarded edit');
      page.once('dialog', (dialog) => dialog.dismiss());
      await edit.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(edit.getByLabel(`${title} Name *`, { exact: true })).toHaveValue(
        'Discarded edit'
      );
      page.once('dialog', (dialog) => dialog.accept());
      await edit.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(edit).toHaveCount(0);
      await page.getByRole('button', { name: `Add ${kind}`, exact: true }).click();
      await expect(create.getByLabel(`${title} Name *`, { exact: true })).toHaveValue('');
      const state = await (await request.get('/fixture/state')).json();
      expect(state.updates).toHaveLength(1);
      const rows = kind === 'earning' ? state.earnings : state.deductions;
      expect(rows).toHaveLength(2);
      expect(rows[0].amount).toBe(150);
      expect(rows[1]).toMatchObject({ [`${kind}ComponentName`]: `Created ${kind}`, amount: 250 });
    });

    test(`${kind} percentage choices include and filter components beyond the former caps`, async ({
      page,
      request,
    }) => {
      await request.post('/fixture/seed', { data: { earnings: 205, deductions: 25 } });
      await page.goto(`/?scenario=${kind}-components`);
      await page.getByRole('button', { name: `Add ${kind}`, exact: true }).click();
      const create = page.getByRole('dialog', { name: `Add ${title} Component`, exact: true });
      await create.getByRole('combobox', { name: 'Calculation Type *', exact: true }).click();
      await page.getByRole('option', { name: 'Percentage Based', exact: true }).click();
      const base = create.getByRole('combobox', { name: 'Calculation base *', exact: true });
      await base.fill('Earning 205');
      await page.getByRole('option', { name: 'Earning 205', exact: true }).click();
      await expect(base).toHaveValue('Earning 205');
      if (kind === 'deduction') {
        await base.fill('Deduction 25');
        await page.getByRole('option', { name: 'Deduction 25', exact: true }).click();
        await expect(base).toHaveValue('Deduction 25');
      }
      page.once('dialog', (dialog) => dialog.accept());
      await create.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(create).toHaveCount(0);
    });
  }

  test('embedded earning updates expose the impact decision above the wizard and retain edits on Review', async ({
    page,
    request,
  }) => {
    await request.post('/fixture/seed', { data: { earnings: 1 } });
    await page.goto('/');
    const wizard = page.getByRole('dialog', { name: 'Complete HR Setup', exact: true });
    await wizard.getByRole('button', { name: 'Earning Components', exact: true }).click();
    await wizard.getByRole('button', { name: 'Review setup', exact: true }).click();
    await wizard.getByRole('combobox', { name: /^Earning component/ }).click();
    await page.getByRole('option', { name: 'Earning 1', exact: true }).click();
    await wizard.getByLabel('Amount *', { exact: true }).fill('175');
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    const impact = page.getByRole('dialog', { name: 'Payroll Impact Preview', exact: true });
    await expect(impact).toBeInViewport();
    await page.screenshot({ path: '.artifacts/hr-adjacent-impact.png', animations: 'disabled' });
    await impact.getByRole('button', { name: 'Review', exact: true }).click();
    await expect(wizard.getByLabel('Amount *', { exact: true })).toHaveValue(/175/);
    await wizard.getByRole('button', { name: 'Save and next', exact: true }).click();
    await impact.getByRole('button', { name: 'Save synced only', exact: true }).click();
    await expect(
      wizard.getByRole('button', { name: 'Salary Template', exact: true })
    ).toHaveAttribute('aria-current', 'step');
    expect((await (await request.get('/fixture/state')).json()).updates).toHaveLength(1);
  });
});
