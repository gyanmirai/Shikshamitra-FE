/* eslint-disable import/no-extraneous-dependencies, no-await-in-loop, no-restricted-syntax */
import { test, expect, type Page } from '@playwright/test';

const year = {
  id: '11111111-1111-1111-1111-111111111111',
  name: '2026-27',
  startDate: '2026-06-01',
  endDate: '2027-05-31',
};
const permissions = [
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.HR.Payroll',
  'ShikshaMitra.Module.HR.Payroll.Settings',
  'HR.PayrollManagement.Overview',
  'HR.PayrollManagement.Dashboard',
  'HR.PayrollManagement.RunPayroll',
  'HR.PayrollManagement.GenerateSalarySlip',
  'HR.PayrollManagement.PayrollStructure',
  'HR.PayrollManagement.Settings.EarningComponents',
  'HR.PayrollManagement.Settings.DeductionComponents',
  'HR.PayrollManagement.Settings.PfRule',
  'HR.PayrollManagement.Settings.ProfessionalTax',
  'HR.PayrollManagement.Settings.SalaryTemplates',
  'HR.PayrollManagement.Settings.StatutorySchemes',
  'HR.PayrollManagement.Settings.StatutorySchemes.Edit',
  'HR.PayrollManagement.Settings.StatutorySchemes.Activate',
  'HR.PayrollManagement.Settings.SalaryTemplates.Add',
].flatMap((name) => [name, `${name}.View`, `${name}.Add`, `${name}.Edit`]);
const readiness = {
  month: '2026-10',
  employeeCount: 3,
  snapshotCount: 3,
  reviewedCount: 1,
  lockedCount: 0,
  attendanceFoundCount: 3,
  missingAttendanceCount: 0,
  missingSalaryStructureCount: 2,
  policyConfigurationIssueCount: 1,
  canPreview: true,
  canLock: false,
  netPayTotal: 45000,
  blockingIssues: ['Two staff need salary setup.'],
  recommendedActions: [],
};

