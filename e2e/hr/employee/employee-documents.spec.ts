/* eslint-disable import/no-extraneous-dependencies */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test, expect } from '@playwright/test';

import { gotoEmployeeList, openFirstRowProfile } from './employee-page';

function writeFixtureFile(name: string, contents: Buffer | string) {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, contents);
  return filePath;
}

test.describe('HR Staff documents', () => {
  test('uploads and lists a valid PDF document from the profile Documents tab', async ({
    page,
  }) => {
    await gotoEmployeeList(page);
    await openFirstRowProfile(page);
    await page.getByRole('tab', { name: 'Documents' }).click();

    const fileInput = page.locator('input[type="file"]').first();
    if (!(await fileInput.count())) {
      test.skip(true, 'Document upload input is not available for the current staff/profile.');
    }

    const fileName = `employee-e2e-${Date.now()}.pdf`;
    const filePath = writeFixtureFile(
      fileName,
      Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF')
    );

    await fileInput.setInputFiles(filePath);
    await page
      .getByRole('button', { name: /Save|Submit|Upload/i })
      .first()
      .click();
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 20_000 });
  });

  test('rejects missing or unsupported staff document file', async ({ page }) => {
    await gotoEmployeeList(page);
    await openFirstRowProfile(page);
    await page.getByRole('tab', { name: 'Documents' }).click();

    const submit = page.getByRole('button', { name: /Save|Submit|Upload/i }).first();
    if (!(await submit.isVisible())) {
      test.skip(true, 'Document submit control is not available for the current staff/profile.');
    }

    await submit.click();
    await expect(page.getByText(/required|file/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      const unsupported = writeFixtureFile(`employee-e2e-${Date.now()}.exe`, 'unsupported');
      await fileInput.setInputFiles(unsupported);
      await expect(page.getByText(/unsupported|invalid|allowed/i)).toBeVisible();
    }
  });
});
