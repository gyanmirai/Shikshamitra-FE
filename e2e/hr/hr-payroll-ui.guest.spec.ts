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
permissions.push('HR.PayrollManagement.RunPayroll.Lock');
permissions.push('HR.PayrollManagement.Settings.StatutorySchemes.ConfigureCalculation');
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
  options: {
    failReadiness?: boolean;
    delayDashboard?: boolean;
    zeroTaxRange?: boolean;
    missingPfBasis?: boolean;
    esiEnabled?: boolean;
    denyCalculation?: boolean;
  } = {}
) {
  let esiVersion = {
    id: 'ui-esic',
    enabled: Boolean(options.esiEnabled),
    registrationNumber: null,
    coveredSince: null,
    effectiveMonth: '2026-10',
    concurrencyStamp: 'ui-stamp',
    isCancelled: false,
    calculationSettings: {
      eligibilityBasis: 'CLASSIFIED_EARNINGS',
      calculationBasis: 'CLASSIFIED_EARNINGS',
    },
  };
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
    else if (path.endsWith('/host/session-context'))
      body = {
        accountMode: 'tenant',
        tenantId: '11111111-1111-1111-1111-111111111111',
        setupCompleted: true,
        canManageSetup: false,
        canViewTenants: false,
        canCreateTenants: false,
        canUpdateTenants: false,
        canManageTenantStatus: false,
      };
    else if (path.includes('permission-management'))
      body = {
        groups: [
          {
            name: 'Payroll UI test',
            permissions: permissions.map((name) => ({
              name,
              isGranted: !(options.denyCalculation && name.endsWith('.ConfigureCalculation')),
            })),
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
          totalCount: options.missingPfBasis ? 2 : 0,
          currentPage: 0,
          pageSize: 25,
          items: options.missingPfBasis
            ? [
                {
                  employeeId: 'ready-staff',
                  employeeName: 'Ready Test Staff',
                  employeeIdentifier: 'READY001',
                  totalWorkingDays: 22,
                  payableDays: 22,
                  fullGrossSalary: 10000,
                  grossSalary: 10000,
                  totalEarnings: 10000,
                  netPay: 10000,
                  reviewStatus: 'REVIEWED',
                  issueCodes: [],
                },
                {
                  employeeId: 'pf-staff',
                  employeeName: 'PF Test Staff',
                  employeeIdentifier: 'PF001',
                  totalWorkingDays: 22,
                  payableDays: 22,
                  fullGrossSalary: 10000,
                  grossSalary: 10000,
                  totalEarnings: 10000,
                  netPay: 10000,
                  reviewStatus: 'REVIEWED',
                  issueCodes: ['PF_WAGE_BASIS_REQUIRED'],
                },
              ]
            : [],
          readiness: options.missingPfBasis
            ? { ...readiness, blockingIssues: ['PF_WAGE_BASIS_REQUIRED'] }
            : readiness,
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
    } else if (path.includes('/esi/configuration')) {
      if (route.request().method() === 'PUT') {
        esiVersion = {
          ...esiVersion,
          ...route.request().postDataJSON(),
          concurrencyStamp: 'saved-stamp',
        };
      }
      body = {
        hasSchoolWideScope: true,
        suggestedEffectiveMonth: '2026-10',
        history: [esiVersion],
        current: esiVersion,
      };
    } else if (path.endsWith('/esi/rule'))
      body = { employeePercentage: 0.75, employerPercentage: 3.25 };
    else if (path.endsWith('/esi/component-treatments'))
      body = [
        {
          componentId: '22222222-2222-2222-2222-222222222222',
          componentName: 'School Basic',
          treatment: 'Included',
        },
      ];
    else if (path.endsWith('/esi/impact-preview'))
      body = {
        items: [],
        totalCount: 0,
        summary: {
          employeeCount: 0,
          employeesNeedingAttention: 0,
          coveredEmployeeCount: 0,
          employeeContributionTotal: 0,
          employerContributionTotal: 0,
          canActivate: true,
          blockingIssues: [],
        },
      };
    else if (path.includes('professional-taxes'))
      body = {
        items: [
          {
            id: 'ui-tax',
            jurisdictionCode: 'IN-GJ',
            effectiveFrom: '2026-04-01',
            fromSalary: options.zeroTaxRange ? 0 : 12000,
            toSalary: options.zeroTaxRange ? 12000 : null,
            taxAmount: options.zeroTaxRange ? 0 : 200,
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
  test('ESIC Basic basis and documented rates reach preview and save together', async ({
    page,
  }) => {
    await mockPayroll(page, { esiEnabled: true });
    await page.goto('/hr/payroll/setting/statutory-schemes');
    await page.getByRole('combobox', { name: /^ESIC eligibility basis/ }).click();
    await page.getByRole('option', { name: 'Gross salary', exact: true }).click();
    await page.getByRole('combobox', { name: /^ESIC calculation basis/ }).click();
    await page.getByRole('option', { name: 'Basic salary', exact: true }).click();
    await expect(page.getByRole('combobox', { name: /^ESIC eligibility basis/ })).toHaveText(
      'Gross salary'
    );
    await page.getByRole('combobox', { name: 'Basic salary component', exact: true }).click();
    await page.getByRole('option', { name: 'School Basic', exact: true }).click();
    await page.getByRole('switch', { name: 'Use administrator rate override' }).check();
    await page.getByLabel('Employee ESIC rate (%)', { exact: true }).fill('0.5');
    await page.getByLabel('Employer ESIC rate (%)', { exact: true }).fill('4');
    await page.getByLabel('Rate override reason', { exact: true }).fill('Synthetic policy review');
    const previewRequest = page.waitForRequest(
      (request) =>
        request.url().includes('/esi/impact-preview') &&
        Boolean(request.postDataJSON()?.configurationDraft?.calculationSettings?.evidenceReference)
    );
    await page
      .getByLabel('Supporting evidence reference', { exact: true })
      .fill('Synthetic policy reference');
    expect(
      (await previewRequest).postDataJSON().configurationDraft.calculationSettings
    ).toMatchObject({
      eligibilityBasis: 'GROSS',
      calculationBasis: 'BASIC_COMPONENT',
      employeePercentage: 0.5,
      employerPercentage: 4,
    });
    const saved = page.waitForRequest(
      (request) => request.method() === 'PUT' && request.url().includes('/esi/configuration')
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect((await saved).postDataJSON()).toMatchObject({
      effectiveMonth: '2026-10',
      calculationSettings: {
        eligibilityBasis: 'GROSS',
        calculationBasis: 'BASIC_COMPONENT',
        basicComponentId: '22222222-2222-2222-2222-222222222222',
        employeePercentage: 0.5,
        employerPercentage: 4,
        overrideReason: 'Synthetic policy review',
        evidenceReference: 'Synthetic policy reference',
      },
    });
    await expect(page.getByText('ESIC settings saved.', { exact: true })).toBeVisible();
    await expectCompactActions(page);
  });

  test('ESIC calculation controls require ConfigureCalculation even for an administrator', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockPayroll(page, { esiEnabled: true, denyCalculation: true });
    await page.goto('/hr/payroll/setting/statutory-schemes');
    await expect(page.getByLabel('ESIC eligibility basis', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('ESIC calculation basis', { exact: true })).toBeDisabled();
    await expect(page.getByRole('switch', { name: 'Enable ESIC for payroll' })).toBeDisabled();
    await expect(
      page.getByRole('switch', { name: 'Use administrator rate override' })
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'About ESIC salary bases' }).focus();
    await expect(page.getByRole('tooltip')).toContainText(
      'Other statutory inclusions and adjustments still apply'
    );
    expect(
      await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  for (const width of [390, 768, 1440]) {
    test(`ESIC compact settings preserve independent bases and rates at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await mockPayroll(page, { esiEnabled: true });
      await page.goto('/hr/payroll/setting/statutory-schemes');
      const enabled = page.getByRole('switch', { name: 'Enable ESIC for payroll' });
      await expect(enabled).toHaveAccessibleDescription(
        'Activate statutory ESIC calculations for eligible employees in payroll.'
      );
      await expect(page.getByText('Active', { exact: true })).toBeVisible();
      await enabled.uncheck();
      await expect(page.getByText('Inactive', { exact: true })).toBeVisible();
      await enabled.check();
      await expect(page.getByText('Active', { exact: true })).toBeVisible();
      const basis = page.getByRole('combobox', { name: /^ESIC calculation basis/ });
      const eligibility = page.getByRole('combobox', { name: /^ESIC eligibility basis/ });
      await expect(basis).toHaveText('Included salary components');
      await expect(page.getByText('Employee 0.75%', { exact: true })).toBeVisible();
      await expect(page.getByText('Employer 3.25%', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Rate override reason', { exact: true })).toHaveCount(0);
      await eligibility.click();
      await page.getByRole('option', { name: 'Gross salary', exact: true }).click();
      await expect(basis).toHaveText('Included salary components');
      await basis.click();
      await page.getByRole('option', { name: 'Basic salary', exact: true }).click();
      await page.getByRole('combobox', { name: 'Basic salary component', exact: true }).click();
      await page.getByRole('option', { name: 'School Basic', exact: true }).click();
      await eligibility.click();
      await page.getByRole('option', { name: 'Basic salary', exact: true }).click();
      await expect(basis).toHaveText('Basic salary');
      await expect(page.getByRole('combobox', { name: /^Basic salary component/ })).toHaveText(
        'School Basic'
      );
      await basis.click();
      await page.getByRole('option', { name: 'Gross salary', exact: true }).click();
      await expect(eligibility).toHaveText('Basic salary');
      await expect(page.getByRole('combobox', { name: /^Basic salary component/ })).toHaveText(
        'School Basic'
      );
      await eligibility.click();
      await page.getByRole('option', { name: 'Gross salary', exact: true }).click();
      await expect(basis).toHaveText('Gross salary');
      await expect(page.getByRole('combobox', { name: /^Basic salary component/ })).toHaveCount(0);
      expect(
        await page.locator('body').evaluate((element) => element.scrollWidth <= window.innerWidth)
      ).toBe(true);
      await page.getByRole('button', { name: 'Save', exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeInViewport();
      await expectCompactActions(page);
    });
  }

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

  test('missing PF basis stays critical and fully readable in a narrow staff drawer', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockPayroll(page, { missingPfBasis: true });
    await page.goto('/hr/payroll/run-payroll');
    const lockReviewed = page.getByRole('button', { name: 'Lock Reviewed', exact: true });
    const readyStaff = page.getByRole('checkbox', { name: 'Select payroll for Ready Test Staff' });
    await readyStaff.check();
    await expect(lockReviewed).toBeEnabled();
    await readyStaff.uncheck();
    await page.getByRole('checkbox', { name: 'Select payroll for PF Test Staff' }).check();
    await expect(lockReviewed).toBeDisabled();
    await page
      .getByRole('row', { name: /PF Test Staff/ })
      .getByRole('button', { name: 'View', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('CRITICAL', { exact: true })).toBeVisible();
    const warning = dialog.getByText(
      'PF wage basis required. Update the salary structure to match the assigned PF rule.',
      { exact: true }
    );
    await expect(warning).toBeVisible();
    const dimensions = await warning.evaluate((element) => ({
      width: element.clientWidth,
      contentWidth: element.scrollWidth,
      height: element.clientHeight,
      contentHeight: element.scrollHeight,
    }));
    expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.width + 1);
    expect(dimensions.contentHeight).toBeLessThanOrEqual(dimensions.height + 1);
    await page.getByRole('button', { name: 'close', exact: true }).click();
    await page.getByRole('button', { name: 'View readiness', exact: true }).click();
    await expect(
      page
        .getByRole('dialog')
        .getByText(
          'PF wage basis required. Update the salary structure to match the assigned PF rule.',
          { exact: true }
        )
    ).toBeVisible();
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

  test('editing professional tax retains zero salary and zero tax amounts', async ({ page }) => {
    await mockPayroll(page, { zeroTaxRange: true });
    await page.goto('/hr/payroll/setting/professional-tax');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.locator('[role="dialog"] form')).toHaveCount(1);
    await expect(page.getByLabel('From Salary', { exact: true })).toHaveValue('₹ 0');
    await expect(page.getByLabel('Tax Amount', { exact: true })).toHaveValue('₹ 0');
    const update = page.waitForRequest(
      (request) => request.method() === 'PUT' && request.url().includes('/professional-taxes/')
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    expect((await update).postDataJSON()).toMatchObject({
      fromSalary: 0,
      toSalary: 12000,
      taxAmount: 0,
    });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