async function mockPayroll(
  page: Page,
  options: { failReadiness?: boolean; delayDashboard?: boolean } = {}
) {
  await page.clock.setFixedTime(new Date('2026-10-09T04:00:00Z'));
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
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { items: [], totalCount: 0 };
    let status = 200;
    if (path.endsWith('/auth/session'))
      body = {
        accessToken: 'payroll-ui-e2e-only',
        expires: '2099-01-01T00:00:00Z',
        profile: { sub: 'payroll-ui-reviewer', name: 'Payroll UI Reviewer', role: 'admin' },
      };
    else if (path.includes('permission-management'))
      body = {
        groups: [
          {
            name: 'Payroll UI test',
            permissions: permissions.map((name) => ({ name, isGranted: true })),
          },
        ],
      };
    else if (path.includes('academic-year')) body = { items: [year], totalCount: 1 };
    else if (path.includes('user-scope-hierarchy'))
      body = { isAdmin: true, accessibleHierarchy: [] };
    else if (path.includes('/hr/dashboard/previews')) {
      if (options.delayDashboard) await new Promise((resolve) => setTimeout(resolve, 1500));
      body = {
        dashboardKey: 'Payroll',
        status: 'Ready',
        payloadVersion: 1,
        payloadJson: JSON.stringify({ ...readiness, pendingCount: 3 }),
        lastSuccessfulRefreshAt: '2026-10-09T04:00:00Z',
      };
    } else if (path.includes('/payroll/run/previews')) {
      if (options.failReadiness) {
        status = 500;
        body = { error: { message: 'Readiness could not be loaded.' } };
      } else if (path.endsWith('/employees'))
        body = {
          previewRunId: 'ui-preview',
          isCurrent: true,
          isGenerated: false,
          totalCount: 0,
          currentPage: 0,
          pageSize: 25,
          items: [],
          readiness,
        };
      else
        body = {
          id: 'ui-preview',
          month: '2026-10',
          academicYearId: year.id,
          status: 'SUCCEEDED',
          employeeCount: 3,
          completedEmployees: 3,
          isCurrent: true,
          errorCode: null,
          errorMessage: null,
        };
    } else if (path.includes('/esi/configuration'))
      body = {
        hasSchoolWideScope: true,
        suggestedEffectiveMonth: '2026-10',
        history: [],
        current: {
          id: 'ui-esic',
          enabled: false,
          registrationNumber: null,
          coveredSince: null,
          effectiveMonth: '2026-10',
          concurrencyStamp: 'ui-stamp',
          isCancelled: false,
        },
      };
    else if (path.includes('professional-taxes'))
      body = {
        items: [
          {
            id: 'ui-tax',
            jurisdictionCode: 'GJ',
            effectiveFrom: '2026-04-01',
            fromSalary: 12000,
            toSalary: null,
            taxAmount: 200,
            isActive: true,
            deductInCessationMonth: true,
          },
        ],
        totalCount: 1,
      };
    else if (path.includes('salary-templates') || path.includes('component-catalog')) body = [];
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

async function expectCompactActions(page: Page, root = 'main', hasActions = true) {
  const buttons = page.locator(`${root} .MuiButton-root`);
  if (hasActions) await expect(buttons.first()).toBeVisible();
  await expect(async () => {
    const measured = await buttons.evaluateAll((elements) =>
      elements
        .map((element) => ({
          label: element.textContent?.trim(),
          height: element.getBoundingClientRect().height,
        }))
        .filter((button) => button.height > 0)
    );
    if (hasActions) expect(measured.length).toBeGreaterThan(0);
    for (const button of measured)
      expect(button.height, `${button.label} height`).toBeCloseTo(30, 0);
  }).toPass({ timeout: 15000 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  ).toBe(true);
}

test.describe('Payroll interface consistency', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  const screens = [
    ['/hr/payroll', 'Overview'],
    ['/hr/payroll/dashboard', 'Payroll Dashboard'],
    ['/hr/payroll/run-payroll', 'Run Payroll'],
    ['/hr/payroll/payslip-generation', 'Payslips'],
    ['/hr/payroll/structure', 'Payroll Structure'],
    ['/hr/payroll/setting/earning-component', 'Earning Component'],
    ['/hr/payroll/setting/deduction-component', 'Deduction Component'],
    ['/hr/payroll/setting/pf', 'PF Rule'],
    ['/hr/payroll/setting/professional-tax', 'Professional tax'],
    ['/hr/payroll/setting/salary-templates', 'Salary Templates'],
    ['/hr/payroll/setting/salary-templates/new', 'Create Salary Template'],
    ['/hr/payroll/setting/statutory-schemes', 'Statutory Schemes'],
  ];
  for (const width of [390, 768, 1440]) {
    for (const mode of ['light', 'dark']) {
      test(`${mode} payroll actions and layouts at ${width}px @visual`, async ({ page }) => {
        test.setTimeout(240000);
        await page.setViewportSize({ width, height: width === 1440 ? 900 : 1024 });
        await page.addInitScript((colorScheme) => {
          localStorage.setItem('theme-mode', colorScheme);
          localStorage.setItem('app-settings', JSON.stringify({ colorScheme }));
        }, mode);
        await mockPayroll(page);
        for (const [path, heading] of screens) {
          await page.goto(path);
          await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
          if (path === '/hr/payroll')
            await expect(page.getByText('Missing salary structure (2)')).toBeVisible();
          if (path === '/hr/payroll/dashboard')
            await expect(page.getByText('Missing salary structure', { exact: true })).toBeVisible();
          if (path.endsWith('/professional-tax'))
            await expect(page.getByText('No upper limit', { exact: true })).toBeVisible();
          await expectCompactActions(page, 'main', !path.endsWith('/structure'));
          await expect(page.locator('html')).toHaveAttribute('data-mui-color-scheme', mode);
          await page.screenshot({
            path: `.artifacts/payroll-ui/${mode}-${width}-${path.split('/').pop() || 'overview'}.png`,
            fullPage: true,
          });
        }
      });
    }
  }

  test('readiness blockers lead to salary setup and payroll policy workflows', async ({ page }) => {
    await mockPayroll(page);
    await page.goto('/hr/payroll');
    await expect(page.getByText('Missing salary structure (2)')).toBeVisible();
    await expect(page.getByText('Payroll policy issues (1)')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Review salary setup' })).toHaveAttribute(
      'href',
      '/hr/payroll/structure'
    );
    await expect(page.getByRole('link', { name: 'Review payroll policies' })).toHaveAttribute(
      'href',
      '/hr/payrollPolicies'
    );
  });

  test('failed readiness does not show zero counts or a clear cycle', async ({ page }) => {
    await mockPayroll(page, { failReadiness: true });
    await page.goto('/hr/payroll');
    await expect(page.getByText(/Could not load payroll readiness/)).toBeVisible();
    await expect(page.getByText('Unavailable', { exact: true })).toHaveCount(4);
    await expect(page.getByText(/No readiness blockers/)).toHaveCount(0);
  });

  test('dashboard retains one header while loading and after readiness arrives', async ({
    page,
  }) => {
    await mockPayroll(page, { delayDashboard: true });
    await page.goto('/hr/payroll/dashboard');
    await expect(page.getByRole('heading', { name: 'Payroll Dashboard', exact: true })).toHaveCount(
      1
    );
    await expect(page.locator('main [data-layout="inline"]')).toHaveCount(1);
    await expect(page.getByText('Missing salary structure', { exact: true })).toBeVisible();
    await expect(page.locator('main [data-layout="inline"]')).toHaveCount(1);
  });

  test('professional tax shows an open upper bound and compact dialog actions', async ({
    page,
  }) => {
    await mockPayroll(page);
    await page.goto('/hr/payroll/setting/professional-tax');
    await expect(page.getByText('No upper limit', { exact: true })).toBeVisible();
    await expect(page.getByText(/NaN/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Add tax range', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectCompactActions(page, '[role="dialog"]');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
