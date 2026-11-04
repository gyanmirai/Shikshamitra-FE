import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('browser-created common policy persists and charges once through partial and full payment', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const contextResponse = await request.get('/fixture/context');
  expect(contextResponse.ok()).toBeTruthy();
  const context = await contextResponse.json();
  const routingResponse = await request.get(
    `/api/finance-routing-options?academicYearId=${context.academicYearId}&operation=collection-policy`
  );
  expect(routingResponse.ok()).toBeTruthy();
  const routing = await routingResponse.json();
  const category = routing.incomeCategories.find((row: any) => row.id === context.incomeCategoryId);
  expect(category).toBeTruthy();
  const name = `Browser Common ${Date.now()}`;
  await page.goto('/');
  await page.getByRole('button', { name: 'Create collection policy', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Create Collection Policy', exact: true });
  await dialog.getByRole('textbox', { name: 'Policy name *', exact: true }).fill(name);
  await dialog.getByRole('combobox', { name: 'Status *', exact: true }).click();
  await page.getByRole('option', { name: /^Active/ }).click();
  await dialog.getByRole('switch', { name: 'Enable late fee charges' }).check();
  await expect(dialog.getByText('Apply late fee on fee heads', { exact: false })).toHaveCount(0);
  await expect(dialog.getByText('Fee head overrides', { exact: false })).toHaveCount(0);
  await dialog.getByRole('textbox', { name: 'Flat late fee amount *', exact: true }).fill('125');
  await dialog.getByRole('combobox', { name: /^Late fee income category/i }).click();
  await page.getByRole('option', { name: category.label, exact: true }).click();
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/finance/collection-policies') &&
      response.request().method() === 'POST'
  );
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  const createdResponse = await createResponse;
  expect(createdResponse.status()).toBe(200);
  const created = await createdResponse.json();
  expect(created.applyLateFeeToAllFeeHeads).toBe(true);
  expect(created.lateFeeApplyOnFeeHeads).toEqual([]);
  expect(created.feeHeadOverrides).toEqual([]);
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('saved-policy-id')).toHaveText(created.id);
  await page.getByRole('button', { name: 'Edit saved policy', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Edit Collection Policy', exact: true });
  await expect(
    dialog.getByRole('textbox', { name: 'Flat late fee amount *', exact: true })
  ).toHaveValue('125');
  await expect(dialog.getByText('Apply late fee on fee heads', { exact: false })).toHaveCount(0);
  await dialog
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill('Browser verified common late fee across all overdue fees.');
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/finance/collection-policies/${created.id}`) &&
      response.request().method() === 'PUT'
  );
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  expect((await updateResponse).status()).toBe(200);
  await expect(dialog).toBeHidden();
  const readbackResponse = await request.get(`/api/finance/collection-policies/${created.id}`);
  expect(readbackResponse.ok()).toBeTruthy();
  const readback = await readbackResponse.json();
  expect(readback.applyLateFeeToAllFeeHeads).toBe(true);
  expect(readback.lateFeeApplyOnFeeHeads).toEqual([]);
  expect(readback.feeHeadOverrides).toEqual([]);
  expect(readback.description).toBe('Browser verified common late fee across all overdue fees.');
  const versionsResponse = await request.get(
    `/api/finance/collection-policies/${created.id}/versions?maxResultCount=100`
  );
  expect(versionsResponse.ok()).toBeTruthy();
  const versions = await versionsResponse.json();
  expect(versions.items.length).toBeGreaterThanOrEqual(2);
  for (const version of versions.items) {
    const snapshot = JSON.parse(version.snapshotJson);
    expect(snapshot.ApplyLateFeeToAllFeeHeads).toBe(true);
    expect(snapshot.LateFeeApplyOnFeeHeads).toEqual([]);
    expect(snapshot.FeeHeadOverrides).toEqual([]);
  }
  const verificationResponse = await request.post(`/fixture/verify/${created.id}`, {
    timeout: 180000,
  });
  expect(verificationResponse.ok(), await verificationResponse.text()).toBeTruthy();
  const verification = await verificationResponse.json();
  const output = process.env.COLLECTION_LATEFEE_ARTIFACTS || '.artifacts/collection-latefee';
  await mkdir(output, { recursive: true });
  await writeFile(
    `${output}/browser-evidence.json`,
    JSON.stringify({ created, readback, versions, verification, errors }, null, 2)
  );
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.getByRole('button', { name: 'Edit saved policy', exact: true }).click();
  await expect(
    page.getByRole('dialog', { name: 'Edit Collection Policy', exact: true })
  ).toBeVisible();
  await page.getByRole('combobox', { name: /^Late fee income category/i }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/common-latefee-dark.png`, fullPage: true });
  expect(errors).toEqual([]);
});
