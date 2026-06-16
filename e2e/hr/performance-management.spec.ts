import { test, expect, type Page } from '@playwright/test';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function chooseSelectOption(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label }).first().click();
  await page
    .getByRole('option', { name: new RegExp(escapeRegExp(option)) })
    .first()
    .click();
}

async function closeReviewWorkspace(page: Page) {
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('performance-review-workspace')).toBeHidden({ timeout: 10_000 });
}

test.describe('HR Performance Management', () => {
  test('renders overview, SQAAF audit pack reports, settings, and legacy setup redirect', async ({
    page,
  }) => {
    await page.goto('/hr/professional-management/overview', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Performance Management').first()).toBeVisible();
    await expect(page.getByText('Prepare SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByText('SQAAF readiness').first()).toBeVisible();

    const auditPackResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/hr/professional-management/reports/sqaaf-audit-pack') &&
        response.request().method() === 'GET'
    );
    await page.goto('/hr/professional-management/reports', { waitUntil: 'domcontentloaded' });
    const auditResponse = await auditPackResponse;
    expect(auditResponse.ok()).toBeTruthy();
    await expect(page.getByText('SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByText('SQAAF readiness').first()).toBeVisible();
    await expect(page.getByText('Ready domains').first()).toBeVisible();
    await expect(page.getByText('Domains Ready')).toHaveCount(0);
    await expect(page.getByText('NaN%')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Export Audit Pack' })).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export Audit Pack' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/sqaaf/i);
    await expect(
      page
        .getByTestId('performance-report-sqaaf-audit-pack-missing-evidence')
        .getByText('Missing Evidence')
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SQAAF Evidence Coverage' })).toBeVisible();

    await page.goto('/hr/professional-management/settings', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Performance settings')).toBeVisible();
    await expect(page.getByText('Board Presets / SQAAF Mapping')).toBeVisible();

    await page.goto('/hr/professional-management/setup', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/hr\/professional-management\/settings\/setup/);
    await expect(page.getByRole('heading', { name: 'Setup & readiness' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/hr/professional-management/reports', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('SQAAF Audit Pack')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Audit Pack' })).toBeVisible();
  });

  test('runs guided setup, preserves evidence after reopen, and scopes workspace actions', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const unique = Date.now();
    const cycleName = `E2E PM Cycle ${unique}`;

    await page.goto('/hr/professional-management/settings/setup', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByRole('heading', { name: 'Setup & readiness' })).toBeVisible();

    const addPresetsButton = page.getByRole('button', { name: 'Add Board Presets' });
    await expect(addPresetsButton).toBeVisible();
    if (await addPresetsButton.isEnabled()) {
      await addPresetsButton.click();
    }

    await page.getByLabel('Cycle name').fill(cycleName);
    const createAssignButton = page.getByRole('button', { name: 'Create & Assign' });
    await expect(createAssignButton).toBeEnabled({ timeout: 30_000 });
    await createAssignButton.click();
    await expect(
      page.getByText('Cycle created, published, and assigned to active staff')
    ).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByText(/matching active cycle already exists/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(createAssignButton).toBeDisabled();

    await page.goto('/hr/professional-management/overview', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Live Review Queue')).toBeVisible();
    await expect(page.getByText(cycleName).first()).toBeVisible({ timeout: 30_000 });
    const overviewRow = page.getByRole('row', { name: new RegExp(cycleName) }).first();
    await expect(overviewRow.getByRole('button', { name: 'Open' })).toBeEnabled();
    await overviewRow.getByRole('button', { name: 'Open' }).click();
    await expect(page.getByTestId('performance-review-workspace')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('performance-review-workspace')).toHaveAttribute(
      'data-workspace-mode',
      'review'
    );
    await closeReviewWorkspace(page);

    await page.goto('/hr/professional-management/reviews', { waitUntil: 'domcontentloaded' });
    await chooseSelectOption(page, 'Cycle', cycleName);
    await expect(page.getByText('NaN%')).toHaveCount(0);
    const initialEvidenceResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/hr/professional-management/reviews/') &&
        response.url().endsWith('/evidence') &&
        response.request().method() === 'GET'
    );
    await page.getByRole('button', { name: 'Self Review' }).first().click();
    expect((await initialEvidenceResponse).ok()).toBeTruthy();
    await expect(page.getByTestId('performance-review-workspace')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('performance-review-workspace')).toHaveAttribute(
      'data-workspace-mode',
      'self'
    );
    await expect(page.getByTestId('performance-criterion-row').first()).toBeVisible();
    await expect(page.getByText('Evidence required').first()).toBeVisible();

    await page.getByLabel('Stage comment').fill('E2E review stage evidence and ratings completed.');
    await page.getByTestId('performance-submit-stage').click();
    await expect(
      page.getByText(/Add evidence for each required criterion before submitting/)
    ).toBeVisible();

    const requiredRows = page
      .getByTestId('performance-criterion-row')
      .filter({ hasText: 'Evidence required' });
    const requiredCount = await requiredRows.count();
    expect(requiredCount).toBeGreaterThan(0);

    /* eslint-disable no-await-in-loop */
    for (let index = 0; index < requiredCount; index += 1) {
      const row = requiredRows.nth(index);
      await row.getByRole('button', { name: /Add Evidence|Add More Evidence/ }).click();
      const dialog = page.getByTestId('performance-evidence-dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByLabel('Evidence title').fill(`E2E evidence ${unique}-${index + 1}`);
      await dialog.getByLabel('Notes').fill('Evidence added by the performance-management E2E.');
      await page.getByRole('button', { name: 'Save Evidence' }).click();
      await expect(dialog).toBeHidden({ timeout: 30_000 });
    }
    /* eslint-enable no-await-in-loop */

    await expect(page.getByText('Evidence ready')).toBeVisible({ timeout: 30_000 });
    await closeReviewWorkspace(page);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await chooseSelectOption(page, 'Cycle', cycleName);
    await expect(page.getByText(cycleName).first()).toBeVisible({ timeout: 30_000 });
    const persistedEvidenceResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/hr/professional-management/reviews/') &&
        response.url().endsWith('/evidence') &&
        response.request().method() === 'GET'
    );
    await page.getByRole('button', { name: 'Self Review' }).first().click();
    expect((await persistedEvidenceResponse).ok()).toBeTruthy();
    await expect(page.getByText('Evidence ready')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('performance-submit-stage').click();
    await expect(page.getByText('Self Appraisal submitted')).toBeVisible({ timeout: 30_000 });
    await closeReviewWorkspace(page);

    await page.getByRole('button', { name: 'Observations' }).click();
    await chooseSelectOption(page, 'Cycle', cycleName);
    await page.getByRole('button', { name: 'Observe' }).first().click();
    await expect(page.getByTestId('performance-review-workspace')).toHaveAttribute(
      'data-workspace-mode',
      'observation'
    );
    await expect(page.getByRole('button', { name: 'Add Observation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Stage' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Add Evidence|Add More Evidence/ })).toHaveCount(
      0
    );
    await expect(page.getByRole('button', { name: 'Finalize Outcome' })).toHaveCount(0);
    await closeReviewWorkspace(page);

    await page.goto('/hr/professional-management/outcomes', { waitUntil: 'domcontentloaded' });
    await chooseSelectOption(page, 'Cycle', cycleName);
    await page.getByRole('button', { name: 'Calibrate' }).first().click();
    await expect(page.getByTestId('performance-review-workspace')).toHaveAttribute(
      'data-workspace-mode',
      'outcome'
    );
    await expect(page.getByRole('button', { name: 'Add Development Plan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finalize Outcome' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Stage' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add Observation' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Add Evidence|Add More Evidence/ })).toHaveCount(
      0
    );
  });
});
