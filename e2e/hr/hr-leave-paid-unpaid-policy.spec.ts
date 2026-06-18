/* eslint-disable import/no-extraneous-dependencies */
import { test, expect, type Page, type Route, type Locator } from '@playwright/test';

const academicYear = {
  id: 'year-paid-unpaid-e2e',
  name: '2026-27',
  startDate: '2026-06-01T00:00:00Z',
  endDate: '2027-05-31T23:59:59Z',
};

const employee = {
  id: 'employee-paid-unpaid-e2e',
  fullName: 'Paid Unpaid Teacher',
  employeeCode: 'EMP-PU-001',
  status: 0,
  employeeStatusType: 0,
};

const createdPolicy = {
  id: 'leave-policy-paid-unpaid-e2e',
  academicYearId: academicYear.id,
  policyTitle: 'E2E Paid Unpaid Policy',
  name: 'E2E Paid Unpaid Policy',
  status: 'Active',
  isDefault: true,
  effectiveFrom: academicYear.startDate,
  effectiveTo: null,
  rules: [
    {
      id: 'paid-rule-e2e',
      paidType: 'Paid',
      entitlementMode: 'Limited',
      leaveCount: 12,
      accrualPolicyType: 'Yearly',
      requiresApproval: true,
      allowHalfDay: true,
      allowNegativeBalance: false,
      carryForward: false,
      encashmentAllowed: false,
      isActive: true,
    },
    {
      id: 'unpaid-rule-e2e',
      paidType: 'Unpaid',
      entitlementMode: 'Unlimited',
      leaveCount: null,
      accrualPolicyType: 'Yearly',
      requiresApproval: true,
      allowHalfDay: true,
      allowNegativeBalance: true,
      carryForward: false,
      encashmentAllowed: false,
      isUnlimited: true,
      isActive: true,
    },
  ],
};

function seedAcademicYear(page: Page) {
  return page.addInitScript(
    ({ year, authEmployee, permissions }) => {
      window.localStorage.setItem(
        'persist:root',
        JSON.stringify({
          globalState: JSON.stringify({
            currentYear: year,
            currentBoard: {},
            currentMedium: {},
          }),
          auth: JSON.stringify({
            user: {
              sub: 'paid-unpaid-user-e2e',
              name: 'Paid Unpaid HR User',
              role: 'hr-manager',
            },
            isAuthenticated: true,
            loading: false,
            permissionsInitialized: true,
            employee: authEmployee,
            permissions,
            mainModuleVisibility: [false, false, false, false, true],
          }),
          _persist: JSON.stringify({ version: -1, rehydrated: true }),
        })
      );
      window.localStorage.setItem('onboarding_completed', 'true');
    },
    {
      year: academicYear,
      authEmployee: employee,
      permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
    }
  );
}

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(json),
  });
}

const grantedPermissions = [
  'ShikshaMitra.Module.HR',
  'ShikshaMitra.Module.HR.Policies',
  'ShikshaMitra.Module.HR.AttendanceManagement',
  'ShikshaMitra.Module.HR.LeaveManagement',
  'HR.LeaveManagement.Setting.LeavePolicy',
  'HR.LeaveManagement.LeaveCenter',
  'HR.Policies.View',
  'HR.Policies.Add',
  'HR.Policies.Edit',
  'HR.Policies.SetDefault',
];

async function installPermissionRoutes(page: Page) {
  await page.route('**/api/auth/session**', (route) =>
    fulfillJson(route, {
      accessToken: 'paid-unpaid-token-e2e',
      expires: '2099-01-01T00:00:00.000Z',
      profile: {
        sub: 'paid-unpaid-user-e2e',
        name: 'Paid Unpaid HR User',
        role: 'hr-manager',
      },
    })
  );
  await page.route('**/api/employees/me**', (route) => fulfillJson(route, employee));
  await page.route('**/api/app/education-board**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/academic-organization-options**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/app/user-scope/user-scope-hierarchy**', (route) =>
    fulfillJson(route, { isAdmin: true, accessibleHierarchy: [] })
  );
  await page.route('**/permission-management/permissions?**', (route) =>
    fulfillJson(route, {
      groups: [
        {
          name: 'HR E2E',
          permissions: grantedPermissions.map((name) => ({ name, isGranted: true })),
        },
      ],
    })
  );
}

