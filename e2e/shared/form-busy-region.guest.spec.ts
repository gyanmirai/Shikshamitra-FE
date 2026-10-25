import { test, expect } from '@playwright/test';

// Start the local fixture with: node node_modules/vite/bin/vite.js --config e2e/fixtures/form-busy-region/vite.config.mts
test('concession form stays populated after opening and cancelling approval confirmation', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4214/');
  const student = page.getByRole('combobox', { name: 'Student', exact: true });
  const policy = page.getByRole('combobox', { name: 'Concession policy', exact: true });
  const submit = page.getByRole('button', { name: 'Submit and approve', exact: true });
  await expect(submit).toBeEnabled();

  async function verifyConfirmationCycle(cycle: number) {
    await submit.click();
    const dialog = page.getByRole('dialog', { name: 'Submit and Approve Concession?' });
    await expect(dialog).toBeVisible();
    await expect(page.locator('input[name="studentId"]')).toBeVisible();
    await dialog.getByRole('button', { name: 'Keep editing', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(student, `student field after save cycle ${cycle}`).toBeVisible();
    await expect(policy, `policy field after save cycle ${cycle}`).toBeVisible();
    await expect(student).toHaveValue('Sample Student');
    await expect(policy).toContainText('Sample policy');
    await expect(submit).toBeEnabled();
  }
  await verifyConfirmationCycle(1);
  await verifyConfirmationCycle(2);
});
