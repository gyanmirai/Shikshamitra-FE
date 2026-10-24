/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

async function openFilter(page: Page, label: string, operator: 'Equals' | 'Between') {
  await page.goto('/');
  await page.getByRole('button', { name: `Filter ${label}`, exact: true }).click();
  await page.getByRole('combobox', { name: 'Filter Type *', exact: true }).click();
  await page.getByRole('option', { name: operator, exact: true }).click();
}

for (const { label, id, min, max } of [
  { label: 'Leave days', id: 'leaveDays', min: '0.5', max: '1.5' },
  { label: 'Amount', id: 'amount', min: '100.25', max: '200.75' },
]) {
  for (const operator of ['Equals', 'Between'] as const) {
    for (const submit of ['Enter', 'Apply'] as const) {
      test(`${label} applies fractional ${operator} criteria with ${submit}`, async ({
        page,
      }, info) => {
        await openFilter(page, label, operator);
        if (operator === 'Between') {
          await page.getByRole('spinbutton', { name: `${label} Min *`, exact: true }).fill(min);
          await page.getByRole('spinbutton', { name: `${label} Max *`, exact: true }).fill(max);
        } else await page.getByRole('spinbutton', { name: `${label} *`, exact: true }).fill(min);
        const validity = await page.getByRole('spinbutton').evaluateAll((inputs) =>
          inputs.map((input) => ({
            step: (input as HTMLInputElement).step,
            stepMismatch: (input as HTMLInputElement).validity.stepMismatch,
          }))
        );
        await info.attach('native-validity.json', {
          body: JSON.stringify(validity),
          contentType: 'application/json',
        });
        if (submit === 'Enter') await page.getByRole('spinbutton').last().press('Enter');
        else await page.getByRole('button', { name: 'Apply', exact: true }).click();
        await expect(page.getByTestId('applied')).not.toHaveText('Not applied');
        expect(validity.every((input) => !input.stepMismatch)).toBe(true);
        const applied = JSON.parse(await page.getByTestId('applied').innerText());
        expect(applied.column).toBe(id);
        expect(applied.operator).toBe(operator.toLowerCase());
        if (operator === 'Between') {
          expect(Number(applied.value.min)).toBe(Number(min));
          expect(Number(applied.value.max)).toBe(Number(max));
        } else expect(Number(applied.value)).toBe(Number(min));
      });
    }
  }
}

for (const operator of ['Equals', 'Between'] as const) {
  test(`explicit integer ${operator} criteria retain integer validation`, async ({ page }) => {
    await openFilter(page, 'Count', operator);
    const first = page.getByRole('spinbutton').first();
    await first.fill('1.5');
    if (operator === 'Between')
      await page.getByRole('spinbutton', { name: 'Count Max *', exact: true }).fill('3');
    await expect(first).toHaveAttribute('step', '1');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.getByTestId('applied')).toHaveText('Not applied');
    await first.fill('2');
    await page.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect(page.getByTestId('applied')).not.toHaveText('Not applied');
  });
}