async function installLeavePolicyRoutes(
  page: Page,
  state: { createPayload?: any; updatePayload?: any }
) {
  await installPermissionRoutes(page);

  await page.route('**/api/hr-leave-types**', async (route) => {
    throw new Error(`HR leave type endpoint should not be called: ${route.request().url()}`);
  });

  await page.route('**/api/app/academic-year?**', (route) =>
    fulfillJson(route, { items: [academicYear], totalCount: 1 })
  );

  await page.route('**/api/leave-policies**', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());

    if (method === 'GET') {
      const isSinglePolicy = /\/api\/leave-policies\/[^/?]+$/.test(url.pathname);
      await fulfillJson(route, isSinglePolicy ? createdPolicy : { items: [], totalCount: 0 });
      return;
    }

    if (method === 'POST') {
      state.createPayload = request.postDataJSON();
      await fulfillJson(route, { ...createdPolicy, ...state.createPayload });
      return;
    }

    if (method === 'PUT') {
      state.updatePayload = request.postDataJSON();
      await fulfillJson(route, { ...createdPolicy, ...state.updatePayload });
      return;
    }

    await fulfillJson(route, {});
  });
}

async function installLeaveCenterRoutes(
  page: Page,
  state: { paidForm?: string; unpaidForm?: string }
) {
  await installPermissionRoutes(page);

  await page.route('**/api/hr-leave-types**', async (route) => {
    throw new Error(`HR leave type endpoint should not be called: ${route.request().url()}`);
  });

  await page.route('**/api/app/academic-year?**', (route) =>
    fulfillJson(route, { items: [academicYear], totalCount: 1 })
  );
  await page.route('**/api/employees/me', (route) => fulfillJson(route, employee));
  await page.route('**/api/employees/reporting-manager/my/employees', (route) =>
    fulfillJson(route, { employees: [employee] })
  );
  await page.route('**/api/employees?**', (route) =>
    fulfillJson(route, { items: [employee], totalCount: 1 })
  );
  await page.route('**/api/hr/policy-assignment-preview?**', (route) =>
    fulfillJson(route, {
      employeeId: employee.id,
      academicYearId: academicYear.id,
      date: '2026-07-15',
      leavePolicy: createdPolicy,
    })
  );
  await page.route('**/api/leave-management/balances?**', (route) =>
    fulfillJson(route, {
      items: [
        {
          paidType: 'Paid',
          entitledDays: 12,
          usedDays: 0,
          pendingDays: 0,
          remainingDays: 12,
          isUnlimited: false,
        },
        {
          paidType: 'Unpaid',
          entitlementMode: 'Unlimited',
          entitledDays: null,
          usedDays: 0,
          pendingDays: 0,
          remainingDays: null,
          isUnlimited: true,
        },
      ],
    })
  );
  await page.route('**/api/leave-management/my/balances?**', (route) =>
    fulfillJson(route, { items: [] })
  );
  await page.route('**/api/leave-management/calendar?**', (route) =>
    fulfillJson(route, { items: [], totalCount: 0 })
  );
  await page.route('**/api/leave-management**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const body = request.postData() || '';
      if (body.includes('name="paidType"\r\n\r\nUnpaid')) {
        state.unpaidForm = body;
      } else {
        state.paidForm = body;
      }
      await fulfillJson(route, {
        id: `leave-${state.unpaidForm ? 'unpaid' : 'paid'}-e2e`,
        employeeId: employee.id,
        paidType: state.unpaidForm ? 'Unpaid' : 'Paid',
        status: 'Pending',
      });
      return;
    }

    await fulfillJson(route, { items: [], totalCount: 0 });
  });
}

async function selectDialogComboboxOption(dialog: Locator, index: number, option: RegExp) {
  await dialog.getByRole('combobox').nth(index).click();
  await dialog.page().getByRole('option', { name: option }).click();
}

async function fillSegmentedDate(dialog: Locator, label: RegExp, displayDate: string) {
  const [day, month, year] = displayDate.split('/');
  const group = dialog.getByRole('group', { name: label }).first();
  await group.getByRole('spinbutton', { name: /^Day$/i }).fill(day);
  await group.getByRole('spinbutton', { name: /^Month$/i }).fill(month);
  await group.getByRole('spinbutton', { name: /^Year$/i }).fill(year);
}

function futureLeaveDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  const display = `${String(date.getDate()).padStart(2, '0')}/${String(
    date.getMonth() + 1
  ).padStart(2, '0')}/${date.getFullYear()}`;
  return { display };
}

