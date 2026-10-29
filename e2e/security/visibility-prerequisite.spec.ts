/* eslint-disable import/extensions -- Shared executable fixture uses ESM. */
import { test, expect } from '@playwright/test';

import { runPayrollNames } from '../fixtures/permission-bulk/catalogue.mjs';

const moduleName = 'ShikshaMitra.Module.HR';
const feature = `${moduleName}.Payroll`;
const actions = runPayrollNames;

test('hidden actions require confirmation and save visibility with permissions', async ({
  page,
  request,
}) => {
  await request.post('/fixture/reset');
  await request.put('/api/permission-management/permissions?providerName=R&providerKey=HOD', {
    data: {
      permissions: [...actions, moduleName, feature].map((name) => ({ name, isGranted: false })),
    },
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Role HOD Module Permission', exact: true }).click();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
  const row = page.getByTestId('permission-Run Payroll');
  await expect(row.getByRole('radio', { name: 'Allow', exact: true })).toHaveCount(actions.length);
  await Promise.all(
    (await row.getByRole('radio', { name: 'Allow', exact: true }).all()).map((radio) =>
      expect(radio).toBeDisabled()
    )
  );
  await row.getByRole('group', { name: 'Run Payroll View editor' }).getByRole('radiogroup').hover();
  await expect(page.getByRole('tooltip')).toContainText(
    "Enable Visibility access for this feature in 'Set Visibility'"
  );

  const grant = row.getByRole('button', { name: 'Grant all Run Payroll permissions' });
  await grant.click();
  const confirmation = page.getByRole('dialog', { name: 'Enable Navigation Visibility?' });
  await expect(confirmation).toContainText(
    'Enabling module permissions will automatically grant Navigation Visibility'
  );
  await expect(confirmation).toContainText('HR/Staff / Payroll Management');
  await page.screenshot({ path: test.info().outputPath('visibility-confirmation.png') });
  await confirmation.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(confirmation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Review changes', exact: true })).toBeDisabled();

  await grant.click();
  await confirmation.getByRole('button', { name: 'Enable visibility and grant' }).click();
  await page.getByRole('button', { name: 'Review changes', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const writes = await (await request.get('/fixture/writes')).json();
  const saved = writes.at(-1).permissions;
  expect(new Set(saved.map((entry: { name: string }) => entry.name))).toEqual(
    new Set([...actions, moduleName, feature])
  );
  expect(saved.every((entry: { isGranted: boolean }) => entry.isGranted)).toBe(true);
  await page.getByRole('button', { name: 'Role HOD Module Permission', exact: true }).click();
  await page.getByRole('button', { name: 'HR/Staff', exact: true }).click();
  await page.getByRole('button', { name: 'Payroll Management', exact: true }).click();
  await expect(
    page
      .getByTestId('permission-Run Payroll')
      .getByRole('radio', { name: 'Allow', exact: true })
      .first()
  ).toBeEnabled();
});
