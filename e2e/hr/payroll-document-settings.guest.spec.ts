/* eslint-disable import/no-extraneous-dependencies, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const settingsPath = '/hr/payroll/setting/payslip-statement-settings';
const payslipsPath = '/hr/payroll/payslip-generation';
const emailLabel = 'Email each employee after payroll finalization';

async function mockPayrollDocuments(page: Page, canEdit = true) {
  const year = { id: '11111111-1111-1111-1111-111111111111', name: '2026-2027' };
  let settings = {
    schoolName: 'Institute Setup School',
    schoolAddress: 'School Road, Ahmedabad',
    automaticEmail: false,
    concurrencyStamp: 'version-1',
    idempotencyKey: 'previous-request',
  };
  const writes: Record<string, unknown>[] = [];
  await page.addInitScript((academicYear) => {
    localStorage.setItem(
      'persist:root',
      JSON.stringify({
        globalState: JSON.stringify({
          currentYear: academicYear,
          currentBoard: {},
          currentMedium: {},
        }),
        _persist: JSON.stringify({ version: -1, rehydrated: true }),
      })
    );
    localStorage.setItem('onboarding_completed', 'true');
  }, year);
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let body: unknown = { items: [], totalCount: 0 };
    if (url.pathname.endsWith('/auth/session'))
      body = {
        accessToken: 'synthetic-document-reviewer',
        expires: '2099-01-01T00:00:00Z',
        profile: { sub: 'document-reviewer', name: 'Document Reviewer', role: 'admin' },
      };
    else if (url.pathname.endsWith('/host/session-context'))
      body = {
        accountMode: 'tenant',
        tenantId: year.id,
        setupCompleted: true,
        canManageSetup: false,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      };
    else if (url.pathname.includes('permission-management'))
      body = {
        groups: [
          {
            name: 'Payslip & statement settings test',
            permissions: [
              'ShikshaMitra.Module.HR',
              'ShikshaMitra.Module.HR.Payroll',
              'ShikshaMitra.Module.HR.Payroll.Settings',
              'HR.PayrollManagement.Overview.View',
              'HR.PayrollManagement.GenerateSalarySlip.View',
              ...(canEdit ? ['HR.PayrollManagement.GenerateSalarySlip.Add'] : []),
            ].map((name) => ({ name, isGranted: true })),
          },
        ],
      };
    else if (url.pathname.includes('academic-year')) body = { items: [year], totalCount: 1 };
    else if (url.pathname.includes('user-scope-hierarchy'))
      body = { isAdmin: true, accessibleHierarchy: [] };
    else if (url.pathname.endsWith('/payroll/payslip-settings')) {
      if (request.method() === 'PUT') {
        const submitted = request.postDataJSON();
        writes.push(submitted);
        settings = { ...settings, ...submitted, concurrencyStamp: 'version-2' };
      }
      body = settings;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
  return writes;
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`payroll document settings move, save and navigation at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const writes = await mockPayrollDocuments(page);
    await page.goto(payslipsPath);
    const settingsLink = page.getByRole('link', { name: 'Payslip & statement settings', exact: true });
    await expect(settingsLink).toHaveAttribute('href', settingsPath);
    await expect(page.getByRole('button', { name: 'Payslip settings', exact: true })).toHaveCount(
      0
    );
    await expect(page.getByLabel('Loading payslip', { exact: true })).toHaveCount(0);
    if (viewport.width === 1440) {
      await expect(page.getByRole('link', { name: 'Overview', exact: true })).not.toHaveClass(
        /state--active/
      );
      await expect(page.getByRole('link', { name: 'Payslips', exact: true })).toHaveClass(
        /state--active/
      );
    }
    await settingsLink.click();
    await expect(
      page.getByRole('heading', { name: 'Payslip & statement settings', exact: true })
    ).toBeVisible();
    await expect(page.getByText('Institute Setup School', { exact: true })).toBeVisible();
    await expect(page.getByLabel('School name', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Open Institute Setup' })).toHaveAttribute(
      'href',
      '/setting/school-identity'
    );
    const switchBounds = await page.getByRole('switch').evaluateAll((inputs) =>
      inputs.map((input) => {
        const label = input.closest('label')!;
        let scrollArea = label.parentElement!;
        while (getComputedStyle(scrollArea).overflowY !== 'auto') {
          scrollArea = scrollArea.parentElement!;
        }
        const labelBounds = label.getBoundingClientRect();
        const areaBounds = scrollArea.getBoundingClientRect();
        return {
          label: label.textContent,
          contained: labelBounds.left >= areaBounds.left && labelBounds.right <= areaBounds.right,
          touchHeight: labelBounds.height,
        };
      })
    );
    expect(switchBounds).toHaveLength(6);
    for (const bounds of switchBounds) {
      expect(bounds.contained, `${bounds.label} should not be clipped`).toBe(true);
      expect(bounds.touchHeight, `${bounds.label} should be easy to tap`).toBeGreaterThanOrEqual(44);
    }
    await page.getByText('Staff details', { exact: true }).click();
    await expect(page.getByRole('switch', { name: 'Staff details', exact: true })).not.toBeChecked();
    await page.getByText('Bank details', { exact: true }).click();
    await expect(page.getByRole('switch', { name: 'Bank details', exact: true })).not.toBeChecked();
    await page.getByText('Zero-value deductions', { exact: true }).click();
    await expect(page.getByRole('switch', { name: 'Zero-value deductions', exact: true })).toBeChecked();
    const email = page.getByRole('switch', { name: emailLabel });
    await email.check();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
    expect(writes).toHaveLength(1);
    expect(writes[0]).not.toHaveProperty('schoolName');
    expect(writes[0]).not.toHaveProperty('schoolAddress');
    expect(writes[0].automaticEmail).toBe(true);
    expect(writes[0].presentation).toMatchObject({
      showStaffDetails: false,
      showBankDetails: false,
      showZeroDeductions: true,
    });
    await page.reload();
    await expect(email).toBeChecked();
    await expect(page.getByRole('switch', { name: 'Staff details', exact: true })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: 'Bank details', exact: true })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: 'Zero-value deductions', exact: true })).toBeChecked();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath('payroll-documents.png'),
      fullPage: true,
    });
    // The shared ProgressBar installs one same-URL history guard entry on mount.
    await page.goBack();
    await page.goBack();
    await expect(settingsLink).toBeVisible();
  });
}

test('view-only payroll document access cannot change settings', async ({ page }) => {
  const writes = await mockPayrollDocuments(page, false);
  await page.goto(settingsPath);
  await expect(page.getByRole('switch', { name: emailLabel })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  expect(writes).toHaveLength(0);
});