test.describe('HR paid/unpaid leave policy workflow', () => {
  test.beforeEach(async ({ page }) => {
    await seedAcademicYear(page);
  });

  test('removes HR leave type UI and submits fixed Paid/Unpaid policy buckets', async ({
    page,
  }) => {
    const state: { createPayload?: any; updatePayload?: any } = {};
    await installLeavePolicyRoutes(page, state);

    await page.goto('/hr/leave-policies', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Leave Policies/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Leave Types/i })).toHaveCount(0);
    await expect(page.getByText(/Rule Buckets/i)).toHaveCount(0);

    await page.getByRole('button', { name: /New Leave Policy/i }).click();
    const policyDialog = page.getByRole('dialog');
    await expect(policyDialog.getByText(/Rule Buckets/i)).toBeVisible();
    await expect(policyDialog.getByRole('heading', { name: /^Paid leave rule$/i })).toBeVisible();
    await expect(policyDialog.getByRole('heading', { name: /^Unpaid leave rule$/i })).toBeVisible();
    await expect(policyDialog.getByLabel(/Entitlement/i)).toBeVisible();
    await expect(policyDialog.getByRole('checkbox', { name: /Encashable/i })).toHaveCount(1);

    await policyDialog
      .getByRole('textbox', { name: /Policy Name/i })
      .fill(createdPolicy.policyTitle);
    await policyDialog.getByRole('spinbutton', { name: /^Days \*$/i }).fill('12');
    await policyDialog.getByRole('button', { name: /^Submit$/i }).click();

    await expect.poll(() => state.createPayload).toBeTruthy();
    expect(state.createPayload.rules).toHaveLength(2);
    expect(state.createPayload.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paidType: 'Paid',
          entitlementMode: 'Limited',
          leaveCount: 12,
        }),
        expect.objectContaining({
          paidType: 'Unpaid',
          entitlementMode: 'Unlimited',
          leaveCount: null,
          carryForward: false,
          encashmentAllowed: false,
        }),
      ])
    );
    expect(JSON.stringify(state.createPayload)).not.toContain('leaveTypeId');
  });

  test('applies Paid and Unpaid leave with paidType FormData only', async ({ page }) => {
    const state: { paidForm?: string; unpaidForm?: string } = {};
    await installLeaveCenterRoutes(page, state);
    const leaveDate = futureLeaveDate();

    await page.goto('/hr/leave-center?tab=my-requests', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Apply Leave|Leave Center/i })).toBeVisible();

    const submitLeaveRequest = async (paidType: 'Paid' | 'Unpaid', reason: string) => {
      await page.getByRole('button', { name: /Leave Request/i }).click();
      const requestDialog = page.getByRole('dialog');
      await requestDialog.getByRole('combobox', { name: /Employee \*/i }).fill(employee.fullName);
      await page.getByRole('option', { name: new RegExp(employee.fullName, 'i') }).click();
      await expect(requestDialog.getByText(/Effective leave policy/i)).toBeVisible();
      await selectDialogComboboxOption(requestDialog, 1, new RegExp(`^${paidType}$`, 'i'));
      await fillSegmentedDate(requestDialog, /Start Date/i, leaveDate.display);
      await fillSegmentedDate(requestDialog, /End Date/i, leaveDate.display);
      await requestDialog.getByLabel(/Reason for leave/i).fill(reason);
      await requestDialog.getByRole('button', { name: /^Submit$/i }).click();
      await expect
        .poll(() => (paidType === 'Paid' ? state.paidForm : state.unpaidForm))
        .toBeTruthy();
    };

    await submitLeaveRequest('Paid', 'Sick leave');
    await submitLeaveRequest('Unpaid', 'Family emergency');

    expect(state.paidForm).toContain('name="paidType"\r\n\r\nPaid');
    expect(state.paidForm).toContain('name="reason"\r\n\r\nSick leave');
    expect(state.unpaidForm).toContain('name="paidType"\r\n\r\nUnpaid');
    expect(state.unpaidForm).toContain('name="reason"\r\n\r\nFamily emergency');
    expect(`${state.paidForm}${state.unpaidForm}`).not.toContain('leaveTypeId');
    expect(`${state.paidForm}${state.unpaidForm}`).not.toContain('leaveTypeMasterId');
  });
});
